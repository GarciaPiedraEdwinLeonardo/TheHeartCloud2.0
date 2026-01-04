import { useState } from "react";
import axiosInstance from "../../../config/axiosInstance";

export const useReportActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createReport = async (reportData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await axiosInstance.post("/api/reports", reportData);
      return { success: true, id: data.data.reportId };
    } catch (error) {
      setError(error);
      return { success: false, error: error };
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
