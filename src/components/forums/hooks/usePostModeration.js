import { useState } from "react";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  increment,
  addDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./../../../config/firebase";
import { notificationService } from "./../../notifications/services/notificationService";

export const usePostModeration = () => {
  const [loading, setLoading] = useState(false);

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

      const batch = writeBatch(db);

      // 2. Eliminar post original
      batch.delete(postRef);

      // 3. Actualizar contador del foro (solo si el post estaba activo)
      if (postData.status === "active") {
        const forumRef = doc(db, "forums", forumId);
        batch.update(forumRef, {
          postCount: increment(-1),
        });
      }

      // 4. Actualizar estadísticas del autor
      if (authorId) {
        const authorRef = doc(db, "users", authorId);
        batch.update(authorRef, {
          "stats.postCount": increment(-1),
          "stats.contributionCount": increment(-1),
        });
      }

      await batch.commit();

      // 5. Notificar al autor
      await notificationService.sendPostRejected(authorId, forumId, forumName);

      return { success: true };
    } catch (error) {
      console.error("Error rechazando post:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (
    postId,
    reason,
    forumId,
    isModeratorAction = false
  ) => {
    setLoading(true);
    try {
      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error("Publicación no encontrada");
      }

      const postData = postDoc.data();
      const batch = writeBatch(db);

      //Solo guardar en deleted_posts si es acción de moderador
      if (isModeratorAction) {
        const deletedPostRef = doc(collection(db, "deleted_posts"), postId);
        batch.set(deletedPostRef, {
          ...postData,
          id: postId,
          deletedAt: serverTimestamp(),
          deletedBy: auth.currentUser.uid,
          deleteReason: reason,
          deleteType: "moderator_deletion",
          originalForumId: forumId,
          authorId: postData.authorId,
          moderatorAction: true,
          statsAtDeletion: {
            likes: postData.likes?.length || 0,
            dislikes: postData.dislikes?.length || 0,
            comments: postData.stats?.commentCount || 0,
            views: postData.stats?.viewCount || 0,
          },
          reportedToGlobal: true,
        });
      }
      // Si no es moderadorAction, se elimina permanentemente sin guardar

      // 2. Eliminar post original
      batch.delete(postRef);

      // 3. Actualizar contador del foro
      const forumRef = doc(db, "forums", forumId);
      batch.update(forumRef, {
        postCount: increment(-1),
      });

      // 4. Actualizar estadísticas del autor
      if (postData.authorId) {
        const authorRef = doc(db, "users", postData.authorId);
        batch.update(authorRef, {
          "stats.postCount": increment(-1),
          "stats.contributionCount": increment(-1),
        });
      }

      await batch.commit();
      return { success: true, savedForAudit: isModeratorAction };
    } catch (error) {
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
    deletePost,
    getPendingPosts,
    loading,
  };
};
