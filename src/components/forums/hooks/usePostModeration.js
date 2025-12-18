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
  increment,
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
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error("Publicación no encontrada");
      }

      const postData = postDoc.data();

      // Actualizar el post a activo
      await updateDoc(postRef, {
        status: "active",
        validatedAt: serverTimestamp(),
        validatedBy: auth.currentUser.uid,
      });

      // IMPORTANTE: Al aprobar, incrementar AMBOS contadores del autor
      await updateDoc(doc(db, "users", postData.authorId), {
        "stats.postCount": increment(1),
        "stats.contributionCount": increment(1),
      });

      // IMPORTANTE: Incrementar el contador del foro ahora que el post está activo
      const forumRef = doc(db, "forums", forumId);
      await updateDoc(forumRef, {
        postCount: increment(1),
        lastPostAt: serverTimestamp(),
      });

      // Notificar al autor
      await notificationService.sendPostApproved(
        postData.authorId,
        forumId,
        forumName
      );

      return { success: true };
    } catch (error) {
      console.error("Error validando post:", error);
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

      // IMPORTANTE: Pasar el status actual para que deletePost sepa si debe decrementar
      // Como el post está "pending", deletePost NO debe decrementar el contador
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
