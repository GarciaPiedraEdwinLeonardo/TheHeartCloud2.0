import { useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  deleteField,
  increment,
} from "firebase/firestore";
import { db, auth } from "../../../config/firebase";
import { notificationService } from "./../../notifications/services/notificationService";

export const useCommunityBans = () => {
  const [loading, setLoading] = useState(false);

  const banUser = async (forumId, userId, reason, duration = "permanent") => {
    setLoading(true);
    try {
      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) {
        throw new Error("Comunidad no encontrada");
      }

      const forumData = forumDoc.data();

      // Obtener información del usuario a banear
      const userToBanDoc = await getDoc(doc(db, "users", userId));
      const userToBanData = userToBanDoc.data();

      // Crear objeto de baneo
      const banData = {
        userId,
        bannedAt: new Date(),
        bannedBy: auth.currentUser.uid,
        reason,
        duration,
        isActive: true,
        userEmail: userToBanData?.email || "Email no disponible",
        userName: userToBanData?.name
          ? `${userToBanData.name.name || ""} ${
              userToBanData.name.apellidopat || ""
            } ${userToBanData.name.apellidomat || ""}`.trim()
          : "Usuario",
        userRole: userToBanData?.role || "unverified",
        forumId: forumId,
        forumName: forumData.name,
      };

      // Preparar actualizaciones
      const updates = {
        bannedUsers: arrayUnion(banData),
      };

      // 1. Remover de miembros si es miembro
      const isMember = forumData.members && forumData.members.includes(userId);
      if (isMember) {
        updates.members = arrayRemove(userId);
        updates.memberCount = increment(-1);
      }

      // 2. Remover de moderadores si es moderador
      const isModerator = forumData.moderators && forumData.moderators[userId];
      if (isModerator) {
        updates[`moderators.${userId}`] = deleteField();
      }

      // 3. Remover de pendientes si está pendiente
      const isPending =
        forumData.pendingMembers && forumData.pendingMembers[userId];
      if (isPending) {
        updates[`pendingMembers.${userId}`] = deleteField();
      }

      // Ejecutar todas las actualizaciones en una sola operación
      await updateDoc(forumRef, updates);

      // 4. Actualizar estadísticas del usuario si era miembro
      if (isMember) {
        try {
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, {
            "stats.joinedForumsCount": increment(-1),
            joinedForums: arrayRemove(forumId),
          });
        } catch (error) {
          console.error("Error actualizando estadísticas del usuario:", error);
          // No lanzar error, el baneo ya se completó
        }
      }

      // 5. Notificar al usuario
      try {
        await notificationService.sendCommunityBan(
          userId,
          forumData.name,
          reason,
          duration
        );
      } catch (error) {
        console.error("Error enviando notificación:", error);
        // No lanzar error, el baneo ya se completó
      }
      return { success: true, banData, wasMember: isMember };
    } catch (error) {
      console.error("Error baneando usuario:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const isUserBanned = async (forumId, userId) => {
    try {
      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) {
        return false;
      }

      const forumData = forumDoc.data();
      const bannedUsers = forumData.bannedUsers || [];

      // Buscar usuario en la lista de baneados
      const userBan = bannedUsers.find(
        (ban) => ban.userId === userId && ban.isActive !== false
      );

      if (!userBan) {
        return false;
      }

      // Verificar si el baneo ha expirado
      if (userBan.duration !== "permanent") {
        const banDate =
          userBan.bannedAt?.toDate?.() || new Date(userBan.bannedAt);
        const now = new Date();
        const daysDiff = Math.floor((now - banDate) / (1000 * 60 * 60 * 24));

        let maxDays = 0;
        switch (userBan.duration) {
          case "1d":
            maxDays = 1;
            break;
          case "7d":
            maxDays = 7;
            break;
          case "30d":
            maxDays = 30;
            break;
          default:
            maxDays = 0;
        }

        if (daysDiff >= maxDays) {
          try {
            await updateDoc(forumRef, {
              bannedUsers: bannedUsers.filter((ban) => ban.userId !== userId),
            });
          } catch (error) {
            console.error("Error removiendo baneo expirado:", error);
          }
          return false;
        }
      }

      return true; // Usuario está baneado
    } catch (error) {
      console.error("Error verificando estado de baneo:", error);
      return false;
    }
  };

  const unbanUser = async (forumId, userId) => {
    setLoading(true);
    try {
      const forumRef = doc(db, "forums", forumId);
      const forumDoc = await getDoc(forumRef);

      if (!forumDoc.exists()) {
        throw new Error("Comunidad no encontrada");
      }

      const forumData = forumDoc.data();
      const bannedUsers = forumData.bannedUsers || [];

      // Filtrar el usuario de la lista de baneados
      const updatedBannedUsers = bannedUsers.filter(
        (ban) => ban.userId !== userId
      );

      await updateDoc(forumRef, {
        bannedUsers: updatedBannedUsers,
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Error desbaneando usuario:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    banUser,
    isUserBanned,
    unbanUser,
    loading,
  };
};
