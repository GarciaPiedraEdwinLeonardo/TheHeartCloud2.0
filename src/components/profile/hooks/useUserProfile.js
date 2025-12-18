import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "./../../../config/firebase";

export const useUserProfile = (userId = null) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const targetUserId =
    userId || (auth.currentUser ? auth.currentUser.uid : null);

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    loadUserProfile();
  }, [targetUserId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Cargar datos básicos del usuario
      const userDoc = await getDoc(doc(db, "users", targetUserId));

      if (!userDoc.exists()) {
        throw new Error("Usuario no encontrado");
      }

      const userDataFromFirebase = userDoc.data();

      // 2. Cargar publicaciones del usuario
      const postsQuery = query(
        collection(db, "posts"),
        where("authorId", "==", targetUserId),
        orderBy("createdAt", "desc")
      );

      const postsSnapshot = await getDocs(postsQuery);
      const postsData = await Promise.all(
        postsSnapshot.docs.map(async (postDoc) => {
          const postData = postDoc.data();

          // Obtener nombre del foro
          let forumName = "General";
          if (postData.forumId) {
            try {
              const forumDoc = await getDoc(
                doc(db, "forums", postData.forumId)
              );
              if (forumDoc.exists()) {
                forumName = forumDoc.data().name || "Foro";
              }
            } catch (error) {
              console.error("Error cargando foro:", error);
            }
          }

          return {
            id: postDoc.id,
            ...postData,
            tema: forumName,
            fecha: postData.createdAt,
            likes: postData.likes || [],
            titulo: postData.title,
            contenido: postData.content,
            stats: postData.stats || { commentCount: 0, likeCount: 0 },
          };
        })
      );

      // 3. Cargar comentarios del usuario
      const commentsQuery = query(
        collection(db, "comments"),
        where("authorId", "==", targetUserId),
        orderBy("createdAt", "desc")
      );

      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsData = await Promise.all(
        commentsSnapshot.docs.map(async (commentDoc) => {
          const commentData = commentDoc.data();

          // Obtener información del post
          let postTitle = "Publicación no disponible";
          let postAuthor = "Usuario";

          if (commentData.postId) {
            try {
              const postDoc = await getDoc(
                doc(db, "posts", commentData.postId)
              );
              if (postDoc.exists()) {
                const postData = postDoc.data();
                postTitle = postData.title || "Sin título";

                // Obtener autor del post
                if (postData.authorId) {
                  const authorDoc = await getDoc(
                    doc(db, "users", postData.authorId)
                  );
                  if (authorDoc.exists()) {
                    const authorData = authorDoc.data();
                    postAuthor = authorData.name
                      ? `${authorData.name.name || ""} ${
                          authorData.name.apellidopat || ""
                        }`.trim()
                      : "Usuario";
                  }
                }
              }
            } catch (error) {
              console.error("Error cargando datos del post:", error);
            }
          }

          return {
            id: commentDoc.id,
            ...commentData,
            publicacionTitulo: postTitle,
            usuarioPost: postAuthor,
            fecha: commentData.createdAt,
            usuarioComentarista: userDataFromFirebase.name
              ? `${userDataFromFirebase.name.name || ""} ${
                  userDataFromFirebase.name.apellidopat || ""
                }`.trim()
              : "Usuario",
            rolComentarista:
              userDataFromFirebase.professionalInfo?.specialty || "Médico",
            contenido: commentData.content,
          };
        })
      );

      // 4. Cargar foros del usuario
      const userForumsData = [];
      const joinedForums = userDataFromFirebase.joinedForums || [];

      for (const forumId of joinedForums) {
        try {
          const forumDoc = await getDoc(doc(db, "forums", forumId));
          if (forumDoc.exists()) {
            const forumData = forumDoc.data();

            // Contar publicaciones y comentarios del usuario en este foro
            const userPostsInForum = postsData.filter(
              (post) => post.forumId === forumId
            ).length;

            const userCommentsInForum = commentsData.filter((comment) => {
              const commentPost = postsData.find(
                (post) => post.id === comment.postId
              );
              return commentPost && commentPost.forumId === forumId;
            }).length;

            userForumsData.push({
              id: forumId,
              nombre: forumData.name,
              description: forumData.description,
              fechaUnion: userDataFromFirebase.joinDate,
              publicaciones: userPostsInForum,
              comentarios: userCommentsInForum,
              memberCount: forumData.memberCount || 0,
              lastActivity: forumData.lastPostAt || forumData.createdAt,
            });
          }
        } catch (error) {
          console.error(`Error cargando foro ${forumId}:`, error);
        }
      }

      // 5. Calcular días en plataforma
      const joinDate = userDataFromFirebase.joinDate?.toDate?.() || new Date();
      const daysOnPlatform = Math.max(
        1,
        Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24))
      );

      // 6. Usar estadísticas directamente de Firebase
      const estadisticas = {
        // Estadísticas principales desde users.stats
        aura: userDataFromFirebase.stats?.aura || 0,
        interacciones: userDataFromFirebase.stats?.contributionCount || 0,
        publicaciones: userDataFromFirebase.stats?.postCount || 0,
        comentarios: userDataFromFirebase.stats?.commentCount || 0,

        // Calculado localmente
        diasPlataforma: daysOnPlatform,
        temasParticipacion: userForumsData.length,
      };

      // 7. Formatear datos para el frontend
      const formattedUserData = {
        id: targetUserId,
        nombreCompleto: userDataFromFirebase.name
          ? `${userDataFromFirebase.name.name || ""} ${
              userDataFromFirebase.name.apellidopat || ""
            } ${userDataFromFirebase.name.apellidomat || ""}`.trim()
          : "Usuario",
        especialidad:
          userDataFromFirebase.professionalInfo?.specialty || "Médico",
        fotoPerfil: userDataFromFirebase.photoURL || null,
        fechaRegistro: userDataFromFirebase.joinDate,
        role: userDataFromFirebase.role,
        verificationStatus:
          userDataFromFirebase.professionalInfo?.verificationStatus,
        professionalInfo: userDataFromFirebase.professionalInfo,
        suspension: userDataFromFirebase.suspension || {
          isSuspended: false,
          reason: null,
          startDate: null,
          endDate: null,
          suspendedBy: null,
        },
        email: userDataFromFirebase.email,
        isActive: userDataFromFirebase.isActive,
        lastLogin: userDataFromFirebase.lastLogin,
        estadisticas,
        publicaciones: postsData,
        comentarios: commentsData,
        temasParticipacion: userForumsData,
        _rawData: userDataFromFirebase,
      };

      setUserData(formattedUserData);
    } catch (err) {
      console.error("❌ Error cargando perfil:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = () => {
    loadUserProfile();
  };

  const isUserSuspended = () => {
    return userData?.suspension?.isSuspended === true;
  };

  const getSuspensionTimeLeft = () => {
    if (!isUserSuspended()) return null;

    const suspension = userData.suspension;

    if (!suspension.endDate) {
      return "Permanente";
    }

    const endDate = suspension.endDate.toDate();
    const now = new Date();
    const diff = endDate - now;

    if (diff <= 0) {
      return "Expirada";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} día${days > 1 ? "s" : ""}, ${hours} hora${
        hours > 1 ? "s" : ""
      }`;
    } else if (hours > 0) {
      return `${hours} hora${hours > 1 ? "s" : ""}, ${minutes} minuto${
        minutes > 1 ? "s" : ""
      }`;
    } else {
      return `${minutes} minuto${minutes > 1 ? "s" : ""}`;
    }
  };

  return {
    userData,
    loading,
    error,
    refreshProfile,
    isUserSuspended,
    getSuspensionTimeLeft,
  };
};
