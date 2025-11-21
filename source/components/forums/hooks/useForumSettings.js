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

export const useForumSettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateForumSettings = async (forumId, settings) => {
    setLoading(true);
    setError(null);

    try {
      const forumRef = doc(db, "forums", forumId);
      await updateDoc(forumRef, {
        ...settings,
        updatedAt: new Date(),
      });
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
      const moderatorIds = Object.keys(moderators);

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

      console.log("🔍 TRANSFIRIENDO PROPIEDAD:");
      console.log(" - Dueño actual:", auth.currentUser.uid);
      console.log(
        " - Moderadores disponibles:",
        otherModerators.map((m) => m[0])
      );
      console.log(" - Nuevo dueño seleccionado:", oldestModerator);

      const batch = writeBatch(db);

      // 1. TRANSFERIR OWNERSHIP
      batch.update(forumRef, {
        ownerId: oldestModerator, // Actualizar el ownerId
        [`moderators.${auth.currentUser.uid}`]: deleteField(), // Remover al dueño actual de moderadores
        members: arrayRemove(auth.currentUser.uid), // Remover de miembros
        memberCount: firestoreIncrement(-1), // Usar firestoreIncrement
      });

      await batch.commit();
      console.log(" Batch commit exitoso");

      // 2. Verificar que se actualizó
      const updatedForumDoc = await getDoc(forumRef);
      const updatedForumData = updatedForumDoc.data();
      console.log("🔍 Datos del foro después:", updatedForumData);

      // 3. Notificar al nuevo dueño
      await notificationService.sendOwnershipTransferred(
        oldestModerator,
        forumData.name
      );

      // 4. Actualizar stats del usuario que abandona
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
