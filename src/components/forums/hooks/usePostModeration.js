import { useState } from "react";
import axiosInstance from "./../../../config/axiosInstance";

export const usePostModeration = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Validar post pendiente
   */
  const validatePost = async (postId, forumId, forumName) => {
    setLoading(true);
    try {
      await axiosInstance.post(
        `/api/forums/${forumId}/posts/${postId}/validate`
      );

      return { success: true };
    } catch (error) {
      console.error("Error validando post:", error);
      return { success: false, error: error };
    } finally {
      setLoading(false);
    }
  };
  /**
   * Rechazar post pendiente
   */
  const rejectPost = async (postId, forumId, forumName) => {
    setLoading(true);
    try {
      await axiosInstance.post(`/api/forums/${forumId}/posts/${postId}/reject`);

      return { success: true };
    } catch (error) {
      console.error("Error rechazando post:", error);
      return { success: false, error: error };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener posts pendientes de validación
   */
  const getPendingPosts = async (forumId) => {
    try {
      const response = await axiosInstance.get(
        `/api/forums/${forumId}/pending-posts`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting pending posts:", error);
      return [];
    }
  };

  return {
    validatePost,
    rejectPost,
    getPendingPosts,
    loading,
  };
};
