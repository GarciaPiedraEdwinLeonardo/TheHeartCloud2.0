import { useState } from "react";
import axiosInstance from "../../../config/axiosInstance";

export const useForumSettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Actualizar configuración del foro
   */
  const updateForumSettings = async (forumId, settings) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.put(
        `/api/forums/${forumId}/settings`,
        settings
      );

      return {
        success: true,
        postsActivated: response.data.postsActivated || 0,
        membersApproved: response.data.membersApproved || 0,
        message: response.message || "Configuración actualizada exitosamente",
      };
    } catch (err) {
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Transferir propiedad y abandonar como dueño
   */
  const leaveForumAsOwner = async (forumId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(
        `/api/forums/${forumId}/transfer-ownership`
      );

      return {
        success: true,
        newOwnerId: response.data.newOwnerId,
        previousOwnerId: response.data.previousOwnerId,
      };
    } catch (err) {
      console.error("❌ Error en leaveForumAsOwner:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    updateForumSettings,
    leaveForumAsOwner,
    loading,
    error,
  };
};
