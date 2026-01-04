import { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { useReports } from "../../reports/hooks/useReports";

export const useModerationDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Reportes de usuarios
  const {
    reports: userReports,
    loading: reportsLoading,
    refresh: refreshUserReports,
  } = useReports();

  // Cargar datos según la pestaña activa
  const loadDataForTab = async () => {
    setLoading(true);
    setError(null);

    try {
      // Solo necesitamos los reportes de usuarios
      // No hay contenido eliminado que cargar
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
        return userReports.filter((report) => report.status === "pending");

      case "resolved":
        return userReports.filter((report) => report.status === "resolved");

      case "user_reports":
        return userReports;

      default:
        return [];
    }
  };

  // Estadísticas simplificadas
  const stats = {
    pending: userReports.filter((r) => r.status === "pending").length,
    resolved: userReports.filter((r) => r.status === "resolved").length,
    user_reports: userReports.length,
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
