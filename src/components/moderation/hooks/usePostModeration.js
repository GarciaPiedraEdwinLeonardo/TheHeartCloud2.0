import { useState } from "react";
import {
  doc,
  deleteDoc,
  getDoc,
  updateDoc,
  collection,
  writeBatch,
  serverTimestamp,
  increment,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { toast } from "react-hot-toast";

export const usePostModeration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función mejorada para eliminar posts que maneja usuarios eliminados
  const deletePost = async (
    postId,
    reason,
    forumId,
    moderatorAction = false
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Obtener referencia al post
      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error("La publicación no existe");
      }

      const postData = postDoc.data();
      const batch = writeBatch(db);

      // 1. Guardar copia en deleted_posts
      const deletedPostRef = doc(collection(db, "deleted_posts"));
      batch.set(deletedPostRef, {
        ...postData,
        originalId: postId,
        deletedAt: serverTimestamp(),
        deletionReason: reason,
        deletedBy: moderatorAction ? "moderator" : "user",
        moderatorAction,
        forumId: forumId || postData.forumId || "global",
        authorId: postData.authorId,
        authorName: postData.authorName || "Usuario",
      });

      // 2. Eliminar el post real
      batch.delete(postRef);

      // 3. Actualizar estadísticas del foro (si existe y si el foro existe)
      if (forumId || postData.forumId) {
        const actualForumId = forumId || postData.forumId;
        const forumRef = doc(db, "forums", actualForumId);
        const forumDoc = await getDoc(forumRef);

        if (forumDoc.exists()) {
          batch.update(forumRef, {
            "stats.postCount": increment(-1),
            updatedAt: serverTimestamp(),
          });
        }
      }

      // 4. Actualizar estadísticas del usuario SOLO SI EXISTE
      if (postData.authorId) {
        try {
          const userRef = doc(db, "users", postData.authorId);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            batch.update(userRef, {
              "stats.postCount": increment(-1),
              updatedAt: serverTimestamp(),
            });
          }
          // Si el usuario no existe, NO hacer nada (no lanzar error)
        } catch (userError) {
          console.warn(
            "Usuario no encontrado, omitiendo actualización de estadísticas:",
            userError
          );
          // No lanzar error, continuar con la eliminación
        }
      }

      // 5. Eliminar todos los comentarios asociados al post
      const commentsQuery = query(
        collection(db, "comments"),
        where("postId", "==", postId)
      );

      const commentsSnapshot = await getDocs(commentsQuery);
      const commentDeletionPromises = [];

      commentsSnapshot.forEach((commentDoc) => {
        // Guardar copia de cada comentario eliminado
        const deletedCommentRef = doc(collection(db, "deleted_comments"));
        batch.set(deletedCommentRef, {
          ...commentDoc.data(),
          originalId: commentDoc.id,
          deletedAt: serverTimestamp(),
          deletionReason: `Post eliminado: ${reason}`,
          deletedBy: moderatorAction ? "moderator" : "system",
          moderatorAction,
          forumId: forumId || postData.forumId || "global",
          postId,
          isCascadeDelete: true,
        });

        // Eliminar el comentario
        batch.delete(doc(db, "comments", commentDoc.id));

        // Actualizar estadísticas del autor del comentario SOLO SI EXISTE
        if (commentDoc.data().authorId) {
          commentDeletionPromises.push(
            (async () => {
              try {
                const commentAuthorRef = doc(
                  db,
                  "users",
                  commentDoc.data().authorId
                );
                const commentAuthorDoc = await getDoc(commentAuthorRef);

                if (commentAuthorDoc.exists()) {
                  batch.update(commentAuthorRef, {
                    "stats.commentCount": increment(-1),
                    updatedAt: serverTimestamp(),
                  });
                }
              } catch (err) {
                console.warn("Autor de comentario no encontrado:", err);
              }
            })()
          );
        }
      });

      // Esperar todas las actualizaciones de usuarios
      await Promise.all(commentDeletionPromises);

      // 6. Ejecutar batch
      await batch.commit();

      // 7. Registrar en moderation_logs si es acción de moderador
      if (moderatorAction) {
        const logRef = doc(collection(db, "moderation_logs"));
        await setDoc(logRef, {
          action: "post_deletion",
          targetId: postId,
          targetType: "post",
          reason,
          moderatorId: "system",
          createdAt: serverTimestamp(),
          forumId: forumId || postData.forumId || "global",
          commentsDeleted: commentsSnapshot.size,
        });
      }

      return {
        success: true,
        commentsDeleted: commentsSnapshot.size,
      };
    } catch (error) {
      console.error("Error eliminando publicación:", error);
      setError(error.message);
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    deletePost,
    loading,
    error,
  };
};
