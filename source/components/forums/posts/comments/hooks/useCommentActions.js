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
} from "firebase/firestore";
import { db, auth } from "./../../../../../config/firebase";

export const useCommentActions = () => {
  const user = auth.currentUser;

  // Función auxiliar para verificar permisos
  const checkCommentPermissions = async (commentId) => {
    if (!user) throw new Error("Debes iniciar sesión");

    const commentRef = doc(db, "comments", commentId);
    const commentDoc = await getDoc(commentRef);

    if (!commentDoc.exists()) throw new Error("Comentario no encontrado");

    const commentData = commentDoc.data();
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    // Verificar si puede modificar (autor, moderador o admin)
    const isAuthor = commentData.authorId === user.uid;
    const isModeratorOrAdmin = ["moderator", "admin"].includes(userData?.role);

    // Verificar si es moderador del foro del post
    let isForumModerator = false;
    if (commentData.postId) {
      const postDoc = await getDoc(doc(db, "posts", commentData.postId));
      if (postDoc.exists()) {
        const postData = postDoc.data();
        const forumDoc = await getDoc(doc(db, "forums", postData.forumId));
        if (forumDoc.exists()) {
          const forumData = forumDoc.data();
          isForumModerator =
            forumData.moderators && forumData.moderators[user.uid];
        }
      }
    }

    if (!isAuthor && !isModeratorOrAdmin && !isForumModerator) {
      throw new Error("No tienes permisos para modificar este comentario");
    }

    return {
      commentData,
      userData,
      isAuthor,
      isModeratorOrAdmin,
      isForumModerator,
    };
  };

  // Crear nuevo comentario
  const createComment = async (commentData) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión para comentar");

      // Verificar que el usuario puede comentar (doctor o superior)
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (!["doctor", "moderator", "admin"].includes(userData?.role)) {
        throw new Error("Solo usuarios verificados pueden comentar");
      }

      const newComment = {
        content: commentData.content,
        authorId: user.uid,
        postId: commentData.postId,
        parentCommentId: commentData.parentCommentId || null, // Para comentarios anidados
        likes: [],
        likeCount: 0,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: null,
        editHistory: [],
      };

      const docRef = await addDoc(collection(db, "comments"), newComment);

      // Actualizar contador de comentarios en el post
      await updateDoc(doc(db, "posts", commentData.postId), {
        "stats.commentCount": increment(1),
      });

      // Actualizar estadísticas del usuario
      await updateDoc(doc(db, "users", user.uid), {
        "stats.commentCount": increment(1),
        "stats.contributionCount": increment(1),
      });

      return { success: true, commentId: docRef.id };
    } catch (error) {
      console.error("Error creando comentario:", error);
      return { success: false, error: error.message };
    }
  };

  // Editar comentario
  const editComment = async (commentId, newContent) => {
    try {
      const { commentData, isAuthor } = await checkCommentPermissions(
        commentId
      );

      if (!isAuthor) {
        throw new Error("Solo el autor puede editar el comentario");
      }

      const commentRef = doc(db, "comments", commentId);
      const batch = writeBatch(db);

      // 1. Agregar al historial de ediciones
      const editRecord = {
        previousContent: commentData.content,
        editedAt: serverTimestamp(),
        editedBy: user.uid,
      };

      // 2. Actualizar comentario
      batch.update(commentRef, {
        content: newContent,
        updatedAt: serverTimestamp(),
        editHistory: arrayUnion(editRecord),
      });

      await batch.commit();

      return { success: true };
    } catch (error) {
      console.error("Error editando comentario:", error);
      return { success: false, error: error.message };
    }
  };

  // Eliminar comentario (soft delete)
  const deleteComment = async (commentId, isModeratorAction = false) => {
    try {
      const { commentData, isAuthor, isModeratorOrAdmin, isForumModerator } =
        await checkCommentPermissions(commentId);

      const commentRef = doc(db, "comments", commentId);
      const batch = writeBatch(db);

      if (
        isModeratorAction ||
        (!isAuthor && (isModeratorOrAdmin || isForumModerator))
      ) {
        // Eliminación por moderador - soft delete
        batch.update(commentRef, {
          isDeleted: true,
          deletedAt: serverTimestamp(),
          deletedBy: user.uid,
          moderatorDelete: true,
        });
      } else if (isAuthor) {
        // Eliminación por autor - soft delete
        batch.update(commentRef, {
          isDeleted: true,
          deletedAt: serverTimestamp(),
        });
      }

      // Actualizar contador de comentarios en el post
      batch.update(doc(db, "posts", commentData.postId), {
        "stats.commentCount": increment(-1),
      });

      // Actualizar estadísticas del autor
      if (isAuthor) {
        batch.update(doc(db, "users", user.uid), {
          "stats.commentCount": increment(-1),
          "stats.contributionCount": increment(-1),
        });
      }

      await batch.commit();

      return {
        success: true,
        deletionType: isAuthor ? "user" : "moderator",
      };
    } catch (error) {
      console.error("Error eliminando comentario:", error);
      return { success: false, error: error.message };
    }
  };

  // Reaccionar a comentario (like)
  const likeComment = async (commentId) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      const commentRef = doc(db, "comments", commentId);
      const commentDoc = await getDoc(commentRef);

      if (!commentDoc.exists()) throw new Error("Comentario no encontrado");

      const commentData = commentDoc.data();
      const authorId = commentData.authorId;

      const currentLikes = commentData.likes || [];
      const isLiked = currentLikes.includes(user.uid);

      const batch = writeBatch(db);

      if (isLiked) {
        // Quitar like
        batch.update(commentRef, {
          likes: arrayRemove(user.uid),
          likeCount: increment(-1),
        });

        // Actualizar aura del autor (-1) si no es el mismo usuario
        if (authorId !== user.uid) {
          batch.update(doc(db, "users", authorId), {
            "stats.aura": increment(-1),
          });
        }
      } else {
        // Agregar like
        batch.update(commentRef, {
          likes: arrayUnion(user.uid),
          likeCount: increment(1),
        });

        // Actualizar aura del autor (+1) si no es el mismo usuario
        if (authorId !== user.uid) {
          batch.update(doc(db, "users", authorId), {
            "stats.aura": increment(1),
          });
        }
      }

      await batch.commit();
      return { success: true, liked: !isLiked };
    } catch (error) {
      console.error("Error en like del comentario:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    createComment,
    editComment,
    deleteComment,
    likeComment,
  };
};
