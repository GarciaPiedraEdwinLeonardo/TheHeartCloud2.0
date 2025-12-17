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
  deleteDoc,
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
        parentCommentId: commentData.parentCommentId || null,
        likes: [],
        likeCount: 0,
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
        editedAt: new Date(),
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
      return {
        success: false,
        error: "Error al editar el comentario regrese mas tarde",
      };
    }
  };

  const deleteComment = async (commentId, isModeratorAction = false) => {
    try {
      const { commentData } = await checkCommentPermissions(commentId);

      // Usar la función recursiva para eliminar comentario y respuestas
      const result = await deleteCommentWithReplies(
        commentId,
        isModeratorAction
      );

      return result;
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

  const deleteCommentWithReplies = async (
    commentId,
    isModeratorAction = false
  ) => {
    try {
      const { commentData, isAuthor, isModeratorOrAdmin, isForumModerator } =
        await checkCommentPermissions(commentId);

      const batch = writeBatch(db);

      // Variable para contar TODOS los comentarios eliminados
      let totalCommentsDeleted = 0;

      // Función recursiva para eliminar comentarios y sus respuestas DEFINITIVAMENTE
      const deleteCommentRecursive = async (currentCommentId, currentBatch) => {
        // 1. Obtener todas las respuestas de este comentario
        const repliesQuery = query(
          collection(db, "comments"),
          where("parentCommentId", "==", currentCommentId)
        );

        const repliesSnapshot = await getDocs(repliesQuery);
        const replies = repliesSnapshot.docs;

        // 2. Eliminar recursivamente cada respuesta
        let repliesDeletedCount = 0;
        for (const replyDoc of replies) {
          repliesDeletedCount += await deleteCommentRecursive(
            replyDoc.id,
            currentBatch
          );
        }

        // 3. ELIMINAR DEFINITIVAMENTE el comentario actual
        const commentRef = doc(db, "comments", currentCommentId);
        const commentDoc = await getDoc(commentRef);

        if (commentDoc.exists()) {
          const currentCommentData = commentDoc.data();

          // ELIMINAR el documento en lugar de marcarlo como eliminado
          currentBatch.delete(commentRef);

          // Actualizar estadísticas del autor
          const commentAuthorId = currentCommentData.authorId;

          if (commentAuthorId === user.uid) {
            // Si el usuario elimina su propio comentario
            currentBatch.update(doc(db, "users", commentAuthorId), {
              "stats.commentCount": increment(-1),
              "stats.contributionCount": increment(-1),
            });
          } else if (
            isModeratorAction ||
            isModeratorOrAdmin ||
            isForumModerator
          ) {
            // Si es moderador eliminando comentario de otro usuario
            currentBatch.update(doc(db, "users", commentAuthorId), {
              "stats.commentCount": increment(-1),
              "stats.contributionCount": increment(-1),
              "stats.warnings": increment(1),
            });
          }
        }

        // Retornar el total de comentarios eliminados en este sub-árbol
        return 1 + repliesDeletedCount;
      };

      // Ejecutar eliminación recursiva y obtener el total real
      totalCommentsDeleted = await deleteCommentRecursive(commentId, batch);

      // Actualizar contador de comentarios en el post
      batch.update(doc(db, "posts", commentData.postId), {
        "stats.commentCount": increment(-totalCommentsDeleted),
      });

      await batch.commit();

      return {
        success: true,
        deletionType: isAuthor ? "user" : "moderator",
        deletedCount: totalCommentsDeleted,
      };
    } catch (error) {
      console.error("Error eliminando comentario con respuestas:", error);
      return { success: false, error: error.message };
    }
  };

  // Función auxiliar para contar respuestas
  const countCommentReplies = async (commentId) => {
    try {
      const repliesQuery = query(
        collection(db, "comments"),
        where("parentCommentId", "==", commentId)
      );

      const repliesSnapshot = await getDocs(repliesQuery);
      let total = repliesSnapshot.size;

      // Contar respuestas de forma recursiva
      for (const replyDoc of repliesSnapshot.docs) {
        total += await countCommentReplies(replyDoc.id);
      }

      return total;
    } catch (error) {
      console.error("Error contando respuestas:", error);
      return 0;
    }
  };

  return {
    createComment,
    editComment,
    deleteComment,
    deleteCommentWithReplies,
    countCommentReplies,
    likeComment,
  };
};
