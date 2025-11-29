import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebase";

export const useReports = (filters = {}) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadReports = async () => {
    setLoading(true);
    setError(null);

    try {
      let q = collection(db, "reports");

      // Aplicar filtros si existen
      const constraints = [];
      if (filters.status) {
        constraints.push(where("status", "==", filters.status));
      }
      if (filters.type) {
        constraints.push(where("type", "==", filters.type));
      }

      constraints.push(orderBy("createdAt", "desc"));
      q = query(q, ...constraints);

      const snapshot = await getDocs(q);
      const reportsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReports(reportsData);
    } catch (error) {
      console.error("Error loading reports:", error);
      setError(error.message);
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
