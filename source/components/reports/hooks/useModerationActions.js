import { useState } from "react";
import { moderationService } from "../services";
import { notificationService } from "./../../notifications/services/notificationService";

export const useModerationActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const takeAction = async (actionData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await moderationService.takeModerationAction(actionData);

      if (result.success) {
        // Enviar notificación al usuario afectado si aplica
        if (actionData.notifyUser && actionData.targetUserId) {
          await sendModerationNotification(actionData);
        }

        return { success: true, logId: result.logId };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const sendModerationNotification = async (actionData) => {
    try {
      const { action, targetUserId, reason, duration } = actionData;

      let notificationType = "";
      let message = "";

      switch (action) {
        case "user_suspended":
          notificationType = "user_suspended";
          message = `Has sido suspendido por ${duration}. Motivo: ${reason}`;
          break;
        case "post_removed":
          notificationType = "post_removed";
          message = `Tu publicación ha sido eliminada. Motivo: ${reason}`;
          break;
        case "comment_removed":
          notificationType = "comment_removed";
          message = `Tu comentario ha sido eliminado. Motivo: ${reason}`;
          break;
        case "user_warned":
          notificationType = "user_warned";
          message = `Has recibido una advertencia. Motivo: ${reason}`;
          break;
        default:
          return;
      }

      await notificationService.sendModerationAction(
        targetUserId,
        notificationType,
        message,
        actionData.details
      );
    } catch (error) {
      console.error("Error enviando notificación de moderación:", error);
    }
  };

  // Acciones predefinidas comunes
  const removePost = async (postId, reason, relatedReports = []) => {
    return takeAction({
      action: "post_removed",
      targetType: "post",
      targetId: postId,
      reason,
      relatedReports,
      severity: "medium",
      notifyUser: true,
    });
  };

  const removeComment = async (commentId, reason, relatedReports = []) => {
    return takeAction({
      action: "comment_removed",
      targetType: "comment",
      targetId: commentId,
      reason,
      relatedReports,
      severity: "medium",
      notifyUser: true,
    });
  };

  const suspendUser = async (userId, duration, reason, strikePoints = 1) => {
    return takeAction({
      action: "user_suspended",
      targetType: "user",
      targetId: userId,
      targetUserId: userId,
      reason,
      duration,
      severity: "high",
      notifyUser: true,
      strikeData: {
        userId,
        reason,
        severity: duration === "permanent" ? "high" : "medium",
        points: strikePoints,
        expiresAt:
          duration === "permanent"
            ? null
            : new Date(Date.now() + getDurationMs(duration)),
      },
    });
  };

  const warnUser = async (userId, reason) => {
    return takeAction({
      action: "user_warned",
      targetType: "user",
      targetId: userId,
      targetUserId: userId,
      reason,
      severity: "low",
      notifyUser: true,
      strikeData: {
        userId,
        reason,
        severity: "low",
        points: 1,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      },
    });
  };

  const getDurationMs = (duration) => {
    const durations = {
      "1d": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };
    return durations[duration] || 0;
  };

  return {
    loading,
    error,
    takeAction,
    removePost,
    removeComment,
    suspendUser,
    warnUser,
    clearError: () => setError(null),
  };
};
