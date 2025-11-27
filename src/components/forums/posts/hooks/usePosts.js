import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  getDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "./../../../../config/firebase";

export const usePosts = (forumId, postsLimit = 20) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!forumId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const user = auth.currentUser;

    // Función para verificar permisos
    const checkUserPermissions = async () => {
      if (!user) return false;

      try {
        const forumRef = doc(db, "forums", forumId);
        const forumDoc = await getDoc(forumRef);

        if (forumDoc.exists()) {
          const forumData = forumDoc.data();
          const isOwner = forumData.ownerId === user.uid;
          const isModerator =
            forumData.moderators && forumData.moderators[user.uid];

          return isOwner || isModerator;
        }
      } catch (error) {
        console.error("Error verificando permisos:", error);
      }

      return false;
    };

    // Función para configurar el listener
    const setupPostsListener = async () => {
      try {
        const canSeePendingPosts = await checkUserPermissions();

        let q;
        if (canSeePendingPosts) {
          // Moderadores y dueños pueden ver todos los posts
          q = query(
            collection(db, "posts"),
            where("forumId", "==", forumId),
            where("status", "in", ["active", "pending"]),
            orderBy("createdAt", "desc"),
            limit(postsLimit)
          );
        } else {
          // Usuarios normales solo ven posts activos
          q = query(
            collection(db, "posts"),
            where("forumId", "==", forumId),
            where("status", "==", "active"),
            orderBy("createdAt", "desc"),
            limit(postsLimit)
          );
        }

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            try {
              const postsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                likes: doc.data().likes || [],
                dislikes: doc.data().dislikes || [],
                images: doc.data().images || [],
                status: doc.data().status || "active",
                stats: {
                  commentCount: doc.data().stats?.commentCount || 0,
                  viewCount: doc.data().stats?.viewCount || 0,
                },
              }));

              setPosts(postsData);
              setLoading(false);
            } catch (err) {
              console.error("Error cargando posts:", err);
              setError("Error cargando publicaciones");
              setLoading(false);
            }
          },
          (error) => {
            console.error("Error en conexión de posts:", error);
            setError("Error de conexión");
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error("Error configurando listener:", error);
        setError("Error de configuración");
        setLoading(false);
        return () => {}; // Retornar función vacía como fallback
      }
    };

    // Variable para almacenar el unsubscribe
    let unsubscribe = () => {};

    // Ejecutar la configuración
    setupPostsListener().then((unsubFn) => {
      if (unsubFn) {
        unsubscribe = unsubFn;
      }
    });

    // Retornar función de cleanup
    return () => {
      unsubscribe();
    };
  }, [forumId, postsLimit]);

  return { posts, loading, error };
};
