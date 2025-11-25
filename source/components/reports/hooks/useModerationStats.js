import { useState, useEffect } from "react";
import { moderationLogsService } from "../services/moderationLogsService";
import { reportsService } from "../services/reportsService";

export const useModerationStats = (timeRange = 30) => {
  const [stats, setStats] = useState(null);
  const [reportsStats, setReportsStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);

      const [moderationStats, reportsData] = await Promise.all([
        moderationLogsService.getModerationStats(timeRange),
        reportsService.getReportsStats(),
      ]);

      if (moderationStats.success) {
        setStats(moderationStats.stats);
      }

      if (reportsData.success) {
        setReportsStats(reportsData.stats);
      }

      setError(null);
    } catch (err) {
      setError("Error cargando estadísticas");
      console.error("Error en useModerationStats:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTopModerators = () => {
    if (!stats?.actionsByModerator) return [];

    return Object.entries(stats.actionsByModerator)
      .map(([moderatorId, count]) => ({ moderatorId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getMostCommonActions = () => {
    if (!stats?.actionsByType) return [];

    return Object.entries(stats.actionsByType)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  return {
    stats: {
      ...stats,
      reports: reportsStats,
    },
    loading,
    error,
    refresh: loadStats,
    topModerators: getTopModerators(),
    commonActions: getMostCommonActions(),
  };
};
