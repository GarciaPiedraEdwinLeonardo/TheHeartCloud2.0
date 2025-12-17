import { useState } from "react";
import {
  doc,
  updateDoc,
  collection,
  serverTimestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../../config/firebase";
import { usePostActions } from "../../forums/posts/hooks/usePostActions";
import { useCommentActions } from "../../forums/posts/comments/hooks/useCommentActions";
import { useCommunityBans } from "../../forums/hooks/useCommunityBans";

export const useModerationActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { deletePost } = usePostActions();
  const { deleteComment } = useCommentActions();
  const { banUser } = useCommunityBans();

  // Obtener el usuario actual de forma segura
  const getCurrentUserId = () => {
    return auth.currentUser?.uid || "system";
  };

  // Resolver reporte
  const resolveReport = async (reportId, resolution) => {
    setLoading(true);
    setError(null);

    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, {
        status: "resolved",
        resolution,
        resolvedAt: serverTimestamp(),
        resolvedBy: getCurrentUserId(),
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Desestimar reporte
  const dismissReport = async (reportId, reason) => {
    setLoading(true);
    setError(null);

    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, {
        status: "dismissed",
        resolution: reason,
        resolvedAt: serverTimestamp(),
        resolvedBy: getCurrentUserId(),
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar contenido
  const deleteContent = async (contentType, contentId) => {
    setLoading(true);
    setError(null);

    try {
      let result;

      if (contentType === "post") {
        // Primero verificar si el post existe
        const postDoc = await getDoc(doc(db, "posts", contentId));
        if (!postDoc.exists()) {
          return { success: false, error: "La publicación ya no existe" };
        }

        // Usar deletePost simplificado (solo requiere el ID)
        result = await deletePost(contentId);
      } else if (contentType === "comment") {
        // Primero verificar si el comentario existe
        const commentDoc = await getDoc(doc(db, "comments", contentId));
        if (!commentDoc.exists()) {
          return { success: false, error: "El comentario ya no existe" };
        }

        // Verificar si el autor del comentario existe
        const authorId = commentDoc.data().authorId;
        let authorExists = false;

        if (authorId) {
          try {
            const authorDoc = await getDoc(doc(db, "users", authorId));
            authorExists = authorDoc.exists();

            if (!authorExists) {
              // Si el usuario no existe, marcar el comentario como de autor eliminado
              const commentRef = doc(db, "comments", contentId);
              await updateDoc(commentRef, {
                authorStatus: "deleted",
                authorName: "Usuario Eliminado",
              });
            }
          } catch (err) {
            console.warn("Error verificando autor:", err);
          }
        }

        // Usar deleteComment (isModeratorAction = true)
        result = await deleteComment(contentId, true);
      } else {
        return { success: false, error: "Tipo de contenido no soportado" };
      }

      return result;
    } catch (error) {
      console.error("Error en deleteContent:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar comunidad
  const deleteCommunity = async (communityId, reason) => {
    setLoading(true);
    setError(null);

    try {
      const communityRef = doc(db, "forums", communityId);

      await updateDoc(communityRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletionReason: reason,
        deletedBy: getCurrentUserId(),
        status: "deleted",
      });

      // Registrar en logs de moderación
      const moderationLogRef = doc(collection(db, "moderation_logs"));
      await setDoc(moderationLogRef, {
        action: "community_deletion",
        targetForumId: communityId,
        reason,
        moderatorId: getCurrentUserId(),
        createdAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Banear de comunidad
  const banFromCommunity = async (forumId, userId, reason) => {
    setLoading(true);
    setError(null);

    try {
      const result = await banUser(forumId, userId, reason, "30 days");
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    resolveReport,
    dismissReport,
    deleteContent,
    deleteCommunity,
    banFromCommunity,
    loading,
    error,
  };
};
