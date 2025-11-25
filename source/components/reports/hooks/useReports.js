import { useState, useEffect } from "react";
import { reportsService } from "./../services/reportsService";

export const useReports = (filters = {}) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadReports();
    loadStats();
  }, [filters]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const result = await reportsService.getReports(filters);

      if (result.success) {
        setReports(result.reports);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Error cargando reportes");
      console.error("Error en useReports:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const result = await reportsService.getReportsStats();
    if (result.success) {
      setStats(result.stats);
    }
  };

  const updateReportStatus = async (reportId, status, notes = null) => {
    try {
      const updates = { status };
      if (notes) updates.moderatorNotes = notes;

      const result = await reportsService.updateReport(reportId, updates);

      if (result.success) {
        // Actualizar lista local
        setReports((prev) =>
          prev.map((report) =>
            report.id === reportId
              ? { ...report, ...updates, updatedAt: new Date() }
              : report
          )
        );
        await loadStats(); // Recargar estadísticas
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error("Error actualizando reporte:", err);
      return { success: false, error: err.message };
    }
  };

  const resolveReport = async (reportId, actionTaken, notes = "") => {
    return updateReportStatus(
      reportId,
      "resolved",
      `${actionTaken} - ${notes}`
    );
  };

  const dismissReport = async (reportId, reason = "") => {
    return updateReportStatus(reportId, "dismissed", `Desestimado: ${reason}`);
  };

  return {
    reports,
    loading,
    error,
    stats,
    refresh: loadReports,
    updateReportStatus,
    resolveReport,
    dismissReport,
  };
};
