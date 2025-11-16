import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "./../../../config/firebase";

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

      console.log(`✅ Sanción enviada por: ${moderatorEmail}`);
    } catch (error) {
      console.error("Error en notificación de sanción:", error);
    }
  },
};
