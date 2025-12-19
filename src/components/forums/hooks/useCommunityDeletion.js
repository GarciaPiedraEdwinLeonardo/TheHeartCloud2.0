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
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { usePostActions } from "../posts/hooks/usePostActions";

export const useCommunityDeletion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { deletePost } = usePostActions();

  const deleteForumPosts = async (forumId) => {
    try {
      const postsRef = collection(db, "posts");
      const postsQuery = query(postsRef, where("forumId", "==", forumId));
      const postsSnapshot = await getDocs(postsQuery);

      let deletedPostsCount = 0;
      let deletedCommentsCount = 0;
      let deletedImagesCount = 0;

      console.log(`📝 Encontrados ${postsSnapshot.size} posts para eliminar`);

      // Usar deletePost de usePostActions para cada post
      // Esto asegura consistencia en estadísticas
      const deletionPromises = postsSnapshot.docs.map(async (postDoc) => {
        try {
          const result = await deletePost(postDoc.id);

          if (result.success) {
            deletedPostsCount++;
            deletedCommentsCount += result.deletedComments || 0;
            deletedImagesCount += result.deletedImages || 0;
            console.log(`✅ Post ${postDoc.id} eliminado correctamente`);
          } else {
            console.error(`❌ Error en post ${postDoc.id}:`, result.error);
          }

          return result;
        } catch (postError) {
          console.error(
            `❌ Excepción eliminando post ${postDoc.id}:`,
            postError
          );
          return { success: false, error: postError.message };
        }
      });

      await Promise.allSettled(deletionPromises);

      return { deletedPostsCount, deletedCommentsCount, deletedImagesCount };
    } catch (error) {
      console.error(`Error eliminando posts del foro ${forumId}:`, error);
      // Continuar aunque falle la eliminación de posts
      return {
        deletedPostsCount: 0,
        deletedCommentsCount: 0,
        deletedImagesCount: 0,
      };
    }
  };

  const updateUsersStatsAfterDeletion = async (forumId) => {
    try {
      const usersRef = collection(db, "users");
      const usersQuery = query(
        usersRef,
        where("joinedForums", "array-contains", forumId)
      );
      const usersSnapshot = await getDocs(usersQuery);

      const batch = writeBatch(db);

      usersSnapshot.docs.forEach((userDoc) => {
        const userData = userDoc.data();
        const currentJoinedForums = userData.joinedForums || [];
        const newJoinedForums = currentJoinedForums.filter(
          (id) => id !== forumId
        );

        batch.update(userDoc.ref, {
          joinedForums: newJoinedForums,
          "stats.joinedForumsCount": newJoinedForums.length,
          lastUpdated: serverTimestamp(),
        });
      });

      if (usersSnapshot.docs.length > 0) {
        await batch.commit();
      }

      return usersSnapshot.docs.length;
    } catch (error) {
      console.error("Error actualizando estadísticas de usuarios:", error);
      // No es crítico, continuar
      return 0;
    }
  };

  const deleteCommunity = async (forumId, reason, deletedBy) => {
    setLoading(true);
    setError(null);

    try {
      console.log("🚨 INICIANDO ELIMINACIÓN DEL FORO:", forumId);

      if (!forumId) {
        throw new Error("ID de comunidad no proporcionado");
      }

      // 1. Verificar que el foro existe
      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) {
        // Si no existe, considerar que ya fue eliminado y retornar éxito
        return {
          success: true,
          message: "La comunidad ya había sido eliminada anteriormente",
          stats: {
            deletedPosts: 0,
            deletedComments: 0,
            deletedImages: 0,
            updatedUsers: 0,
          },
        };
      }

      const forumData = forumDoc.data();
      console.log("📋 Eliminando comunidad:", forumData.name);

      // 2. Eliminar posts usando deletePost (maneja estadísticas correctamente)
      console.log("🗑️ Eliminando posts y comentarios...");
      const deletionResult = await deleteForumPosts(forumId);

      // 3. Actualizar usuarios que tenían el foro en joinedForums
      console.log("👥 Actualizando usuarios...");
      const updatedUsersCount = await updateUsersStatsAfterDeletion(forumId);

      // 4. Eliminar el foro
      await deleteDoc(forumRef);
      console.log("✅ Foro principal eliminado");

      const stats = {
        deletedPosts: deletionResult.deletedPostsCount,
        deletedComments: deletionResult.deletedCommentsCount,
        deletedImages: deletionResult.deletedImagesCount,
        updatedUsers: updatedUsersCount,
      };

      console.log("🎉 Eliminación completada:", stats);

      return {
        success: true,
        message: "Comunidad eliminada exitosamente",
        stats,
      };
    } catch (error) {
      console.error("❌ Error en el proceso de eliminación:", error);

      // Si el error es que el documento no existe, considerar éxito
      if (error.code === "not-found" || error.message.includes("no existe")) {
        return {
          success: true,
          message: "La comunidad ya había sido eliminada",
          stats: {
            deletedPosts: 0,
            deletedComments: 0,
            deletedImages: 0,
            updatedUsers: 0,
          },
        };
      }

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
