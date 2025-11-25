import { useState } from "react";
import { reportsService } from "../services/reportsService";

export const useCreateReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createReport = async (reportData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validar datos del reporte
      if (
        !reportData.targetType ||
        !reportData.targetId ||
        !reportData.reason
      ) {
        throw new Error("Faltan datos requeridos para el reporte");
      }

      if (reportData.description && reportData.description.length < 10) {
        throw new Error("La descripción debe tener al menos 10 caracteres");
      }

      const result = await reportsService.createReport(reportData);

      if (result.success) {
        setSuccess(true);
        return { success: true, reportId: result.reportId };
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

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  };

  // Helper para crear reportes desde diferentes contextos
  const reportPost = async (
    postId,
    postData,
    reason,
    description,
    urgency = "medium"
  ) => {
    return createReport({
      targetType: "post",
      targetId: postId,
      targetData: {
        title: postData.title,
        content: postData.content,
        authorId: postData.authorId,
        createdAt: postData.createdAt,
      },
      reason,
      description,
      urgency,
    });
  };

  const reportComment = async (
    commentId,
    commentData,
    reason,
    description,
    urgency = "medium"
  ) => {
    return createReport({
      targetType: "comment",
      targetId: commentId,
      targetData: {
        content: commentData.content,
        authorId: commentData.authorId,
        postId: commentData.postId,
        createdAt: commentData.createdAt,
      },
      reason,
      description,
      urgency,
    });
  };

  const reportUser = async (
    userId,
    userData,
    reason,
    description,
    urgency = "medium"
  ) => {
    return createReport({
      targetType: "user",
      targetId: userId,
      targetData: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        joinDate: userData.joinDate,
      },
      reason,
      description,
      urgency,
    });
  };

  const reportProfile = async (
    userId,
    profileData,
    reason,
    description,
    urgency = "medium"
  ) => {
    return createReport({
      targetType: "profile",
      targetId: userId,
      targetData: {
        ...profileData,
        reportedAt: new Date(),
      },
      reason,
      description,
      urgency,
    });
  };

  return {
    loading,
    error,
    success,
    createReport,
    reportPost,
    reportComment,
    reportUser,
    reportProfile,
    reset,
  };
};
