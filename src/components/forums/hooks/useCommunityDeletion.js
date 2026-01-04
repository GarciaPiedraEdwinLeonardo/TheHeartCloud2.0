import { useState } from "react";
import axiosInstance from "./../../../config/axiosInstance";

export const useCommunityDeletion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Eliminar comunidad (solo admins del sistema)
   */
  const deleteCommunity = async (forumId, reason, deletedBy) => {
    setLoading(true);
    setError(null);

    try {
      if (!forumId) {
        throw new Error("ID de comunidad no proporcionado");
      }

      const response = await axiosInstance.delete(`/api/forums/${forumId}`, {
        data: { reason },
      });

      return {
        success: true,
        message: response.message,
        stats: response.data,
      };
    } catch (err) {
      console.error("❌ Error en el proceso de eliminación:", err);

      setError(err);
      return {
        success: false,
        error: err,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteCommunity,
    loading,
    error,
  };
};
