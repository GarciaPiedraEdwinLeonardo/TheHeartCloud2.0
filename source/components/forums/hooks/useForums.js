// hooks/useForums.js
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
      where("status", "==", "active"), // Solo comunidades activas
      orderBy("memberCount", "desc"), // Ordenar por miembros (más relevantes)
      limit(10) // Solo 10 comunidades
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
              // Asegurar que memberCount esté definido
              memberCount: data.memberCount || 0,
              // Asegurar que createdAt esté disponible
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

    return unsubscribe;
  }, []);

  return { forums, loading, error };
};
