import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useReports } from "../../reports/hooks/useReports";

export const useModerationDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [globalReports, setGlobalReports] = useState([]);
  const [deletedPosts, setDeletedPosts] = useState([]);
  const [deletedComments, setDeletedComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Reportes de usuarios
  const {
    reports: userReports,
    loading: reportsLoading,
    refresh: refreshUserReports,
  } = useReports({
    status:
      activeTab === "pending"
        ? "pending"
        : activeTab === "resolved"
        ? "resolved"
        : null,
  });

  // Cargar reportes globales
  const loadGlobalReports = async () => {
    try {
      const q = query(
        collection(db, "global_moderation_reports"),
        orderBy("reportedAt", "desc")
      );

      const snapshot = await getDocs(q);
      const reportsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGlobalReports(reportsData);
    } catch (error) {
      console.error("Error loading global reports:", error);
      throw error;
    }
  };

  // Cargar contenido eliminado
  const loadDeletedContent = async () => {
    try {
      // Cargar posts eliminados
      const deletedPostsQuery = query(
        collection(db, "deleted_posts"),
        orderBy("deletedAt", "desc"),
        where("moderatorAction", "==", true)
      );

      const deletedPostsSnapshot = await getDocs(deletedPostsQuery);
      const postsData = deletedPostsSnapshot.docs.map((doc) => ({
        id: doc.id,
        type: "post",
        ...doc.data(),
      }));
      setDeletedPosts(postsData);

      // Cargar comentarios eliminados
      const deletedCommentsQuery = query(
        collection(db, "deleted_comments"),
        orderBy("deletedAt", "desc"),
        where("moderatorAction", "==", true)
      );

      const deletedCommentsSnapshot = await getDocs(deletedCommentsQuery);
      const commentsData = deletedCommentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        type: "comment",
        ...doc.data(),
      }));
      setDeletedComments(commentsData);
    } catch (error) {
      console.error("Error loading deleted content:", error);
      throw error;
    }
  };

  // Cargar todos los datos
  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadGlobalReports(),
        activeTab === "audit" ? loadDeletedContent() : Promise.resolve(),
      ]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales y cuando cambie la pestaña
  useEffect(() => {
    loadAllData();
  }, [activeTab, refreshTrigger]);

  // Cargar contenido eliminado cuando se active la pestaña de auditoría
  useEffect(() => {
    if (activeTab === "audit") {
      loadDeletedContent();
    }
  }, [activeTab]);

  // Combinar reportes según pestaña activa
  const getCombinedReports = () => {
    switch (activeTab) {
      case "pending":
        return [
          ...userReports.filter((r) => r.status === "pending"),
          ...globalReports.filter((r) => r.status === "pending_review"),
        ];
      case "resolved":
        return [
          ...userReports.filter((r) => r.status === "resolved"),
          ...globalReports.filter((r) => r.status === "resolved"),
        ];
      case "global":
        return globalReports;
      case "user_reports":
        return userReports;
      case "audit":
        return [...deletedPosts, ...deletedComments];
      default:
        return [];
    }
  };

  const stats = {
    pending:
      userReports.filter((r) => r.status === "pending").length +
      globalReports.filter((r) => r.status === "pending_review").length,
    resolved:
      userReports.filter((r) => r.status === "resolved").length +
      globalReports.filter((r) => r.status === "resolved").length,
    global: globalReports.length,
    user_reports: userReports.length,
    audit: deletedPosts.length + deletedComments.length,
    total:
      userReports.length +
      globalReports.length +
      deletedPosts.length +
      deletedComments.length,
  };

  const refreshAll = () => {
    setRefreshTrigger((prev) => prev + 1);
    refreshUserReports();
  };

  return {
    reports: getCombinedReports(),
    loading: loading || reportsLoading,
    error,
    activeTab,
    setActiveTab,
    stats,
    refreshData: refreshAll,
  };
};
