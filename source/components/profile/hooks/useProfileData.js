import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "./../../../config/firebase";

// Hook simplificado para datos básicos del perfil (en tiempo real)
export const useProfileData = (userId = null) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const targetUserId =
    userId || (auth.currentUser ? auth.currentUser.uid : null);

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", targetUserId),
      (doc) => {
        try {
          if (doc.exists()) {
            const userData = doc.data();

            const formattedData = {
              nombreCompleto: userData.name
                ? `${userData.name.name || ""} ${
                    userData.name.apellidopat || ""
                  } ${userData.name.apellidomat || ""}`.trim()
                : "Usuario",
              especialidad: userData.professionalInfo?.specialty || "Médico",
              fotoPerfil: userData.photoURL || null,
              fechaRegistro: userData.joinDate?.toDate?.() || new Date(),
              estadisticas: {
                aura: userData.stats?.aura || 0,
                interacciones:
                  (userData.stats?.postCount || 0) +
                  (userData.stats?.commentCount || 0),
                diasPlataforma: Math.floor(
                  (new Date() - (userData.joinDate?.toDate?.() || new Date())) /
                    (1000 * 60 * 60 * 24)
                ),
                temasParticipacion: userData.joinedForums?.length || 0,
              },
            };

            setProfileData(formattedData);
          } else {
            setError("Usuario no encontrado");
          }
          setLoading(false);
        } catch (err) {
          console.error("Error procesando datos del perfil:", err);
          setError("Error cargando perfil");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error en snapshot del perfil:", err);
        setError("Error de conexión");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [targetUserId]);

  return { profileData, loading, error };
};
