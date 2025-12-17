import { useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  deleteField,
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

      // Agregar a lista de baneados
      await updateDoc(forumRef, {
        bannedUsers: arrayUnion(banData),
      });

      // Remover de miembros si es miembro
      if (forumData.members && forumData.members.includes(userId)) {
        await updateDoc(forumRef, {
          members: arrayRemove(userId),
          memberCount:
            forumData.memberCount > 0 ? forumData.memberCount - 1 : 0,
        });
      }

      // Remover de moderadores si es moderador
      if (forumData.moderators && forumData.moderators[userId]) {
        await updateDoc(forumRef, {
          [`moderators.${userId}`]: deleteField(),
        });
      }

      // Remover de pendientes si está pendiente
      if (forumData.pendingMembers && forumData.pendingMembers[userId]) {
        await updateDoc(forumRef, {
          [`pendingMembers.${userId}`]: deleteField(),
        });
      }

      // Notificar al usuario
      await notificationService.sendCommunityBan(
        userId,
        forumData.name,
        reason,
        duration
      );

      return { success: true, banData };
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
      const forumData = forumDoc.data();

      const bannedUsers = forumData.bannedUsers || [];
      return bannedUsers.some(
        (ban) => ban.userId === userId && ban.isActive !== false
      );
    } catch (error) {
      console.error("Error checking ban status:", error);
      return false;
    }
  };

  return {
    banUser,
    isUserBanned,
    loading,
  };
};
