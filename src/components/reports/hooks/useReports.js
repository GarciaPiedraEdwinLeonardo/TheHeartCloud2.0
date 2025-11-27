import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../config/firebase";

export const useReports = (filters = {}) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

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

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const reportsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setReports(reportsData);
          setLoading(false);
        },
        (error) => {
          setError(error.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }, [filters.status, filters.type]);

  return { reports, loading, error };
};
