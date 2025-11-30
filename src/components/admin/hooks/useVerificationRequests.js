import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../config/firebase";

export const useVerificationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Escuchar todos los usuarios y filtrar en el cliente
    const q = collection(db, "users");

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requestsData = [];
        snapshot.forEach((doc) => {
          const userData = doc.data();
          // Filtrar solo los pendientes de verificación
          if (userData.professionalInfo?.verificationStatus === "pending") {
            requestsData.push({
              id: doc.id,
              ...userData,
            });
          }
        });

        // Ordenar por joinDate (más antiguos primero)
        requestsData.sort((a, b) => {
          const dateA = a.joinDate?.seconds || 0;
          const dateB = b.joinDate?.seconds || 0;
          return dateA - dateB;
        });

        setRequests(requestsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching requests:", error);
        setError("Error al cargar las solicitudes");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { requests, loading, error };
};
