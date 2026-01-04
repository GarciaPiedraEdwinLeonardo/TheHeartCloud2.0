import {
  doc,
  collection,
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
import axiosInstance from "./../../../../config/axiosInstance";

export const usePostActions = () => {
  const user = auth.currentUser;

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

      const result = await axiosInstance.post("/api/posts", postData);

      return { success: true, postId: result.data.postId };
    } catch (error) {
      console.error("Error creando post:", error);
      return { success: false, error: error };
    }
  };

  // Editar post
  const editPost = async (postId, updates) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      // Validar que postId existe
      if (!postId) {
        throw new Error("ID del post es requerido");
      }

      // Hacer la petición al backend
      const result = await axiosInstance.put(`/api/posts/${postId}`, updates);

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Error editando post:", error);
      return {
        success: false,
        error:
          typeof error === "string"
            ? error
            : error.message || "Error al editar el post",
      };
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
      if (!user) throw new Error("Debes iniciar sesión");

      if (!postId) {
        throw new Error("ID del post es requerido");
      }

      // Hacer la petición al backend
      const result = await axiosInstance.delete(`/api/posts/${postId}`);

      return {
        success: true,
        deletedComments: result.data.deletedComments || 0,
        updatedAuthors: result.data.updatedAuthors || 0,
        deletedImages: result.data.deletedImages || 0,
        moderatorDeletion: result.data.moderatorDeletion || false,
      };
    } catch (error) {
      console.error("Error eliminando post:", error);
      return {
        success: false,
        error:
          typeof error === "string"
            ? error
            : error.message || "Error al eliminar el post",
      };
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

        // Verificar si el autor existe antes de actualizar
        try {
          const authorDoc = await getDoc(authorRef);
          if (authorDoc.exists()) {
            batch.update(authorRef, {
              "stats.aura": increment(auraChange),
            });
          }
        } catch (error) {
          console.warn(`Error verificando usuario ${authorId}:`, error.message);
          // Continuar sin actualizar el aura si hay error
        }
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
