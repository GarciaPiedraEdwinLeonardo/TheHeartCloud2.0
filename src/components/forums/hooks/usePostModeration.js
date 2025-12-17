import { useState } from "react";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./../../../config/firebase";
import { notificationService } from "./../../notifications/services/notificationService";
import { usePostActions } from "./../posts/hooks/usePostActions";

export const usePostModeration = () => {
  const [loading, setLoading] = useState(false);
  const { deletePost } = usePostActions();

  const validatePost = async (postId, forumId, forumName) => {
    setLoading(true);
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        status: "active",
        validatedAt: serverTimestamp(),
        validatedBy: auth.currentUser.uid,
      });

      // Notificar al autor
      const postDoc = await getDoc(postRef);
      const post = postDoc.data();
      await notificationService.sendPostApproved(
        post.authorId,
        forumId,
        forumName
      );

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const rejectPost = async (postId, forumId, forumName) => {
    setLoading(true);
    try {
      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error("Publicación no encontrada");
      }

      const postData = postDoc.data();
      const authorId = postData.authorId;

      // Usar la función deletePost de usePostActions (ahora sin parámetros extra)
      const result = await deletePost(postId);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Notificar al autor sobre el rechazo
      await notificationService.sendPostRejected(authorId, forumId, forumName);

      return { success: true };
    } catch (error) {
      console.error("Error rechazando post:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getPendingPosts = async (forumId) => {
    try {
      const q = query(
        collection(db, "posts"),
        where("forumId", "==", forumId),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting pending posts:", error);
      return [];
    }
  };

  return {
    validatePost,
    rejectPost,
    getPendingPosts,
    loading,
  };
};
