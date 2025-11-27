import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./../../../config/firebase";

export const useForums = () => {
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "forums"),
      where("isDeleted", "==", false),
      where("status", "==", "active"),
      orderBy("memberCount", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const forumsData = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            forumsData.push({
              id: doc.id,
              ...data,
              memberCount: data.memberCount || 0,
              createdAt: data.createdAt?.toDate?.() || new Date(),
            });
          });

          setForums(forumsData);
          setLoading(false);
        } catch (err) {
          console.error("Error cargando comunidades:", err);
          setError("Error cargando comunidades");
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error en conexión:", error);
        setError("Error de conexión con la base de datos");
        setLoading(false);
      }
    );

    // Retornar función de cleanup correctamente
    return () => unsubscribe();
  }, []);

  return { forums, loading, error };
};
