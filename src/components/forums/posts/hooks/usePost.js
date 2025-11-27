import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./../../../../config/firebase";

export const usePost = (postId) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) {
      setPost(null);
      setLoading(false);
      return;
    }

    const postRef = doc(db, "posts", postId);

    const unsubscribe = onSnapshot(
      postRef,
      (doc) => {
        if (doc.exists()) {
          const postData = {
            id: doc.id,
            ...doc.data(),
            likes: doc.data().likes || [],
            dislikes: doc.data().dislikes || [],
            images: doc.data().images || [],
            stats: {
              commentCount: doc.data().stats?.commentCount || 0,
              viewCount: doc.data().stats?.viewCount || 0,
            },
          };
          setPost(postData);
        } else {
          setPost(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error cargando post:", error);
        setError("Error cargando publicación");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postId]);

  return { post, loading, error };
};
