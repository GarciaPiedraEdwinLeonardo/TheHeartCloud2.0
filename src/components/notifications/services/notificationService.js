import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  writeBatch,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./../../../config/firebase";

const getExpirationDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30); // Las notificaciones expirarán en 30 días
  return date;
};

export const notificationService = {
  /**
   * Elimina una notificación individual
   */
  deleteNotification: async (notificationId) => {
    try {
      await deleteDoc(doc(db, "notifications", notificationId));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando notificación:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Elimina todas las notificaciones de un usuario
   */
  deleteAllUserNotifications: async (userId) => {
    try {
      const notifications = await notificationService.getAllUserNotifications(
        userId
      );

      if (notifications.length === 0) {
        return { success: true, deletedCount: 0 };
      }

      const batch = writeBatch(db);
      notifications.forEach((notif) => {
        const docRef = doc(db, "notifications", notif.id);
        batch.delete(docRef);
      });

      await batch.commit();
      return { success: true, deletedCount: notifications.length };
    } catch (error) {
      console.error("Error eliminando todas las notificaciones:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Elimina solo las notificaciones leídas de un usuario
   */
  deleteReadNotifications: async (userId) => {
    try {
      const notifications = await notificationService.getAllUserNotifications(
        userId
      );
      const readNotifications = notifications.filter((n) => n.isRead);

      if (readNotifications.length === 0) {
        return { success: true, deletedCount: 0 };
      }

      const deletedCount = await notificationService.deleteNotificationsByIds(
        readNotifications.map((n) => n.id)
      );

      return { success: true, deletedCount };
    } catch (error) {
      console.error("Error eliminando notificaciones leídas:", error);
      return { success: false, error: error.message };
    }
  },

  // ============= LIMPIEZA AUTOMÁTICA MEJORADA =============

  /**
   * Limpieza inteligente que se ejecuta automáticamente
   * - Elimina notificaciones expiradas (>30 días)
   * - Mantiene máximo 80 notificaciones por usuario
   */
  smartCleanup: async (userId) => {
    try {
      const allNotifications =
        await notificationService.getAllUserNotifications(userId);

      if (allNotifications.length === 0) {
        return { success: true, expiredDeleted: 0, oldDeleted: 0 };
      }

      // 1. Filtrar y eliminar notificaciones expiradas
      const now = new Date();
      const expiredNotifications = allNotifications.filter((notif) => {
        const expiresAt = notif.expiresAt?.toDate();
        return expiresAt && expiresAt <= now;
      });

      let expiredDeleted = 0;
      if (expiredNotifications.length > 0) {
        expiredDeleted = await notificationService.deleteNotificationsByIds(
          expiredNotifications.map((n) => n.id)
        );
      }

      // 2. Verificar límite de cantidad (después de eliminar expiradas)
      const remainingNotifications = allNotifications.length - expiredDeleted;

      let oldDeleted = 0;
      if (remainingNotifications > 80) {
        // Ordenar por fecha y mantener solo las 80 más recientes
        const sortedNotifications = allNotifications
          .filter(
            (notif) => !expiredNotifications.find((exp) => exp.id === notif.id)
          )
          .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

        const notificationsToDelete = sortedNotifications.slice(80);
        oldDeleted = await notificationService.deleteNotificationsByIds(
          notificationsToDelete.map((n) => n.id)
        );
      }

      return {
        success: true,
        expiredDeleted,
        oldDeleted,
      };
    } catch (error) {
      console.error("Error en limpieza inteligente:", error);
      return { success: false, error: error.message };
    }
  },

  // ============= FUNCIONES AUXILIARES =============

  getAllUserNotifications: async (userId) => {
    try {
      const notificationsRef = collection(db, "notifications");
      const q = query(notificationsRef, where("userId", "==", userId));

      const snapshot = await getDocs(q);
      const notifications = [];

      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return notifications;
    } catch (error) {
      console.error("❌ Error obteniendo notificaciones:", error);
      return [];
    }
  },

  deleteNotificationsByIds: async (notificationIds) => {
    if (notificationIds.length === 0) return 0;

    try {
      const batch = writeBatch(db);
      let deletedCount = 0;

      notificationIds.forEach((id) => {
        const docRef = doc(db, "notifications", id);
        batch.delete(docRef);
        deletedCount++;
      });

      await batch.commit();
      return deletedCount;
    } catch (error) {
      console.error("❌ Error eliminando por IDs:", error);
      return 0;
    }
  },

  // ============= FUNCIONES DE ENVÍO DE NOTIFICACIONES =============

  sendVerificationApproved: async (userId, userName, adminEmail) => {
    try {
      await notificationService.smartCleanup(userId);

      await addDoc(collection(db, "notifications"), {
        userId,
        type: "verification_approved",
        title: "¡Verificación Aprobada! 🎉",
        message: `Felicidades ${userName}, tu cuenta médica ha sido verificada y ahora puedes publicar y comentar.`,
        isRead: false,
        isActionable: false,
        actionData: {
          triggeredByUsername: adminEmail,
        },
        createdAt: new Date(),
        expiresAt: getExpirationDate(),
      });
    } catch (error) {
      console.error("Error en notificación de aprobación:", error);
    }
  },

  sendVerificationRejected: async (userId, userName, reason, adminEmail) => {
    try {
      await notificationService.smartCleanup(userId);

      await addDoc(collection(db, "notifications"), {
        userId,
        type: "verification_rejected",
        title: "Solicitud Rechazada ❌",
        message: `Tu solicitud de verificación fue rechazada. Razón: ${reason}`,
        isRead: false,
        isActionable: true,
        actionData: {
          triggeredByUsername: adminEmail,
          actionRequired: "resubmit_verification",
        },
        createdAt: new Date(),
        expiresAt: getExpirationDate(),
      });
    } catch (error) {
      console.error("Error en notificación de rechazo:", error);
    }
  },

  sendSanctionNotification: async (
    userId,
    duration,
    reason,
    moderatorEmail
  ) => {
    try {
      await notificationService.smartCleanup(userId);

      const title =
        duration === "Permanente"
          ? "Suspensión Permanente 🔴"
          : `Suspensión Temporal - ${duration} ⚠️`;

      const message =
        duration === "Permanente"
          ? `Tu cuenta ha sido suspendida permanentemente. Razón: ${reason}`
          : `Tu cuenta ha sido suspendida por ${duration}. Razón: ${reason}`;

      await addDoc(collection(db, "notifications"), {
        userId,
        type: "user_suspended",
        title: title,
        message: message,
        isRead: false,
        isActionable: false,
        actionData: {
          triggeredByUsername: moderatorEmail,
        },
        createdAt: new Date(),
        expiresAt: getExpirationDate(),
      });
    } catch (error) {
      console.error("Error en notificación de sanción:", error);
    }
  },

  sendPostApproved: async (userId, forumId, forumName) => {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        type: "post_approved",
        title: "Publicación Aprobada",
        message: `Tu publicación en "${forumName}" ha sido aprobada y ahora es visible para todos.`,
        isRead: false,
        isActionable: false,
        actionData: { forumId, forumName },
        createdAt: new Date(),
        expiresAt: getExpirationDate(),
      });
    } catch (error) {
      console.error("Error en notificación de post aprobado:", error);
    }
  },

  sendPostRejected: async (userId, forumId, forumName) => {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        type: "post_rejected",
        title: "Publicación Rechazada",
        message: `Tu publicación en "${forumName}" fue rechazada`,
        isRead: false,
        isActionable: true,
        actionData: {
          forumId,
          forumName,
        },
        createdAt: new Date(),
        expiresAt: getExpirationDate(),
      });
    } catch (error) {
      console.error("Error en notificación de post rechazado:", error);
    }
  },

  sendPostDeletedByModerator: async (userId, postName) => {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        type: "post_deleted",
        title: "Publicación Eliminada",
        message: `Tu publicación "${postName}" fue eliminada por un moderador.`,
        isRead: false,
        isActionable: false,
        actionData: { postName },
        createdAt: new Date(),
        expiresAt: getExpirationDate(),
      });
    } catch (error) {
      console.error("Error en notificación de post eliminado:", error);
    }
  },

  sendModeratorAssigned: async (userId, forumName) => {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        type: "moderator_assigned",
        title: "Eres ahora moderador",
        message: `Has sido asignado como moderador en la comunidad "${forumName}". Ahora puedes gestionar publicaciones y miembros.`,
        isRead: false,
        isActionable: false,
        actionData: { forumName },
        createdAt: new Date(),
        expiresAt: getExpirationDate(),
      });
    } catch (error) {
      console.error("Error en notificación de moderador:", error);
    }
  },

  sendCommunityBan: async (userId, forumName, reason, duration) => {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        type: "community_ban",
        title: "Baneado de comunidad",
        message: `Has sido baneado de "${forumName}". Motivo: ${reason} - Duración: ${duration}`,
        isRead: false,
        isActionable: false,
        actionData: { forumName, reason, duration },
        createdAt: new Date(),
        expiresAt: getExpirationDate(),
      });
    } catch (error) {
      console.error("Error en notificación de ban:", error);
    }
  },

  sendMembershipApproved: async (userId, forumName) => {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        type: "membership_approved",
        title: "Solicitud aprobada",
        message: `Tu solicitud para unirte a "${forumName}" ha sido aprobada. ¡Bienvenido!`,
        isRead: false,
        isActionable: false,
        actionData: { forumName },
        createdAt: new Date(),
        expiresAt: getExpirationDate(),
      });
    } catch (error) {
      console.error("Error en notificación de membresía:", error);
    }
  },

  sendOwnershipTransferred: async (userId, forumName) => {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        type: "ownership_transferred",
        title: "👑 Eres ahora dueño",
        message: `Has sido asignado como dueño de la comunidad "${forumName}". Ahora tienes control total.`,
        isRead: false,
        isActionable: false,
        actionData: { forumName },
        createdAt: new Date(),
        expiresAt: getExpirationDate(),
      });
    } catch (error) {
      console.error("Error en notificación de transferencia:", error);
    }
  },

  sendCommentDeletedByModerator: async (userId, forumId, reason) => {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        type: "comment_deleted",
        title: "Comentario Eliminado",
        message: `Tu comentario fue eliminado por un moderador. Motivo: ${reason}`,
        isRead: false,
        isActionable: false,
        actionData: { forumId, reason },
        createdAt: new Date(),
        expiresAt: getExpirationDate(),
      });
    } catch (error) {
      console.error("Error en notificación de comentario eliminado:", error);
    }
  },
};
