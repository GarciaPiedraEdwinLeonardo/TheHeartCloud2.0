// hooks/usePostActions.js
import {
  doc,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { db, auth } from "./../../../../config/firebase";

export const usePostActions = () => {
  const user = auth.currentUser;

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
        status: "active",
        isDeleted: false,
        deletedAt: null,
      };

      const docRef = await addDoc(collection(db, "posts"), newPost);

      // Actualizar contador de posts en el foro
      await updateDoc(doc(db, "forums", postData.forumId), {
        postCount: increment(1),
        lastPostAt: serverTimestamp(),
      });

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
      if (!user) throw new Error("Debes iniciar sesión");

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

  // Eliminar post (soft delete)
  const deletePost = async (postId, forumId) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      const postRef = doc(db, "posts", postId);

      await updateDoc(postRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
      });

      // Actualizar contador del foro
      await updateDoc(doc(db, "forums", forumId), {
        postCount: increment(-1),
      });

      // Actualizar estadísticas del usuario
      await updateDoc(doc(db, "users", user.uid), {
        "stats.postCount": increment(-1),
      });

      return { success: true };
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
      const updates = {};

      if (reactionType === "like") {
        updates.likes = arrayUnion(user.uid);
        updates.dislikes = arrayRemove(user.uid);
      } else if (reactionType === "dislike") {
        updates.dislikes = arrayUnion(user.uid);
        updates.likes = arrayRemove(user.uid);
      } else if (reactionType === "remove") {
        updates.likes = arrayRemove(user.uid);
        updates.dislikes = arrayRemove(user.uid);
      }

      await updateDoc(postRef, updates);
      return { success: true };
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

// Necesitamos importar getDoc
import { getDoc } from "firebase/firestore";
