import { useState } from "react";
import {
  doc,
  updateDoc,
  writeBatch,
  arrayRemove,
  deleteField,
  getDoc,
  increment as firestoreIncrement,
} from "firebase/firestore";
import { db, auth } from "../../../config/firebase";
import { notificationService } from "./../../notifications/services/notificationService";
import { usePostModeration } from "./usePostModeration";

export const useForumSettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { validatePostsBatch } = usePostModeration();

  const updateForumSettings = async (forumId, settings) => {
    setLoading(true);
    setError(null);

    try {
      const forumRef = doc(db, "forums", forumId);

      // Obtener datos actuales del foro
      const forumDoc = await getDoc(forumRef);
      if (!forumDoc.exists()) {
        throw new Error("Comunidad no encontrada");
      }

      const currentForumData = forumDoc.data();
      const wasRequiringApproval =
        currentForumData.requiresPostApproval || false;
      const willRequireApproval = settings.requiresPostApproval || false;

      // Actualizar configuración del foro
      await updateDoc(forumRef, {
        ...settings,
        updatedAt: new Date(),
      });

      // IMPORTANTE: Si se desactiva requiresPostApproval, activar posts pendientes
      if (wasRequiringApproval && !willRequireApproval) {
        // Usar la función de batch del hook de moderación
        const activationResult = await validatePostsBatch(
          forumId,
          currentForumData.name
        );

        if (activationResult.success && activationResult.validatedCount > 0) {
          return {
            success: true,
            postsActivated: activationResult.validatedCount,
            message: `Configuración actualizada. ${activationResult.validatedCount} publicación(es) pendiente(s) fueron activadas automáticamente.`,
          };
        }
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const leaveForumAsOwner = async (forumId) => {
    setLoading(true);
    try {
      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) {
        throw new Error("Comunidad no encontrada");
      }

      const forumData = forumDoc.data();
      const moderators = forumData.moderators || {};

      const otherModerators = Object.entries(moderators).filter(
        ([modId, modData]) => modId !== auth.currentUser.uid
      );

      if (otherModerators.length === 0) {
        throw new Error(
          "No puedes abandonar la comunidad sin asignar un nuevo dueño. Agrega moderadores primero."
        );
      }

      // Encontrar el moderador más antiguo
      let oldestModerator = null;
      let oldestDate = new Date();

      for (const [modId, modData] of otherModerators) {
        const modDate =
          modData.addedAt?.toDate?.() || new Date(modData.addedAt);
        if (modDate < oldestDate) {
          oldestDate = modDate;
          oldestModerator = modId;
        }
      }

      if (!oldestModerator) {
        throw new Error(
          "No se pudo encontrar un moderador para transferir la propiedad"
        );
      }

      const batch = writeBatch(db);

      // 1. TRANSFERIR OWNERSHIP
      batch.update(forumRef, {
        ownerId: oldestModerator,
        [`moderators.${auth.currentUser.uid}`]: deleteField(),
        members: arrayRemove(auth.currentUser.uid),
        memberCount: firestoreIncrement(-1),
      });

      await batch.commit();

      // 2. Notificar al nuevo dueño
      await notificationService.sendOwnershipTransferred(
        oldestModerator,
        forumData.name
      );

      // 3. Actualizar stats del usuario que abandona
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        "stats.joinedForumsCount": firestoreIncrement(-1),
        joinedForums: arrayRemove(forumId),
      });

      return {
        success: true,
        newOwnerId: oldestModerator,
        previousOwnerId: auth.currentUser.uid,
      };
    } catch (err) {
      console.error("❌ Error en leaveForumAsOwner:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    updateForumSettings,
    leaveForumAsOwner,
    loading,
    error,
  };
};
