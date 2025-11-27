// Hook para acciones de reportes
import { useState } from "react";
import { reportService } from "./../services/reportService";

export const useReportActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createReport = async (reportData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await reportService.createReport(reportData);
      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error };
      }
      return { success: true, id: result.id };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    createReport,
    loading,
    error,
  };
};
