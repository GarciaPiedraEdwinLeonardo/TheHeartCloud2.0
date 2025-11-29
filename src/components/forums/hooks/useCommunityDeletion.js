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

  const deletePostComments = async (postId) => {
    try {
      const commentsRef = collection(db, "comments");

      // Eliminar comentarios principales y en hilo en una sola operación
      const commentsQuery = query(commentsRef, where("postId", "==", postId));
      const commentsSnapshot = await getDocs(commentsQuery);

      const threadCommentsQuery = query(
        commentsRef,
        where("parentPostId", "==", postId)
      );
      const threadCommentsSnapshot = await getDocs(threadCommentsQuery);

      const batch = writeBatch(db);

      // Combinar todos los comentarios a eliminar
      const allComments = [
        ...commentsSnapshot.docs,
        ...threadCommentsSnapshot.docs,
      ];

      allComments.forEach((commentDoc) => {
        batch.delete(commentDoc.ref);
      });

      if (allComments.length > 0) {
        await batch.commit();
      }

      return allComments.length;
    } catch (error) {
      console.error(`Error eliminando comentarios del post ${postId}:`, error);
      // No lanzar error, continuar con el proceso
      return 0;
    }
  };

  const deleteForumPosts = async (forumId) => {
    try {
      const postsRef = collection(db, "posts");
      const postsQuery = query(postsRef, where("forumId", "==", forumId));
      const postsSnapshot = await getDocs(postsQuery);

      let deletedPostsCount = 0;
      let deletedCommentsCount = 0;

      // Usar Promise.all para eliminar posts en paralelo (más rápido)
      const deletionPromises = postsSnapshot.docs.map(async (postDoc) => {
        try {
          const commentsDeleted = await deletePostComments(postDoc.id);
          await deleteDoc(postDoc.ref);

          deletedPostsCount++;
          deletedCommentsCount += commentsDeleted;

          return { success: true };
        } catch (postError) {
          console.error(`Error eliminando post ${postDoc.id}:`, postError);
          return { success: false, error: postError };
        }
      });

      await Promise.all(deletionPromises);

      return { deletedPostsCount, deletedCommentsCount };
    } catch (error) {
      console.error(`Error eliminando posts del foro ${forumId}:`, error);
      // Continuar aunque falle la eliminación de posts
      return { deletedPostsCount: 0, deletedCommentsCount: 0 };
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

      // 1. Verificar rápidamente que el foro existe
      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) {
        // Si no existe, considerar que ya fue eliminado y retornar éxito
        return {
          success: true,
          message: "La comunidad ya había sido eliminada anteriormente",
          stats: { deletedPosts: 0, deletedComments: 0, updatedUsers: 0 },
        };
      }

      const forumData = forumDoc.data();
      console.log("📋 Eliminando comunidad:", forumData.name);

      // 2. Eliminar contenido (no esperar a que termine completamente)
      const deletionPromise = deleteForumPosts(forumId);

      // 3. Actualizar usuarios (no esperar)
      const updatePromise = updateUsersStatsAfterDeletion(forumId);

      // 4. Eliminar el foro inmediatamente
      await deleteDoc(forumRef);
      console.log("✅ Foro principal eliminado");

      // 5. Esperar que las operaciones secundarias terminen (pero no bloquear)
      const [deletionResult, updatedUsersCount] = await Promise.allSettled([
        deletionPromise,
        updatePromise,
      ]);

      const stats = {
        deletedPosts:
          deletionResult.status === "fulfilled"
            ? deletionResult.value.deletedPostsCount
            : 0,
        deletedComments:
          deletionResult.status === "fulfilled"
            ? deletionResult.value.deletedCommentsCount
            : 0,
        updatedUsers:
          updatedUsersCount.status === "fulfilled"
            ? updatedUsersCount.value
            : 0,
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
          stats: { deletedPosts: 0, deletedComments: 0, updatedUsers: 0 },
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
