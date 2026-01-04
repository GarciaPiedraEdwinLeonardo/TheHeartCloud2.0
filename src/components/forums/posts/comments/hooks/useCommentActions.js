import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "./../../../../../config/firebase";
import axiosInstance from "./../../../../../config/axiosInstance";

export const useCommentActions = () => {
  const user = auth.currentUser;

  // Crear nuevo comentario (ahora usa el backend)
  const createComment = async (commentData) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión para comentar");

      const data = await axiosInstance.post("/api/comments", commentData);

      return { success: true, commentId: data.data.commentId };
    } catch (error) {
      console.error("Error creando comentario:", error);
      return { success: false, error: error };
    }
  };

  // Editar comentario (ahora usa el backend)
  const editComment = async (commentId, newContent) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      await axiosInstance.put(`/api/comments/${commentId}`, {
        content: newContent,
      });

      return { success: true };
    } catch (error) {
      console.error("Error editando comentario:", error);
      return {
        success: false,
        error: "Error al editar el comentario, regrese más tarde",
      };
    }
  };

  // Eliminar comentario (ahora usa el backend)
  const deleteComment = async (commentId) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      const data = await axiosInstance.delete(`/api/comments/${commentId}`);

      return {
        success: true,
        deletedCount: data.data.deletedCount,
        isModeratorAction: data.data.isModeratorAction,
      };
    } catch (error) {
      console.error("Error eliminando comentario:", error);
      return { success: false, error: error };
    }
  };

  // Reaccionar a comentario (like) - se mantiene en frontend
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
