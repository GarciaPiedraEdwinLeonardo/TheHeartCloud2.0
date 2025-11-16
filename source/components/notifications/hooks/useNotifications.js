import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../../config/firebase";
import { notificationService } from "../services/notificationService";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const initializeWithCleanup = async () => {
      try {
        console.log("🔄 Iniciando sistema de notificaciones...");
        await notificationService.smartCleanup(user.uid);
      } catch (cleanupError) {
        console.warn("⚠️ Limpieza inicial falló:", cleanupError);
      } finally {
        setupNotificationsListener(user.uid);
      }
    };

    const setupNotificationsListener = (userId) => {
      try {
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", userId)
        );

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const notificationsData = [];
            let unread = 0;

            snapshot.forEach((doc) => {
              const notification = {
                id: doc.id,
                ...doc.data(),
              };

              if (isValidNotification(notification)) {
                notificationsData.push(notification);
                if (!notification.isRead) unread++;
              }
            });

            notificationsData.sort((a, b) => {
              const dateA = a.createdAt?.seconds || 0;
              const dateB = b.createdAt?.seconds || 0;
              return dateB - dateA;
            });

            const limitedNotifications = notificationsData.slice(0, 80);

            setNotifications(limitedNotifications);
            setUnreadCount(unread);
            setLoading(false);
            setError(null);
          },
          (snapshotError) => {
            console.error("❌ Error en listener:", snapshotError);
            setError("Error al cargar notificaciones");
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (queryError) {
        console.error("❌ Error configurando query:", queryError);
        setError("Error en configuración");
        setLoading(false);
        return () => {};
      }
    };

    const isValidNotification = (notification) => {
      // Verificar tipos válidos
      const validTypes = [
        "verification_approved",
        "verification_rejected",
        "user_suspended",
      ];
      if (!validTypes.includes(notification.type)) {
        return false;
      }

      // Verificar que no esté expirada
      const expiresAt = notification.expiresAt?.toDate();
      if (expiresAt && expiresAt < new Date()) {
        return false;
      }

      return true;
    };

    initializeWithCleanup();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        isRead: true,
        readAt: new Date(),
      });

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("❌ Error marcando como leída:", error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      if (unreadNotifications.length === 0) return;

      const updatePromises = unreadNotifications.map((notification) =>
        updateDoc(doc(db, "notifications", notification.id), {
          isRead: true,
          readAt: new Date(),
        })
      );

      await Promise.all(updatePromises);

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("❌ Error marcando todas como leídas:", error);
      throw error;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  };
};
