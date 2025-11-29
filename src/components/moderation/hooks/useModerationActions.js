import { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { usePostModeration } from "./../../forums/hooks/usePostModeration";
import { useCommentModeration } from "./../../forums/posts/comments/hooks/useCommentModeration";
import { useCommunityBans } from "./../../forums/hooks/useCommunityBans";

export const useModerationActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { deletePost } = usePostModeration();
  const { deleteComment } = useCommentModeration();
  const { banUser } = useCommunityBans();

  const resolveReport = async (reportId, resolution) => {
    setLoading(true);
    setError(null);

    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, {
        status: "resolved",
        resolution,
        resolvedAt: serverTimestamp(),
        resolvedBy: "current-user-id", // Reemplazar con ID del moderador actual
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

  const suspendUser = async (userId, reason, duration) => {
    setLoading(true);
    setError(null);

    try {
      const userRef = doc(db, "users", userId);
      const suspensionData = {
        isSuspended: true,
        suspension: {
          reason,
          startDate: new Date(),
          endDate: duration === "permanent" ? null : calculateEndDate(duration),
          suspendedBy: "current-user-id", // Reemplazar con ID del moderador
        },
      };

      await updateDoc(userRef, suspensionData);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

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

  // Función auxiliar para calcular fecha de fin de suspensión
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
      default:
        endDate.setDate(endDate.getDate() + 7);
    }
    return endDate;
  };

  return {
    resolveReport,
    suspendUser,
    deleteContent,
    banFromCommunity,
    loading,
    error,
  };
};
