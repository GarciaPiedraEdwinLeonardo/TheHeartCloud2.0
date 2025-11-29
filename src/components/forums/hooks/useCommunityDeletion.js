import { useState } from "react";
import {
  doc,
  deleteDoc,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  writeBatch,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../config/firebase";

export const useCommunityDeletion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para eliminar todos los comentarios de un post
  const deletePostComments = async (postId) => {
    try {
      const commentsRef = collection(db, "comments");

      // Eliminar comentarios principales
      const commentsQuery = query(commentsRef, where("postId", "==", postId));
      const commentsSnapshot = await getDocs(commentsQuery);

      // Eliminar comentarios en hilo
      const threadCommentsQuery = query(
        commentsRef,
        where("parentPostId", "==", postId)
      );
      const threadCommentsSnapshot = await getDocs(threadCommentsQuery);

      const batch = writeBatch(db);
      let deletedCommentsCount = 0;

      // Eliminar comentarios principales
      commentsSnapshot.docs.forEach((commentDoc) => {
        batch.delete(commentDoc.ref);
        deletedCommentsCount++;
      });

      // Eliminar comentarios en hilo
      threadCommentsSnapshot.docs.forEach((commentDoc) => {
        batch.delete(commentDoc.ref);
        deletedCommentsCount++;
      });

      if (deletedCommentsCount > 0) {
        await batch.commit();
      }

      return deletedCommentsCount;
    } catch (error) {
      console.error(`Error eliminando comentarios del post ${postId}:`, error);
      throw error;
    }
  };

  // Función para eliminar todos los posts de un foro
  const deleteForumPosts = async (forumId) => {
    try {
      const postsRef = collection(db, "posts");
      const postsQuery = query(postsRef, where("forumId", "==", forumId));
      const postsSnapshot = await getDocs(postsQuery);

      let deletedPostsCount = 0;
      let deletedCommentsCount = 0;

      // Eliminar posts y sus comentarios
      for (const postDoc of postsSnapshot.docs) {
        try {
          // Eliminar comentarios del post
          const commentsDeleted = await deletePostComments(postDoc.id);
          deletedCommentsCount += commentsDeleted;

          // Eliminar el post
          await deleteDoc(postDoc.ref);
          deletedPostsCount++;

          console.log(
            `✅ Post ${postDoc.id} eliminado con ${commentsDeleted} comentarios`
          );
        } catch (postError) {
          console.error(`❌ Error eliminando post ${postDoc.id}:`, postError);
          // Continuar con el siguiente post
        }
      }

      return { deletedPostsCount, deletedCommentsCount };
    } catch (error) {
      console.error(`Error eliminando posts del foro ${forumId}:`, error);
      throw error;
    }
  };

  // Función para actualizar estadísticas de usuarios
  const updateUsersStatsAfterDeletion = async (forumId) => {
    try {
      // Obtener todos los usuarios que estaban en el foro
      const usersRef = collection(db, "users");
      const usersQuery = query(
        usersRef,
        where("joinedForums", "array-contains", forumId)
      );
      const usersSnapshot = await getDocs(usersQuery);

      const batch = writeBatch(db);
      let updatedUsersCount = 0;

      usersSnapshot.docs.forEach((userDoc) => {
        const userData = userDoc.data();

        // Calcular nueva cuenta de foros unidos
        const currentJoinedForums = userData.joinedForums || [];
        const newJoinedForums = currentJoinedForums.filter(
          (id) => id !== forumId
        );
        const joinedForumsCount = newJoinedForums.length;

        // Actualizar usuario
        batch.update(userDoc.ref, {
          joinedForums: newJoinedForums,
          "stats.joinedForumsCount": joinedForumsCount,
          lastUpdated: serverTimestamp(),
        });

        updatedUsersCount++;
      });

      if (updatedUsersCount > 0) {
        await batch.commit();
      }

      return updatedUsersCount;
    } catch (error) {
      console.error("Error actualizando estadísticas de usuarios:", error);
      throw error;
    }
  };

  // Función principal para eliminar una comunidad completa - CORREGIDA
  const deleteCommunity = async (forumId, reason, deletedBy) => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Iniciando eliminación con forumId:", forumId);

      // Validar que forumId existe y es válido
      if (!forumId || typeof forumId !== "string" || forumId.trim() === "") {
        throw new Error("ID de comunidad inválido o vacío");
      }

      // 1. Verificar que el foro existe ANTES de eliminar nada
      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) {
        throw new Error("La comunidad no existe en la base de datos");
      }

      const forumData = forumDoc.data();
      console.log("✅ Foro encontrado:", forumData.name);

      // 2. Eliminar todos los posts y comentarios del foro
      console.log("🗑️ Eliminando posts y comentarios...");
      const { deletedPostsCount, deletedCommentsCount } =
        await deleteForumPosts(forumId);

      // 3. Actualizar estadísticas de usuarios
      console.log("📊 Actualizando estadísticas de usuarios...");
      const updatedUsersCount = await updateUsersStatsAfterDeletion(forumId);

      // 4. Eliminar el foro - ESTA ES LA ÚLTIMA OPERACIÓN
      console.log("✅ Eliminando foro principal...");
      await deleteDoc(forumRef);

      console.log("🎉 Eliminación completada exitosamente");

      return {
        success: true,
        message: "Comunidad eliminada exitosamente",
        stats: {
          deletedPosts: deletedPostsCount,
          deletedComments: deletedCommentsCount,
          updatedUsers: updatedUsersCount,
        },
      };
    } catch (error) {
      console.error("❌ Error eliminando comunidad:", error);
      setError(error.message);
      return {
        success: false,
        error: error.message,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteCommunity,
    loading,
    error,
  };
};
