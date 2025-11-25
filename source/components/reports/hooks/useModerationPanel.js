// reports/hooks/useModerationPanel.js
import { useReports } from "./useReports";
import { useModerationStats } from "./useModerationStats";
import { useModerationActions } from "./useModerationActions";

/**
 * Hook combinado para el panel de moderación
 * @param {Object} filters - Filtros para los reportes
 * @param {string} [filters.status] - Estado del reporte: 'pending', 'reviewed', 'resolved', 'dismissed'
 * @param {string} [filters.targetType] - Tipo de contenido: 'post', 'comment', 'user', 'forum', 'profile'
 * @param {string} [filters.urgency] - Urgencia: 'low', 'medium', 'high', 'critical'
 * @returns {Object} Objeto con todas las funcionalidades de moderación
 */
export const useModerationPanel = (filters = {}) => {
  const reports = useReports(filters);
  const stats = useModerationStats();
  const actions = useModerationActions();

  return {
    // Reports
    reports: reports.reports,
    reportsLoading: reports.loading,
    reportsError: reports.error,
    reportsStats: reports.stats,
    refreshReports: reports.refresh,
    updateReportStatus: reports.updateReportStatus,
    resolveReport: reports.resolveReport,
    dismissReport: reports.dismissReport,

    // Stats
    moderationStats: stats.stats,
    statsLoading: stats.loading,
    statsError: stats.error,
    topModerators: stats.topModerators,
    commonActions: stats.commonActions,
    refreshStats: stats.refresh,

    // Actions
    takeAction: actions.takeAction,
    removePost: actions.removePost,
    removeComment: actions.removeComment,
    suspendUser: actions.suspendUser,
    warnUser: actions.warnUser,
    actionLoading: actions.loading,
    actionError: actions.error,
    clearActionError: actions.clearError,
  };
};
