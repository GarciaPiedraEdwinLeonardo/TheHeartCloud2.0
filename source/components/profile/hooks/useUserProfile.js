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

      console.log("🔍 Cargando perfil para usuario:", targetUserId);

      // 1. Cargar datos básicos del usuario
      const userDoc = await getDoc(doc(db, "users", targetUserId));

      if (!userDoc.exists()) {
        throw new Error("Usuario no encontrado");
      }

      const userDataFromFirebase = userDoc.data();
      console.log("📊 Datos del usuario:", userDataFromFirebase);

      // 2. Cargar publicaciones del usuario
      const postsQuery = query(
        collection(db, "posts"),
        where("authorId", "==", targetUserId),
        orderBy("createdAt", "desc")
      );

      const postsSnapshot = await getDocs(postsQuery);
      console.log("📝 Publicaciones encontradas:", postsSnapshot.docs.length);

      const postsData = [];
      for (const postDoc of postsSnapshot.docs) {
        const postData = postDoc.data();
        console.log("📄 Publicación:", postData);

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
      console.log("💬 Comentarios encontrados:", commentsSnapshot.docs.length);

      const commentsData = [];
      for (const commentDoc of commentsSnapshot.docs) {
        const commentData = commentDoc.data();
        console.log("💭 Comentario:", commentData);

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
      console.log("🏠 Foros unidos:", joinedForums);

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
      console.log("📈 Estadísticas calculadas:", estadisticas);

      // 6. Formatear datos para el frontend
      const formattedUserData = {
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

        // Datos cargados
        estadisticas,
        publicaciones: postsData,
        comentarios: commentsData,
        temasParticipacion: userForumsData,
      };

      console.log("✅ Datos formateados:", formattedUserData);

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
    };
  };

  const refreshProfile = () => {
    loadUserProfile();
  };

  return {
    userData,
    userPosts,
    userComments,
    userForums,
    loading,
    error,
    refreshProfile,
  };
};
