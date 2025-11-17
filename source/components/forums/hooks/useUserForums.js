// hooks/useUserForums.js - ACTUALIZADO
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "./../../../config/firebase";

export const useUserForums = () => {
  const [userForums, setUserForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setUserForums([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "forums"),
      where("isDeleted", "==", false),
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const userForumsList = [];

          snapshot.forEach((doc) => {
            const forumData = {
              id: doc.id,
              ...doc.data(),
              // Asegurar valores por defecto
              memberCount: doc.data().memberCount || 0,
              postCount: doc.data().postCount || 0,
            };

            // Verificar si el usuario es miembro (usando array)
            if (forumData.members && forumData.members.includes(user.uid)) {
              // Determinar el rol del usuario
              let userRole = "member";
              if (forumData.ownerId === user.uid) {
                userRole = "owner";
              } else if (
                forumData.moderators &&
                forumData.moderators[user.uid]
              ) {
                userRole = "moderator";
              }

              userForumsList.push({
                ...forumData,
                userRole: userRole,
              });
            }
          });

          setUserForums(userForumsList);
          setLoading(false);
        } catch (err) {
          console.error("Error cargando comunidades del usuario:", err);
          setError("Error cargando tus comunidades");
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error en conexión:", error);
        setError("Error en conexión con base de datos");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { userForums, loading, error };
};
