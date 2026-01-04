import axiosInstance from "./../../../config/axiosInstance";
import { auth } from "./../../../config/firebase";

export const useForumActions = () => {
  const user = auth.currentUser;

  /**
   * Verificar si el nombre de foro ya existe
   */
  const checkForumNameExists = async (forumName) => {
    try {
      const response = await axiosInstance.post("/api/forums/check-name", {
        name: forumName,
      });

      return response.data;
    } catch (error) {
      console.error("Error verificando nombre de foro:", error);
      return { exists: false, existingForumName: "" };
    }
  };

  /**
   * Crear nueva comunidad
   */
  const createForum = async (forumData) => {
    try {
      if (!user)
        throw new Error("Debes iniciar sesión para crear una comunidad");

      const response = await axiosInstance.post("/api/forums", forumData);

      return {
        success: true,
        forumId: response.data.forumId,
        forum: response.data.forum,
      };
    } catch (error) {
      console.error("Error creando comunidad:", error);
      return { success: false, error: error };
    }
  };

  /**
   * Unirse a comunidad
   */
  const joinForum = async (forumId) => {
    try {
      if (!user)
        throw new Error("Debes iniciar sesión para unirte a una comunidad");

      const response = await axiosInstance.post(`/api/forums/${forumId}/join`);

      return {
        success: true,
        requiresApproval: response.data.requiresApproval,
        message: response.message,
      };
    } catch (error) {
      console.error("Error uniéndose a comunidad:", error);
      return { success: false, error: error };
    }
  };

  /**
   * Abandonar comunidad
   */
  const leaveForum = async (forumId) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      await axiosInstance.post(`/api/forums/${forumId}/leave`);

      return { success: true };
    } catch (error) {
      console.error("Error abandonando comunidad:", error);
      return { success: false, error: error };
    }
  };

  /**
   * Aprobar miembro
   */
  const approveMember = async (forumId, userId) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      await axiosInstance.post(
        `/api/forums/${forumId}/members/${userId}/approve`
      );

      return { success: true };
    } catch (error) {
      console.error("Error aprobando miembro:", error);
      return { success: false, error: error };
    }
  };

  /**
   * Rechazar miembro
   */
  const rejectMember = async (forumId, userId) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      await axiosInstance.post(
        `/api/forums/${forumId}/members/${userId}/reject`
      );

      return { success: true };
    } catch (error) {
      console.error("Error rechazando miembro:", error);
      return { success: false, error: error };
    }
  };

  /**
   * Actualizar configuración de membresía
   */
  const updateMembershipSettings = async (forumId, requiresApproval) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      await axiosInstance.put(`/api/forums/${forumId}/settings`, {
        membershipSettings: { requiresApproval },
      });

      return { success: true };
    } catch (error) {
      console.error("Error actualizando configuración:", error);
      return { success: false, error: error };
    }
  };

  /**
   * Agregar moderador
   */
  const addModerator = async (forumId, targetUserId) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      await axiosInstance.post(
        `/api/forums/${forumId}/moderators/${targetUserId}`
      );

      return { success: true };
    } catch (error) {
      console.error("Error agregando moderador:", error);
      return { success: false, error: error };
    }
  };

  /**
   * Remover moderador
   */
  const removeModerator = async (forumId, targetUserId) => {
    try {
      if (!user) throw new Error("Debes iniciar sesión");

      await axiosInstance.delete(
        `/api/forums/${forumId}/moderators/${targetUserId}`
      );

      return { success: true };
    } catch (error) {
      console.error("Error removiendo moderador:", error);
      return { success: false, error: error };
    }
  };

  /**
   * Verificar si usuario es miembro y su rol
   */
  const checkUserMembership = async (forumId) => {
    try {
      if (!user) return { isMember: false, role: null };

      const response = await axiosInstance.get(`/api/forums/${forumId}`);
      const forumData = response.data;

      const isMember = forumData.members?.includes(user.uid) || false;

      let role = "member";
      if (forumData.ownerId === user.uid) {
        role = "owner";
      } else if (forumData.moderators && forumData.moderators[user.uid]) {
        role = "moderator";
      }

      return { isMember, role };
    } catch (error) {
      console.error("Error verificando membresía:", error);
      return { isMember: false, role: null };
    }
  };

  /**
   * Obtener datos específicos de una comunidad
   */
  const getForumData = async (forumId) => {
    try {
      const response = await axiosInstance.get(`/api/forums/${forumId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error obteniendo datos de comunidad:", error);
      return { success: false, error: error };
    }
  };

  /**
   * Verificar si usuario está baneado
   */
  const isUserBannedFromForum = async (forumId, userId) => {
    try {
      const response = await axiosInstance.get(
        `/api/forums/${forumId}/bans/${userId}`
      );
      return response.data.isBanned;
    } catch (error) {
      console.error("Error verificando baneo:", error);
      return false;
    }
  };

  return {
    createForum,
    joinForum,
    leaveForum,
    addModerator,
    removeModerator,
    checkUserMembership,
    getForumData,
    approveMember,
    rejectMember,
    updateMembershipSettings,
    isUserBannedFromForum,
    checkForumNameExists,
  };
};
