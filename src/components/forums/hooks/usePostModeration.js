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
  writeBatch,
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

      // Incrementar contadores del autor
      await updateDoc(doc(db, "users", postData.authorId), {
        "stats.postCount": increment(1),
        "stats.contributionCount": increment(1),
      });

      // Incrementar contador del foro
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

  const validatePostsBatch = async (forumId, forumName) => {
    try {
      // 1. Buscar todos los posts pendientes
      const postsQuery = query(
        collection(db, "posts"),
        where("forumId", "==", forumId),
        where("status", "==", "pending")
      );

      const postsSnapshot = await getDocs(postsQuery);

      if (postsSnapshot.empty) {
        return { success: true, validatedCount: 0 };
      }

      // 2. Preparar batch
      const batch = writeBatch(db);
      const forumRef = doc(db, "forums", forumId);
      const authorUpdates = new Map(); // Acumular cambios por autor

      // 3. Procesar cada post pendiente
      for (const postDoc of postsSnapshot.docs) {
        const postData = postDoc.data();
        const postRef = doc(db, "posts", postDoc.id);

        // Actualizar post a activo
        batch.update(postRef, {
          status: "active",
          validatedAt: serverTimestamp(),
          validatedBy: auth.currentUser.uid,
        });

        // Acumular incrementos por autor
        const authorId = postData.authorId;
        if (authorId) {
          const currentCount = authorUpdates.get(authorId) || 0;
          authorUpdates.set(authorId, currentCount + 1);
        }
      }

      // 4. Actualizar estadísticas del foro
      batch.update(forumRef, {
        postCount: increment(postsSnapshot.size),
        lastPostAt: serverTimestamp(),
      });

      // 5. Actualizar estadísticas de cada autor
      for (const [authorId, postCount] of authorUpdates) {
        const authorRef = doc(db, "users", authorId);
        batch.update(authorRef, {
          "stats.postCount": increment(postCount),
          "stats.contributionCount": increment(postCount),
        });
      }

      // 6. Ejecutar batch
      await batch.commit();

      // 7. Enviar notificaciones (asíncrono, no bloquea)
      const notificationPromises = [];
      for (const postDoc of postsSnapshot.docs) {
        const postData = postDoc.data();
        if (postData.authorId) {
          notificationPromises.push(
            notificationService
              .sendPostApproved(postData.authorId, forumId, forumName)
              .catch((err) =>
                console.error("Error enviando notificación:", err)
              )
          );
        }
      }

      await Promise.allSettled(notificationPromises);

      return {
        success: true,
        validatedCount: postsSnapshot.size,
        authorsNotified: authorUpdates.size,
      };
    } catch (error) {
      console.error("Error validando posts en batch:", error);
      return { success: false, error: error.message };
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
    validatePostsBatch,
    rejectPost,
    getPendingPosts,
    loading,
  };
};
