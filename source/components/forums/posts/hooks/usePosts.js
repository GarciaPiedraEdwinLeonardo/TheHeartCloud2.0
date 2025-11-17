// hooks/usePosts.js
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "./../../../../config/firebase";

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

    const q = query(
      collection(db, "posts"),
      where("forumId", "==", forumId),
      where("isDeleted", "==", false),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      limit(postsLimit)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const postsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            // Asegurar valores por defecto
            likes: doc.data().likes || [],
            dislikes: doc.data().dislikes || [],
            images: doc.data().images || [],
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
  }, [forumId, postsLimit]);

  return { posts, loading, error };
};
