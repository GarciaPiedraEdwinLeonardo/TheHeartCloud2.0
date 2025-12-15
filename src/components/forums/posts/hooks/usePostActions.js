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
  deleteField,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "./../../../../config/firebase";

export const usePostActions = () => {
  const user = auth.currentUser;

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
  const deletePost = async (
    postId,
    deleteReason = "user_deleted",
    isModeratorAction = false
  ) => {
    try {
      const { postData, isAuthor, isModeratorOrAdmin, isForumModerator } =
        await checkPostPermissions(postId);

      const isModeratorDeletion =
        isModeratorAction ||
        (!isAuthor && (isModeratorOrAdmin || isForumModerator));

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

      // TERCERO: Actualizar estadísticas de autores de comentarios
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

      // CUARTO: Eliminar el post y actualizar contadores
      const batch = writeBatch(db);

      if (isModeratorDeletion) {
        const deletedPostRef = doc(collection(db, "deleted_posts"), postId);
        batch.set(deletedPostRef, {
          ...postData,
          id: postId,
          deletedAt: serverTimestamp(),
          deletedBy: user.uid,
          deleteReason: deleteReason,
          deleteType: "moderator_deletion",
          originalForumId: postData.forumId,
          authorId: postData.authorId,
          moderatorAction: true,
          statsAtDeletion: {
            likes: postData.likes?.length || 0,
            dislikes: postData.dislikes?.length || 0,
            comments: postData.stats?.commentCount || 0,
            views: postData.stats?.viewCount || 0,
          },
          reportedToGlobal: false,
        });
      }

      // Eliminar post
      const postRef = doc(db, "posts", postId);
      batch.delete(postRef);

      // Actualizar contador del foro
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

      // Reportar a moderación global si es necesario
      if (isModeratorDeletion) {
        await reportToGlobalModeration(
          postData.authorId,
          deleteReason,
          "post_deleted_by_moderator",
          postId
        );
      }

      return {
        success: true,
        deletionType: isModeratorDeletion ? "moderator" : "user",
        savedForAudit: isModeratorDeletion,
        deletedComments: deletedCommentsCount,
        updatedAuthors: updatedAuthorsCount,
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
          // Quitar like: -1 al aura
          auraChange = -1;
        } else if (wasDisliked) {
          // Cambiar de dislike a like: +2 al aura (quitar dislike +1, agregar like +1)
          auraChange = 2;
        } else {
          // Nuevo like: +1 al aura
          auraChange = 1;
        }
      } else if (reactionType === "dislike") {
        if (wasDisliked) {
          // Quitar dislike: +1 al aura
          auraChange = 1;
        } else if (wasLiked) {
          // Cambiar de like a dislike: -2 al aura (quitar like -1, agregar dislike -1)
          auraChange = -2;
        } else {
          // Nuevo dislike: -1 al aura
          auraChange = -1;
        }
      } else if (reactionType === "remove") {
        // Remover todas las reacciones
        if (wasLiked) {
          auraChange = -1; // Se quita un like
        } else if (wasDisliked) {
          auraChange = 1; // Se quita un dislike
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

  // Reportar a moderación global (para eliminaciones de moderadores)
  const reportToGlobalModeration = async (
    userId,
    reason,
    actionType,
    postId = null
  ) => {
    try {
      await addDoc(collection(db, "global_moderation_reports"), {
        userId,
        reason,
        moderatorId: user.uid,
        actionType,
        postId,
        reportedAt: serverTimestamp(),
        status: "pending_review",
        communityContext: true,
        requiresAction: true, // Indica que necesita revisión para posibles sanciones
      });
    } catch (error) {
      console.error("Error reporting to global moderation:", error);
    }
  };

  return {
    createPost,
    editPost,
    deletePost,
    reactToPost,
  };
};
