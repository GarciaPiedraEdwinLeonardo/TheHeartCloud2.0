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
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [userForums, setUserForums] = useState([]);
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

      const postsData = [];
      for (const postDoc of postsSnapshot.docs) {
        const postData = postDoc.data();

        // Obtener nombre del foro
        let forumName = "General";
        if (postData.forumId) {
          try {
            const forumDoc = await getDoc(doc(db, "forums", postData.forumId));
            if (forumDoc.exists()) {
              forumName = forumDoc.data().name || "Foro";
            }
          } catch (error) {
            console.error("Error cargando foro:", error);
          }
        }

        postsData.push({
          id: postDoc.id,
          ...postData,
          tema: forumName,
          fecha: postData.createdAt,
          likes: postData.likes || [],
          // Asegurar compatibilidad con el frontend
          titulo: postData.title,
          contenido: postData.content,
          // Para estadísticas
          stats: postData.stats || { commentCount: 0, likeCount: 0 },
        });
      }

      // 3. Cargar comentarios del usuario
      const commentsQuery = query(
        collection(db, "comments"),
        where("authorId", "==", targetUserId),
        orderBy("createdAt", "desc")
      );

      const commentsSnapshot = await getDocs(commentsQuery);

      const commentsData = [];
      for (const commentDoc of commentsSnapshot.docs) {
        const commentData = commentDoc.data();

        // Obtener información del post
        let postTitle = "Publicación no disponible";
        let postAuthor = "Usuario";
        let forumName = "General";

        if (commentData.postId) {
          try {
            const postDoc = await getDoc(doc(db, "posts", commentData.postId));
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

              // Obtener foro del post
              if (postData.forumId) {
                const forumDoc = await getDoc(
                  doc(db, "forums", postData.forumId)
                );
                if (forumDoc.exists()) {
                  forumName = forumDoc.data().name || "Foro";
                }
              }
            }
          } catch (error) {
            console.error("Error cargando datos del post:", error);
          }
        }

        commentsData.push({
          id: commentDoc.id,
          ...commentData,
          publicacionTitulo: postTitle,
          usuarioPost: postAuthor,
          tema: forumName,
          fecha: commentData.createdAt,
          usuarioComentarista: userDataFromFirebase.name
            ? `${userDataFromFirebase.name.name || ""} ${
                userDataFromFirebase.name.apellidopat || ""
              }`.trim()
            : "Usuario",
          rolComentarista:
            userDataFromFirebase.professionalInfo?.specialty || "Médico",
          // Asegurar compatibilidad
          contenido: commentData.content,
        });
      }

      // 4. Cargar foros del usuario
      const userForumsData = [];
      const joinedForums = userDataFromFirebase.joinedForums || [];

      // Cargar información de cada foro
      for (const forumId of joinedForums) {
        try {
          const forumDoc = await getDoc(doc(db, "forums", forumId));
          if (forumDoc.exists()) {
            const forumData = forumDoc.data();

            // Contar publicaciones del usuario en este foro
            const userPostsInForum = postsData.filter(
              (post) => post.forumId === forumId
            );

            // Contar comentarios del usuario en posts de este foro
            const userCommentsInForum = commentsData.filter((comment) => {
              // Buscar el post del comentario para obtener el forumId
              const commentPost = postsData.find(
                (post) => post.id === comment.postId
              );
              return commentPost && commentPost.forumId === forumId;
            });

            userForumsData.push({
              id: forumId,
              nombre: forumData.name,
              description: forumData.description,
              fechaUnion: userDataFromFirebase.joinDate, // Usar fecha de unión del usuario
              publicaciones: userPostsInForum.length,
              comentarios: userCommentsInForum.length,
              memberCount: forumData.memberCount || 0,
              lastActivity: forumData.lastPostAt || forumData.createdAt,
            });
          }
        } catch (error) {
          console.error(`Error cargando foro ${forumId}:`, error);
        }
      }

      // 5. Calcular estadísticas CORRECTAMENTE
      const estadisticas = calculateStatistics(
        userDataFromFirebase,
        postsData,
        commentsData,
        userForumsData
      );

      // 6. Formatear datos para el frontend con manejo de suspensión
      const formattedUserData = {
        // Datos básicos
        id: targetUserId,

        // Datos personales
        nombreCompleto: userDataFromFirebase.name
          ? `${userDataFromFirebase.name.name || ""} ${
              userDataFromFirebase.name.apellidopat || ""
            } ${userDataFromFirebase.name.apellidomat || ""}`.trim()
          : "Usuario",
        especialidad:
          userDataFromFirebase.professionalInfo?.specialty || "Médico",
        fotoPerfil: userDataFromFirebase.photoURL || null,
        fechaRegistro: userDataFromFirebase.joinDate,

        // Información de verificación y rol
        role: userDataFromFirebase.role,
        verificationStatus:
          userDataFromFirebase.professionalInfo?.verificationStatus,
        professionalInfo: userDataFromFirebase.professionalInfo,

        // Información de suspensión (CRÍTICO para el sistema de moderación)
        suspension: userDataFromFirebase.suspension || {
          isSuspended: false,
          reason: null,
          startDate: null,
          endDate: null,
          suspendedBy: null,
        },

        // Datos de actividad
        email: userDataFromFirebase.email,
        isActive: userDataFromFirebase.isActive,
        lastLogin: userDataFromFirebase.lastLogin,

        // Datos cargados
        estadisticas,
        publicaciones: postsData,
        comentarios: commentsData,
        temasParticipacion: userForumsData,

        // Datos originales de Firebase para compatibilidad
        _rawData: userDataFromFirebase,
      };

      setUserData(formattedUserData);
      setUserPosts(postsData);
      setUserComments(commentsData);
      setUserForums(userForumsData);
    } catch (err) {
      console.error("❌ Error cargando perfil:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (userData, posts, comments, forums) => {
    const joinDate = userData.joinDate?.toDate?.() || new Date();
    const daysOnPlatform = Math.max(
      1,
      Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24))
    );

    // Usar las estadísticas reales de Firebase
    return {
      aura: userData.stats?.aura || 0,
      interacciones:
        (userData.stats?.postCount || 0) + (userData.stats?.commentCount || 0),
      diasPlataforma: daysOnPlatform,
      temasParticipacion: forums.length,
      // Agregar contadores específicos para el frontend
      publicaciones: userData.stats?.postCount || posts.length,
      comentarios: userData.stats?.commentCount || comments.length,
      // Estadísticas adicionales para moderación
      contributionCount: userData.stats?.contributionCount || 0,
      forumCount: userData.stats?.forumCount || 0,
      joinedForumsCount: userData.stats?.joinedForumsCount || 0,
      totalImagesUploaded: userData.stats?.totalImagesUploaded || 0,
      totalStorageUsed: userData.stats?.totalStorageUsed || 0,
    };
  };

  const refreshProfile = () => {
    loadUserProfile();
  };

  // Función auxiliar para verificar si el usuario está suspendido
  const isUserSuspended = () => {
    return userData?.suspension?.isSuspended === true;
  };

  // Función auxiliar para obtener tiempo restante de suspensión
  const getSuspensionTimeLeft = () => {
    if (!isUserSuspended()) return null;

    const suspension = userData.suspension;

    // Si es suspensión permanente
    if (!suspension.endDate) {
      return "Permanente";
    }

    // Calcular tiempo restante para suspensiones temporales
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
    userPosts,
    userComments,
    userForums,
    loading,
    error,
    refreshProfile,
    isUserSuspended,
    getSuspensionTimeLeft,
  };
};
