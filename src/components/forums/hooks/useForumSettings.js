import { useState } from "react";
import {
  doc,
  updateDoc,
  writeBatch,
  arrayRemove,
  arrayUnion,
  deleteField,
  getDoc,
  increment as firestoreIncrement,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../../config/firebase";
import { notificationService } from "./../../notifications/services/notificationService";
import { usePostModeration } from "./usePostModeration";

export const useForumSettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { validatePostsBatch } = usePostModeration();

  const approvePendingMembers = async (forumId, forumName, pendingMembers) => {
    try {
      if (!pendingMembers || Object.keys(pendingMembers).length === 0) {
        return { success: true, approvedCount: 0 };
      }

      const batch = writeBatch(db);
      const forumRef = doc(db, "forums", forumId);
      const userIds = Object.keys(pendingMembers);

      // 1. Agregar todos los usuarios pendientes como miembros
      for (const userId of userIds) {
        // Agregar al array de miembros del foro
        batch.update(forumRef, {
          members: arrayUnion(userId),
        });

        // Actualizar estadísticas del usuario
        const userRef = doc(db, "users", userId);
        batch.update(userRef, {
          "stats.joinedForumsCount": firestoreIncrement(1),
          joinedForums: arrayUnion(forumId),
        });

        // Remover de pendientes
        batch.update(forumRef, {
          [`pendingMembers.${userId}`]: deleteField(),
        });
      }

      // 2. Incrementar el contador de miembros del foro
      batch.update(forumRef, {
        memberCount: firestoreIncrement(userIds.length),
      });

      // 3. Ejecutar batch
      await batch.commit();

      // 4. Enviar notificaciones (asíncrono, no bloquea)
      const notificationPromises = userIds.map((userId) =>
        notificationService
          .sendMembershipApproved(userId, forumId, forumName)
          .catch((err) => console.error("Error enviando notificación:", err))
      );

      await Promise.allSettled(notificationPromises);

      return {
        success: true,
        approvedCount: userIds.length,
      };
    } catch (err) {
      console.error("Error aprobando miembros pendientes:", err);
      return { success: false, error: err.message };
    }
  };

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

      // Estados previos y nuevos
      const wasRequiringPostApproval =
        currentForumData.requiresPostApproval || false;
      const willRequirePostApproval = settings.requiresPostApproval || false;

      const wasRequiringMemberApproval =
        currentForumData.membershipSettings?.requiresApproval || false;
      const willRequireMemberApproval =
        settings.membershipSettings?.requiresApproval || false;

      // Actualizar configuración del foro
      await updateDoc(forumRef, {
        ...settings,
        updatedAt: serverTimestamp(),
      });

      let postsActivated = 0;
      let membersApproved = 0;

      // CASO 1: Si se desactiva validación de posts → Activar posts pendientes
      if (wasRequiringPostApproval && !willRequirePostApproval) {
        const activationResult = await validatePostsBatch(
          forumId,
          currentForumData.name
        );

        if (activationResult.success) {
          postsActivated = activationResult.validatedCount || 0;
        }
      }

      // CASO 2: Si se desactiva aprobación de miembros → Aprobar miembros pendientes
      if (wasRequiringMemberApproval && !willRequireMemberApproval) {
        const pendingMembers = currentForumData.pendingMembers || {};

        const approvalResult = await approvePendingMembers(
          forumId,
          currentForumData.name,
          pendingMembers
        );

        if (approvalResult.success) {
          membersApproved = approvalResult.approvedCount || 0;
        }
      }

      // Construir mensaje de respuesta
      const messages = [];
      if (postsActivated > 0) {
        messages.push(`${postsActivated} publicación(es) activada(s)`);
      }
      if (membersApproved > 0) {
        messages.push(`${membersApproved} miembro(s) aprobado(s)`);
      }

      if (messages.length > 0) {
        return {
          success: true,
          postsActivated,
          membersApproved,
          message: `Configuración actualizada. ${messages.join(" y ")}.`,
        };
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

      batch.update(forumRef, {
        ownerId: oldestModerator,
        [`moderators.${auth.currentUser.uid}`]: deleteField(),
        members: arrayRemove(auth.currentUser.uid),
        memberCount: firestoreIncrement(-1),
      });

      await batch.commit();

      await notificationService.sendOwnershipTransferred(
        oldestModerator,
        forumData.name
      );

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
    approvePendingMembers,
    loading,
    error,
  };
};
