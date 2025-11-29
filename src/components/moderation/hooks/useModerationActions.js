import { useState } from "react";
import {
  doc,
  updateDoc,
  collection,
  serverTimestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../../config/firebase";
import { usePostModeration } from "../../forums/hooks/usePostModeration";
import { useCommentModeration } from "../../forums/posts/comments/hooks/useCommentModeration";
import { useCommunityBans } from "../../forums/hooks/useCommunityBans";

export const useModerationActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { deletePost } = usePostModeration();
  const { deleteComment } = useCommentModeration();
  const { banUser } = useCommunityBans();

  // Obtener el usuario actual de forma segura
  const getCurrentUserId = () => {
    return auth.currentUser?.uid || "system";
  };

  // Resolver reporte
  const resolveReport = async (reportId, resolution) => {
    setLoading(true);
    setError(null);

    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, {
        status: "resolved",
        resolution,
        resolvedAt: serverTimestamp(),
        resolvedBy: getCurrentUserId(),
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Desestimar reporte
  const dismissReport = async (reportId, reason) => {
    setLoading(true);
    setError(null);

    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, {
        status: "dismissed",
        resolution: reason,
        resolvedAt: serverTimestamp(),
        resolvedBy: getCurrentUserId(),
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Suspender usuario
  const suspendUser = async (userId, reason, duration) => {
    setLoading(true);
    setError(null);

    try {
      const userRef = doc(db, "users", userId);
      const endDate = calculateEndDate(duration);

      await updateDoc(userRef, {
        suspension: {
          isSuspended: true,
          reason,
          startDate: new Date(),
          endDate,
          suspendedBy: getCurrentUserId(),
        },
        updatedAt: serverTimestamp(),
      });

      // Registrar la acción en el historial de moderación
      const moderationLogRef = doc(collection(db, "moderation_logs"));
      await setDoc(moderationLogRef, {
        action: "user_suspension",
        targetUserId: userId,
        reason,
        duration,
        moderatorId: getCurrentUserId(),
        createdAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar contenido
  const deleteContent = async (
    contentType,
    contentId,
    reason,
    forumId = null
  ) => {
    setLoading(true);
    setError(null);

    try {
      let result;

      if (contentType === "post") {
        // Usar el forumId del reporte o intentar obtenerlo del post
        let targetForumId = forumId;
        if (!targetForumId) {
          // Intentar obtener el forumId del post
          const postDoc = await getDoc(doc(db, "posts", contentId));
          if (postDoc.exists()) {
            targetForumId = postDoc.data().forumId;
          }
        }
        result = await deletePost(
          contentId,
          reason,
          targetForumId || "global-forum",
          true
        );
      } else if (contentType === "comment") {
        let targetForumId = forumId;
        if (!targetForumId) {
          // Intentar obtener el forumId del comentario a través del post
          const commentDoc = await getDoc(doc(db, "comments", contentId));
          if (commentDoc.exists()) {
            const postDoc = await getDoc(
              doc(db, "posts", commentDoc.data().postId)
            );
            if (postDoc.exists()) {
              targetForumId = postDoc.data().forumId;
            }
          }
        }
        result = await deleteComment(
          contentId,
          reason,
          targetForumId || "global-forum",
          true,
          true
        );
      } else {
        return { success: false, error: "Tipo de contenido no soportado" };
      }

      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar comunidad
  const deleteCommunity = async (communityId, reason) => {
    setLoading(true);
    setError(null);

    try {
      const communityRef = doc(db, "forums", communityId);

      await updateDoc(communityRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletionReason: reason,
        deletedBy: getCurrentUserId(),
        status: "deleted",
      });

      // Registrar en logs de moderación
      const moderationLogRef = doc(collection(db, "moderation_logs"));
      await setDoc(moderationLogRef, {
        action: "community_deletion",
        targetForumId: communityId,
        reason,
        moderatorId: getCurrentUserId(),
        createdAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Banear de comunidad
  const banFromCommunity = async (forumId, userId, reason) => {
    setLoading(true);
    setError(null);

    try {
      const result = await banUser(forumId, userId, reason, "30 days");
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para calcular fecha de fin
  const calculateEndDate = (duration) => {
    const endDate = new Date();
    switch (duration) {
      case "1 day":
        endDate.setDate(endDate.getDate() + 1);
        break;
      case "7 days":
        endDate.setDate(endDate.getDate() + 7);
        break;
      case "30 days":
        endDate.setDate(endDate.getDate() + 30);
        break;
      case "permanent":
        return null; // Suspensión permanente
      default:
        endDate.setDate(endDate.getDate() + 7);
    }
    return endDate;
  };

  return {
    resolveReport,
    dismissReport,
    suspendUser,
    deleteContent,
    deleteCommunity,
    banFromCommunity,
    loading,
    error,
  };
};
