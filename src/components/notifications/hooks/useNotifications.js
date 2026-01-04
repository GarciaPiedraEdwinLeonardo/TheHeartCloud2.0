import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "./../../../config/firebase";
import axiosInstance from "./../../../config/axiosInstance";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(20)
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
          notificationsData.push(notification);

          if (!notification.isRead) {
            unread++;
          }
        });

        setNotifications(notificationsData);
        setUnreadCount(unread);
        setLoading(false);

        if (snapshot.docs.length > 0) {
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        }
        setHasMore(snapshot.docs.length === 20);
      },
      (error) => {
        console.error("Error cargando notificaciones:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const loadMore = useCallback(async () => {
    if (!user || !lastVisible || !hasMore) return;

    setLoading(true);
    try {
      const notificationsRef = collection(db, "notifications");
      const q = query(
        notificationsRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(20)
      );

      const snapshot = await getDocs(q);
      const newNotifications = [];

      snapshot.forEach((doc) => {
        newNotifications.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setNotifications((prev) => [...prev, ...newNotifications]);

      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }
      setHasMore(snapshot.docs.length === 20);
    } catch (error) {
      console.error("Error cargando más notificaciones:", error);
    } finally {
      setLoading(false);
    }
  }, [user, lastVisible, hasMore]);

  const markAsRead = async (notificationId) => {
    if (!user) return;

    try {
      await axiosInstance.put(`/api/notifications/${notificationId}/read`);
      // El listener de Firestore actualizará automáticamente el estado
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    try {
      await axiosInstance.put("/api/notifications/mark-all-read");
      // El listener de Firestore actualizará automáticamente el estado
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!user) return;

    try {
      await axiosInstance.delete(`/api/notifications/${notificationId}`);
      // Actualizar estado local inmediatamente para mejor UX
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando notificación:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteAllNotifications = async () => {
    if (!user) return;

    try {
      const result = await axiosInstance.delete("/api/notifications");
      // Actualizar estado local
      setNotifications([]);
      setUnreadCount(0);
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      console.error("Error eliminando todas las notificaciones:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteReadNotifications = async () => {
    if (!user) return;

    try {
      const result = await axiosInstance.delete("/api/notifications/read/all");
      // Actualizar estado local
      setNotifications((prev) => prev.filter((n) => !n.isRead));
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      console.error("Error eliminando notificaciones leídas:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    markAsRead,
    markAllAsRead,
    loadMore,
    deleteNotification,
    deleteAllNotifications,
    deleteReadNotifications,
  };
};
