import { useState } from "react";
import axiosInstance from "../../../config/axiosInstance";

export const useModerationActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Resolver reporte
  const resolveReport = async (reportId, resolution) => {
    setLoading(true);
    setError(null);

    try {
      await axiosInstance.put(`/api/reports/${reportId}/resolve`, {
        resolution,
      });

      return { success: true };
    } catch (error) {
      setError(error);
      return { success: false, error: error };
    } finally {
      setLoading(false);
    }
  };

  // Desestimar reporte
  const dismissReport = async (reportId, reason) => {
    setLoading(true);
    setError(null);

    try {
      await axiosInstance.put(`/api/reports/${reportId}/dismiss`, {
        reason,
      });

      return { success: true };
    } catch (error) {
      setError(error);
      return { success: false, error: error };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar contenido reportado
  const deleteContent = async (contentType, reportId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await axiosInstance.delete(
        `/api/reports/${reportId}/content`
      );

      return {
        success: true,
        ...data.data,
      };
    } catch (error) {
      console.error("Error en deleteContent:", error);
      setError(error);
      return { success: false, error: error };
    } finally {
      setLoading(false);
    }
  };

  return {
    resolveReport,
    dismissReport,
    deleteContent,
    loading,
    error,
  };
};
