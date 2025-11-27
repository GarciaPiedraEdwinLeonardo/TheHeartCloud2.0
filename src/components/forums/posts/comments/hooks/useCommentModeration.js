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
import { db, auth } from "./../../../../../config/firebase";
import { notificationService } from "./../../../../notifications/services/notificationService";

export const useCommentModeration = () => {
  const [loading, setLoading] = useState(false);

  // Validar comentario (aprobarlo)
  const validateComment = async (commentId, forumId, forumName) => {
    setLoading(true);
    try {
      const commentRef = doc(db, "comments", commentId);
      await updateDoc(commentRef, {
        status: "active",
        validatedAt: serverTimestamp(),
        validatedBy: auth.currentUser.uid,
      });

      // Notificar al autor
      const commentDoc = await getDoc(commentRef);
      const comment = commentDoc.data();
      await notificationService.sendCommentApproved(
        comment.authorId,
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

  // Rechazar comentario
  const rejectComment = async (commentId, forumId, forumName, reason) => {
    setLoading(true);
    try {
      const commentRef = doc(db, "comments", commentId);
      const commentDoc = await getDoc(commentRef);

      if (!commentDoc.exists()) {
        throw new Error("Comentario no encontrado");
      }

      const commentData = commentDoc.data();
      const authorId = commentData.authorId;
      const postId = commentData.postId;

      const batch = writeBatch(db);

      // 1. Guardar en deleted_comments para auditoría
      const deletedCommentRef = doc(
        collection(db, "deleted_comments"),
        commentId
      );
      batch.set(deletedCommentRef, {
        ...commentData,
        id: commentId,
        deletedAt: serverTimestamp(),
        deletedBy: auth.currentUser.uid,
        deleteReason: reason,
        deleteType: "moderator_rejection",
        originalPostId: postId,
        originalForumId: forumId,
        authorId: authorId,
        moderatorAction: true,
        rejectionReason: reason,
        statsAtDeletion: {
          likes: commentData.likes?.length || 0,
          likeCount: commentData.likeCount || 0,
        },
        reportedToGlobal: true,
      });

      // 2. Soft delete del comentario original
      batch.update(commentRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: auth.currentUser.uid,
        moderatorDelete: true,
        deletionReason: reason,
      });

      // 3. Actualizar contador de comentarios en el post
      if (postId) {
        const postRef = doc(db, "posts", postId);
        batch.update(postRef, {
          "stats.commentCount": increment(-1),
        });
      }

      // 4. Actualizar estadísticas del autor
      if (authorId) {
        const authorRef = doc(db, "users", authorId);
        batch.update(authorRef, {
          "stats.commentCount": increment(-1),
          "stats.contributionCount": increment(-1),
          "stats.warnings": increment(1),
        });
      }

      await batch.commit();

      // 5. Notificar al autor
      await notificationService.sendCommentRejected(
        authorId,
        forumId,
        forumName,
        reason
      );

      // 6. Reportar a moderación global
      await reportToGlobalModeration(
        authorId,
        reason,
        "comment_rejected",
        commentId
      );

      return { success: true };
    } catch (error) {
      console.error("Error rechazando comentario:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar comentario (con o sin respuestas)
  const deleteComment = async (
    commentId,
    reason,
    forumId,
    isModeratorAction = false,
    deleteReplies = true
  ) => {
    setLoading(true);
    try {
      const commentRef = doc(db, "comments", commentId);
      const commentDoc = await getDoc(commentRef);

      if (!commentDoc.exists()) {
        throw new Error("Comentario no encontrado");
      }

      const commentData = commentDoc.data();
      const authorId = commentData.authorId;
      const postId = commentData.postId;

      const batch = writeBatch(db);

      // Función recursiva para eliminar comentarios y respuestas
      const deleteCommentRecursive = async (currentCommentId, currentBatch) => {
        // Obtener respuestas del comentario actual
        const repliesQuery = query(
          collection(db, "comments"),
          where("parentCommentId", "==", currentCommentId),
          where("isDeleted", "==", false)
        );

        const repliesSnapshot = await getDocs(repliesQuery);

        // Eliminar respuestas recursivamente
        for (const replyDoc of repliesSnapshot.docs) {
          await deleteCommentRecursive(replyDoc.id, currentBatch);
        }

        // Procesar el comentario actual
        const currentCommentRef = doc(db, "comments", currentCommentId);
        const currentCommentDoc = await getDoc(currentCommentRef);

        if (currentCommentDoc.exists()) {
          const currentCommentData = currentCommentDoc.data();
          const currentAuthorId = currentCommentData.authorId;

          // Guardar en deleted_comments si es acción de moderador
          if (isModeratorAction) {
            const deletedCommentRef = doc(
              collection(db, "deleted_comments"),
              currentCommentId
            );
            currentBatch.set(deletedCommentRef, {
              ...currentCommentData,
              id: currentCommentId,
              deletedAt: serverTimestamp(),
              deletedBy: auth.currentUser.uid,
              deleteReason: reason,
              deleteType: "moderator_deletion",
              originalPostId: postId,
              originalForumId: forumId,
              authorId: currentAuthorId,
              moderatorAction: true,
              statsAtDeletion: {
                likes: currentCommentData.likes?.length || 0,
                likeCount: currentCommentData.likeCount || 0,
              },
              reportedToGlobal: true,
            });
          }

          // Soft delete del comentario
          currentBatch.update(currentCommentRef, {
            isDeleted: true,
            deletedAt: serverTimestamp(),
            deletedBy: auth.currentUser.uid,
            moderatorDelete: isModeratorAction,
            deletionReason: reason,
          });

          // Actualizar estadísticas del autor
          if (currentAuthorId) {
            const authorRef = doc(db, "users", currentAuthorId);
            currentBatch.update(authorRef, {
              "stats.commentCount": increment(-1),
              "stats.contributionCount": increment(-1),
              ...(isModeratorAction && { "stats.warnings": increment(1) }),
            });
          }
        }
      };

      // Ejecutar eliminación recursiva
      await deleteCommentRecursive(commentId, batch);

      // Actualizar contador del post (solo una vez)
      if (postId) {
        const totalDeleted = 1 + (await countCommentReplies(commentId));
        const postRef = doc(db, "posts", postId);
        batch.update(postRef, {
          "stats.commentCount": increment(-totalDeleted),
        });
      }

      await batch.commit();

      // Notificar al autor principal
      if (isModeratorAction) {
        await notificationService.sendCommentDeletedByModerator(
          authorId,
          forumId,
          reason
        );

        // Reportar a moderación global
        await reportToGlobalModeration(
          authorId,
          reason,
          "comment_deleted_by_moderator",
          commentId
        );
      }

      return {
        success: true,
        savedForAudit: isModeratorAction,
        deletedCount: 1 + (await countCommentReplies(commentId)),
      };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Obtener comentarios pendientes de moderación
  const getPendingComments = async (forumId) => {
    try {
      // Primero obtener posts del foro
      const postsQuery = query(
        collection(db, "posts"),
        where("forumId", "==", forumId)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const postIds = postsSnapshot.docs.map((doc) => doc.id);

      if (postIds.length === 0) return [];

      // Luego obtener comentarios pendientes de esos posts
      const commentsQuery = query(
        collection(db, "comments"),
        where("postId", "in", postIds),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(commentsQuery);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting pending comments:", error);
      return [];
    }
  };

  // Obtener comentarios reportados
  const getReportedComments = async (forumId) => {
    try {
      // Primero obtener posts del foro
      const postsQuery = query(
        collection(db, "posts"),
        where("forumId", "==", forumId)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const postIds = postsSnapshot.docs.map((doc) => doc.id);

      if (postIds.length === 0) return [];

      // Luego obtener comentarios reportados de esos posts
      const commentsQuery = query(
        collection(db, "comments"),
        where("postId", "in", postIds),
        where("reportCount", ">", 0)
      );
      const snapshot = await getDocs(commentsQuery);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting reported comments:", error);
      return [];
    }
  };

  // Función auxiliar para contar respuestas
  const countCommentReplies = async (commentId) => {
    try {
      const repliesQuery = query(
        collection(db, "comments"),
        where("parentCommentId", "==", commentId),
        where("isDeleted", "==", false)
      );

      const repliesSnapshot = await getDocs(repliesQuery);
      let total = repliesSnapshot.size;

      for (const replyDoc of repliesSnapshot.docs) {
        total += await countCommentReplies(replyDoc.id);
      }

      return total;
    } catch (error) {
      console.error("Error contando respuestas:", error);
      return 0;
    }
  };

  // Reportar a moderación global
  const reportToGlobalModeration = async (
    userId,
    reason,
    actionType,
    commentId = null
  ) => {
    try {
      await addDoc(collection(db, "global_moderation_reports"), {
        userId,
        reason,
        moderatorId: auth.currentUser.uid,
        actionType,
        commentId,
        reportedAt: serverTimestamp(),
        status: "pending_review",
        communityContext: true,
        requiresAction: true,
        severity: actionType.includes("rejected") ? "medium" : "high",
      });
    } catch (error) {
      console.error("Error reporting to global moderation:", error);
    }
  };

  return {
    validateComment,
    rejectComment,
    deleteComment,
    getPendingComments,
    getReportedComments,
    loading,
  };
};
