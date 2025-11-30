import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./../../../config/firebase";
import { doc } from "firebase/firestore";

const getExpirationDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date;
};

export const notificationService = {
  smartCleanup: async (userId) => {
    try {
      console.log(`🔧 Limpieza inteligente para: ${userId}`);

      // 1. Primero obtener TODAS las notificaciones del usuario
      const allNotifications =
        await notificationService.getAllUserNotifications(userId);

      if (allNotifications.length === 0) {
        return { success: true, expiredDeleted: 0, oldDeleted: 0 };
      }

      // 2. Filtrar expiradas LOCALMENTE
      const now = new Date();
      const expiredNotifications = allNotifications.filter((notif) => {
        const expiresAt = notif.expiresAt?.toDate();
        return expiresAt && expiresAt <= now;
      });

      // 3. Eliminar expiradas
      let expiredDeleted = 0;
      if (expiredNotifications.length > 0) {
        expiredDeleted = await notificationService.deleteNotificationsByIds(
          expiredNotifications.map((n) => n.id)
        );
      }

      // 4. Verificar límite de cantidad (después de eliminar expiradas)
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

      console.log(
        `🗑️ Resultado limpieza: ${expiredDeleted} expiradas, ${oldDeleted} antiguas`
      );
      return {
        success: true,
        expiredDeleted,
        oldDeleted,
      };
    } catch (error) {
      console.error("❌ Error en limpieza inteligente:", error);
      return { success: false, error: error.message };
    }
  },

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

      console.log(`✅ Verificación aprobada enviada por: ${adminEmail}`);
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

      console.log(`✅ Verificación rechazada enviada por: ${adminEmail}`);
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

      console.log(`Sanción enviada por: ${moderatorEmail}`);
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
      console.log(`Notificación de post aprobado enviada a: ${userId}`);
    } catch (error) {
      console.error("Error en notificación de post aprobado:", error);
    }
  },

  sendPostRejected: async (userId, forumId, forumName, reason) => {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        type: "post_rejected",
        title: "Publicación Rechazada",
        message: `Tu publicación en "${forumName}" fue rechazada. Motivo: ${reason}`,
        isRead: false,
        isActionable: true,
        actionData: {
          forumId,
          forumName,
          reason,
          actionRequired: "edit_and_resubmit",
        },
        createdAt: new Date(),
        expiresAt: getExpirationDate(),
      });
      console.log(`Notificación de post rechazado enviada a: ${userId}`);
    } catch (error) {
      console.error("Error en notificación de post rechazado:", error);
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
      console.log(`Notificación de moderador asignado enviada a: ${userId}`);
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
      console.log(`Notificación de ban de comunidad enviada a: ${userId}`);
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
      console.log(`Notificación de membresía aprobada enviada a: ${userId}`);
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
      console.log(`✅ Notificación de transferencia enviada a: ${userId}`);
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
