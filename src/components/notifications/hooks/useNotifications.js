import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  doc,
  writeBatch,
  getDocs,
  startAfter,
} from "firebase/firestore";
import { db, auth } from "./../../../config/firebase";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);

  const user = auth.currentUser;

  // Cargar notificaciones iniciales
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

        // Configurar paginación
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

  // Cargar más notificaciones
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

  // Marcar como leída
  const markAsRead = async (notificationId) => {
    if (!user) return;

    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
      });
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    try {
      const batch = writeBatch(db);
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      unreadNotifications.forEach((notification) => {
        const notificationRef = doc(db, "notifications", notification.id);
        batch.update(notificationRef, { isRead: true });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
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
  };
};
