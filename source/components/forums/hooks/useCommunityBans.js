import { useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  addDoc,
  collection,
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

      // Agregar a lista de baneados
      await updateDoc(forumRef, {
        bannedUsers: arrayUnion({
          userId,
          bannedAt: new Date(),
          bannedBy: auth.currentUser.uid,
          reason,
          duration,
          isActive: true,
        }),
      });

      // Remover de miembros si es miembro
      await updateDoc(forumRef, {
        members: arrayRemove(userId),
        memberCount: forumData.memberCount > 0 ? forumData.memberCount - 1 : 0,
      });

      // Remover de moderadores si es moderador
      await updateDoc(forumRef, {
        [`moderators.${userId}`]: deleteField(),
      });

      // Remover de pendientes si está pendiente
      await updateDoc(forumRef, {
        [`pendingMembers.${userId}`]: deleteField(),
      });

      // Notificar al usuario
      await notificationService.sendCommunityBan(
        userId,
        forumData.name,
        reason,
        duration
      );

      // Reportar a moderación global
      await reportToGlobalModeration(userId, reason, "community_ban");

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const reportToGlobalModeration = async (userId, reason, actionType) => {
    try {
      await addDoc(collection(db, "moderation_reports"), {
        userId,
        reason,
        moderatorId: auth.currentUser.uid,
        actionType,
        reportedAt: new Date(),
        status: "pending_review",
        communityContext: true,
      });
    } catch (error) {
      console.error("Error reporting to global moderation:", error);
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
