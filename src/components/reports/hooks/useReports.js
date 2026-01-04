import { useState, useEffect } from "react";
import axiosInstance from "../../../config/axiosInstance";

export const useReports = (filters = {}) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadReports = async () => {
    setLoading(true);
    setError(null);

    try {
      // Construir query params
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;

      const data = await axiosInstance.get("/api/reports", { params });
      setReports(data.data || []);
    } catch (error) {
      console.error("Error loading reports:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [filters.status, filters.type, refreshTrigger]);

  const refresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    reports,
    loading,
    error,
    refresh,
    reload: loadReports,
  };
};
