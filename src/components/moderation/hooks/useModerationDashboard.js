import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useReports } from "../../reports/hooks/useReports";

export const useModerationDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [deletedContent, setDeletedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Reportes de usuarios
  const {
    reports: userReports,
    loading: reportsLoading,
    refresh: refreshUserReports,
  } = useReports();

  // Cargar contenido eliminado para estadísticas
  const loadDeletedContent = async () => {
    try {
      // Posts eliminados
      const deletedPostsQuery = query(
        collection(db, "deleted_posts"),
        orderBy("deletedAt", "desc"),
        where("moderatorAction", "==", true)
      );
      const deletedPostsSnapshot = await getDocs(deletedPostsQuery);
      const postsData = deletedPostsSnapshot.docs.map((doc) => ({
        id: doc.id,
        type: "post",
        source: "audit",
        ...doc.data(),
      }));

      // Comentarios eliminados
      const deletedCommentsQuery = query(
        collection(db, "deleted_comments"),
        orderBy("deletedAt", "desc"),
        where("moderatorAction", "==", true)
      );
      const deletedCommentsSnapshot = await getDocs(deletedCommentsQuery);
      const commentsData = deletedCommentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        type: "comment",
        source: "audit",
        ...doc.data(),
      }));

      setDeletedContent([...postsData, ...commentsData]);
    } catch (error) {
      console.error("Error loading deleted content:", error);
      throw error;
    }
  };

  // Cargar datos según la pestaña activa
  const loadDataForTab = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar contenido eliminado para estadísticas (siempre)
      await loadDeletedContent();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataForTab();
  }, [activeTab, refreshTrigger]);

  // Obtener reportes según pestaña
  const getCombinedReports = () => {
    switch (activeTab) {
      case "pending":
        // Solo reportes de usuarios pendientes
        return userReports.filter((report) => report.status === "pending");

      case "resolved":
        // Solo reportes de usuarios resueltos
        return userReports.filter((report) => report.status === "resolved");

      case "user_reports":
        // En auditoría, mostrar TODOS los reportes de usuarios
        return userReports;

      default:
        return [];
    }
  };

  // Estadísticas simplificadas
  const stats = {
    pending: userReports.filter((r) => r.status === "pending").length,
    resolved: userReports.filter((r) => r.status === "resolved").length,
    user_reports: userReports.length, // Para auditoría usamos el conteo total de reportes
    audit: deletedContent.length, // Mantenemos esta estadística pero no la usamos en tabs
    total: userReports.length,
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
