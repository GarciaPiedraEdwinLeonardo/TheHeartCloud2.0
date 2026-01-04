import { useState } from "react";
import axiosInstance from "./../../../config/axiosInstance";

export const useCommunityBans = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Banear usuario de la comunidad
   */
  const banUser = async (forumId, userId, reason, duration = "permanent") => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/api/forums/${forumId}/bans`, {
        userId,
        reason,
        duration,
      });

      return {
        success: true,
        banData: response.data.banData,
        wasMember: response.data.wasMember,
      };
    } catch (error) {
      console.error("Error baneando usuario:", error);
      return { success: false, error: error };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verificar si usuario está baneado
   */
  const isUserBanned = async (forumId, userId) => {
    try {
      const response = await axiosInstance.get(
        `/api/forums/${forumId}/bans/${userId}`
      );
      return response.data.isBanned;
    } catch (error) {
      console.error("Error verificando estado de baneo:", error);
      return false;
    }
  };

  /**
   * Desbanear usuario
   */
  const unbanUser = async (forumId, userId) => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/api/forums/${forumId}/bans/${userId}`);

      return { success: true };
    } catch (error) {
      console.error("❌ Error desbaneando usuario:", error);
      return { success: false, error: error };
    } finally {
      setLoading(false);
    }
  };

  return {
    banUser,
    isUserBanned,
    unbanUser,
    loading,
  };
};
