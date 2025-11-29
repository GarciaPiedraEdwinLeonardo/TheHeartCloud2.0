import { useState } from "react";
import { doc, updateDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { usePostModeration } from "../../forums/hooks/usePostModeration";
import { useCommentModeration } from "../../forums/posts/comments/hooks/useCommentModeration";
import { useCommunityBans } from "../../forums/hooks/useCommunityBans";

export const useModerationActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { deletePost } = usePostModeration();
  const { deleteComment } = useCommentModeration();
  const { banUser } = useCommunityBans();

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
        resolvedBy: "current-user-id",
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
        resolvedBy: "current-user-id",
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
          suspendedBy: "moderator-system",
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
        moderatorId: "current-user-id",
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
  const deleteContent = async (contentType, contentId, reason) => {
    setLoading(true);
    setError(null);

    try {
      let result;

      if (contentType === "post") {
        result = await deletePost(contentId, reason, "global-forum-id", true);
      } else if (contentType === "comment") {
        result = await deleteComment(
          contentId,
          reason,
          "global-forum-id",
          true,
          true
        );
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

      // Primero marcar como eliminada en lugar de borrar completamente
      await updateDoc(communityRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletionReason: reason,
        deletedBy: "moderator-system",
        status: "deleted",
      });

      // Registrar en logs de moderación
      const moderationLogRef = doc(collection(db, "moderation_logs"));
      await setDoc(moderationLogRef, {
        action: "community_deletion",
        targetForumId: communityId,
        reason,
        moderatorId: "current-user-id",
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
