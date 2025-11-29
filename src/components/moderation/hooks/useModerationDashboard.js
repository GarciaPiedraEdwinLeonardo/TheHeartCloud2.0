import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useReports } from "../../reports/hooks/useReports";

export const useModerationDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [globalReports, setGlobalReports] = useState([]);
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
        source: "global",
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
      const loadPromises = [];

      // Siempre cargar reportes globales
      loadPromises.push(loadGlobalReports());

      // Cargar contenido eliminado solo para auditoría
      if (activeTab === "audit") {
        loadPromises.push(loadDeletedContent());
      }

      await Promise.all(loadPromises);
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

  // Obtener reportes combinados según pestaña
  const getCombinedReports = () => {
    switch (activeTab) {
      case "pending":
        // Solo reportes de usuarios pendientes
        return userReports.filter((report) => report.status === "pending");

      case "resolved":
        // Solo reportes de usuarios resueltos
        return userReports.filter((report) => report.status === "resolved");

      case "global":
        // Solo reportes globales
        return globalReports;

      case "user_reports":
        // Todos los reportes de usuarios
        return userReports;

      case "audit":
        // Contenido eliminado
        return deletedContent;

      default:
        return [];
    }
  };

  // Estadísticas simplificadas
  const stats = {
    pending: userReports.filter((r) => r.status === "pending").length,
    resolved: userReports.filter((r) => r.status === "resolved").length,
    global: globalReports.length,
    user_reports: userReports.length,
    audit: deletedContent.length,
    total: userReports.length + globalReports.length + deletedContent.length,
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
