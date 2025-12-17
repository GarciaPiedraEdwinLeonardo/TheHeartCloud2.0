import {
  doc,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  getDoc,
  writeBatch,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "./../../../../config/firebase";
import { usePostUpload } from "./usePostUpload";
import { notificationService } from "./../../../notifications/services/notificationService";

export const usePostActions = () => {
  const user = auth.currentUser;
  const { deleteFromCloudinary } = usePostUpload();

  // Función auxiliar para eliminar imágenes de un post
  const deletePostImages = async (images) => {
    if (!images || images.length === 0) return;

    const deletionPromises = images.map(async (image) => {
      if (image.url) {
        await deleteFromCloudinary(image.url);
      }
    });

    await Promise.allSettled(deletionPromises);
  };

  // Función auxiliar para verificar permisos
  const checkPostPermissions = async (postId) => {
    if (!user) throw new Error("Debes iniciar sesión");

    const postRef = doc(db, "posts", postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) throw new Error("Publicación no encontrada");

    const postData = postDoc.data();
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    // Verificar si puede modificar (autor, moderador o admin)
    const isAuthor = postData.authorId === user.uid;
    const isModeratorOrAdmin = ["moderator", "admin"].includes(userData?.role);
    const isForumModerator = await checkForumModeration(postData.forumId);

    if (!isAuthor && !isModeratorOrAdmin && !isForumModerator) {
      throw new Error("No tienes permisos para modificar esta publicación");
    }

    return {
      postData,
      userData,
      isAuthor,
      isModeratorOrAdmin,
      isForumModerator,
    };
  };

  // Verificar si es moderador del foro
  const checkForumModeration = async (forumId) => {
    try {
      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) return false;

      const forumData = forumDoc.data();
      return forumData.moderators && forumData.moderators[user.uid];
    } catch (error) {
      return false;
    }
  };

  // Crear nuevo post
  const createPost = async (postData) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión para publicar");

      // Verificar que el usuario puede publicar (doctor o superior)
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (!["doctor", "moderator", "admin"].includes(userData?.role)) {
        throw new Error("Solo usuarios verificados pueden publicar");
      }

      const newPost = {
        title: postData.title,
        content: postData.content,
        authorId: user.uid,
        forumId: postData.forumId,
        createdAt: serverTimestamp(),
        updatedAt: null,
        likes: [],
        dislikes: [],
        images: postData.images || [],
        stats: {
          commentCount: 0,
          viewCount: 0,
        },
        status: postData.status || "active",
      };

      const docRef = await addDoc(collection(db, "posts"), newPost);

      // Solo incrementar el contador si el post está activo
      if (newPost.status === "active") {
        // Actualizar contador de posts en el foro
        await updateDoc(doc(db, "forums", postData.forumId), {
          postCount: increment(1),
          lastPostAt: serverTimestamp(),
        });
      }

      // Actualizar estadísticas del usuario
      await updateDoc(doc(db, "users", user.uid), {
        "stats.postCount": increment(1),
        "stats.contributionCount": increment(1),
      });

      return { success: true, postId: docRef.id };
    } catch (error) {
      console.error("Error creando post:", error);
      return { success: false, error: error.message };
    }
  };

  // Editar post
  const editPost = async (postId, updates) => {
    try {
      const { postData } = await checkPostPermissions(postId);

      // Si se están actualizando las imágenes, eliminar las antiguas de Cloudinary
      if (updates.images) {
        const oldImages = postData.images || [];
        const newImages = updates.images || [];

        // Encontrar imágenes que se eliminaron
        const oldImageUrls = oldImages.map((img) => img.url);
        const newImageUrls = newImages.map((img) => img.url);
        const imagesToDelete = oldImages.filter(
          (img) => !newImageUrls.includes(img.url)
        );

        // Eliminar imágenes antiguas de Cloudinary
        if (imagesToDelete.length > 0) {
          await deletePostImages(imagesToDelete);
        }
      }

      const postRef = doc(db, "posts", postId);

      await updateDoc(postRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error editando post:", error);
      return { success: false, error: error.message };
    }
  };

  const deletePostComments = async (postId) => {
    try {
      // Buscar todos los comentarios del post
      const commentsQuery = query(
        collection(db, "comments"),
        where("postId", "==", postId)
      );

      const commentsSnapshot = await getDocs(commentsQuery);
      const batch = writeBatch(db);

      // Eliminar cada comentario
      commentsSnapshot.forEach((commentDoc) => {
        batch.delete(commentDoc.ref);
      });

      await batch.commit();

      return { success: true, deletedComments: commentsSnapshot.size };
    } catch (error) {
      console.error("Error eliminando comentarios del post:", error);
      return { success: false, error: error.message };
    }
  };

  // Eliminar post
  const deletePost = async (postId) => {
    try {
      const { postData, isAuthor, isModeratorOrAdmin, isForumModerator } =
        await checkPostPermissions(postId);

      // Determinar si es eliminación por moderador
      const isModeratorDeletion =
        !isAuthor && (isModeratorOrAdmin || isForumModerator);

      // PRIMERO: Contar comentarios antes de eliminarlos
      const commentsQuery = query(
        collection(db, "comments"),
        where("postId", "==", postId)
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const authorsMap = new Map();

      // Contar comentarios por autor ANTES de eliminarlos
      commentsSnapshot.forEach((commentDoc) => {
        const commentData = commentDoc.data();
        const authorId = commentData.authorId;
        if (authorId) {
          authorsMap.set(authorId, (authorsMap.get(authorId) || 0) + 1);
        }
      });

      const deletedCommentsCount = commentsSnapshot.size;

      // SEGUNDO: Eliminar comentarios del post
      await deletePostComments(postId);

      // TERCERO: Eliminar imágenes del post de Cloudinary
      if (postData.images && postData.images.length > 0) {
        await deletePostImages(postData.images);
      }

      // CUARTO: Actualizar estadísticas de autores de comentarios
      let updatedAuthorsCount = 0;
      if (deletedCommentsCount > 0) {
        const batch = writeBatch(db);
        for (const [authorId, commentCount] of authorsMap) {
          const authorRef = doc(db, "users", authorId);
          batch.update(authorRef, {
            "stats.commentCount": increment(-commentCount),
            "stats.contributionCount": increment(-commentCount),
          });
          updatedAuthorsCount++;
        }
        await batch.commit();
      }

      // QUINTO: Eliminar el post definitivamente y actualizar contadores
      const batch = writeBatch(db);

      // Eliminar post
      const postRef = doc(db, "posts", postId);
      batch.delete(postRef);

      // Actualizar contador del foro (solo si estaba activo)
      if (postData.status === "active") {
        const forumRef = doc(db, "forums", postData.forumId);
        batch.update(forumRef, {
          postCount: increment(-1),
        });
      }

      // Actualizar estadísticas del autor del post
      if (postData.authorId) {
        const authorRef = doc(db, "users", postData.authorId);
        batch.update(authorRef, {
          "stats.postCount": increment(-1),
          "stats.contributionCount": increment(-1),
        });
      }

      await batch.commit();

      // SEXTO: Enviar notificación si es eliminación por moderador
      if (
        isModeratorDeletion &&
        postData.authorId &&
        postData.authorId !== user.uid
      ) {
        try {
          await notificationService.sendPostDeletedByModerator(
            postData.authorId,
            postData.title || "tu publicación"
          );
        } catch (notifError) {
          console.error("Error enviando notificación:", notifError);
          // No fallar la eliminación si falla la notificación
        }
      }

      return {
        success: true,
        deletedComments: deletedCommentsCount,
        updatedAuthors: updatedAuthorsCount,
        deletedImages: postData.images?.length || 0,
        moderatorDeletion: isModeratorDeletion,
      };
    } catch (error) {
      console.error("Error eliminando post:", error);
      return { success: false, error: error.message };
    }
  };

  // Reaccionar a post
  const reactToPost = async (postId, reactionType) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) throw new Error("Publicación no encontrada");

      const postData = postDoc.data();
      const authorId = postData.authorId;

      // Determinar cambios en el aura
      let auraChange = 0;
      const currentLikes = postData.likes || [];
      const currentDislikes = postData.dislikes || [];

      const wasLiked = currentLikes.includes(user.uid);
      const wasDisliked = currentDislikes.includes(user.uid);

      // Calcular cambio en aura basado en reacción anterior y nueva
      if (reactionType === "like") {
        if (wasLiked) {
          auraChange = -1;
        } else if (wasDisliked) {
          auraChange = 2;
        } else {
          auraChange = 1;
        }
      } else if (reactionType === "dislike") {
        if (wasDisliked) {
          auraChange = 1;
        } else if (wasLiked) {
          auraChange = -2;
        } else {
          auraChange = -1;
        }
      } else if (reactionType === "remove") {
        if (wasLiked) {
          auraChange = -1;
        } else if (wasDisliked) {
          auraChange = 1;
        }
      }

      // Usar batch para operación atómica
      const batch = writeBatch(db);

      // 1. Actualizar reacciones del post
      if (reactionType === "like") {
        batch.update(postRef, {
          likes: arrayUnion(user.uid),
          dislikes: arrayRemove(user.uid),
        });
      } else if (reactionType === "dislike") {
        batch.update(postRef, {
          dislikes: arrayUnion(user.uid),
          likes: arrayRemove(user.uid),
        });
      } else if (reactionType === "remove") {
        batch.update(postRef, {
          likes: arrayRemove(user.uid),
          dislikes: arrayRemove(user.uid),
        });
      }

      // 2. Actualizar aura del autor SOLO si hay cambio y no es el mismo usuario
      if (auraChange !== 0 && authorId !== user.uid) {
        const authorRef = doc(db, "users", authorId);
        batch.update(authorRef, {
          "stats.aura": increment(auraChange),
        });
      }

      await batch.commit();
      return { success: true, auraChange };
    } catch (error) {
      console.error("Error reaccionando al post:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    createPost,
    editPost,
    deletePost,
    reactToPost,
  };
};
