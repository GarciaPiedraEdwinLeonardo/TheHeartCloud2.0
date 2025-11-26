import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db, auth } from "./../../../config/firebase.js";

export const strikesService = {
  // Agregar un strike a un usuario
  async addStrike(strikeData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuario no autenticado");

      const strike = {
        userId: strikeData.userId,
        reason: strikeData.reason || "Sin motivo especificado",
        severity: strikeData.severity || "medium", // Valor por defecto
        points: strikeData.points || 1, // Puntos del strike (1-3)
        expiresAt: strikeData.expiresAt || null, // Fecha de expiración
        givenBy: user.uid,
        givenAt: serverTimestamp(),

        // Información del contenido relacionado - Asegurar valores válidos
        relatedContent: {
          type: strikeData.contentType || "general", // Valor por defecto
          id: strikeData.contentId || "unknown_id", // Valor por defecto
        },

        // Estado con valores por defecto
        isActive: true,
        appealed: false,
        appealReason: null,
      };

      const docRef = await addDoc(collection(db, "userStrikes"), strike);

      // Actualizar contador de strikes del usuario
      await this.updateUserStrikeCount(strikeData.userId);

      return { success: true, strikeId: docRef.id };
    } catch (error) {
      console.error("Error agregando strike:", error);
      return { success: false, error: error.message };
    }
  },

  // Obtener strikes de un usuario
  async getUserStrikes(userId, activeOnly = true) {
    try {
      let q = query(
        collection(db, "userStrikes"),
        where("userId", "==", userId),
        orderBy("givenAt", "desc")
      );

      if (activeOnly) {
        q = query(q, where("isActive", "==", true));
      }

      const snapshot = await getDocs(q);
      const strikes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, strikes };
    } catch (error) {
      console.error("Error obteniendo strikes:", error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar contador de strikes del usuario
  async updateUserStrikeCount(userId) {
    try {
      const userRef = doc(db, "users", userId);
      const strikesResult = await this.getUserStrikes(userId, true);

      if (strikesResult.success) {
        const activeStrikes = strikesResult.strikes;
        const totalPoints = activeStrikes.reduce(
          (sum, strike) => sum + strike.points,
          0
        );

        await updateDoc(userRef, {
          "moderation.strikeCount": activeStrikes.length,
          "moderation.strikePoints": totalPoints,
          "moderation.lastStrikeAt": serverTimestamp(),
        });

        // Verificar si se debe suspender al usuario automáticamente
        await this.checkAutomaticSuspension(userId, totalPoints);
      }

      return { success: true };
    } catch (error) {
      console.error("Error actualizando contador de strikes:", error);
      return { success: false, error: error.message };
    }
  },

  // Verificar suspensión automática
  async checkAutomaticSuspension(userId, totalPoints) {
    try {
      const suspensionRules = {
        3: "1d", // 3 puntos = 1 día de suspensión
        5: "7d", // 5 puntos = 7 días de suspensión
        8: "30d", // 8 puntos = 30 días de suspensión
        10: "permanent", // 10 puntos = suspensión permanente
      };

      const suspensionDuration = suspensionRules[totalPoints];

      if (suspensionDuration) {
        // Aquí integraríamos con el sistema de suspensiones existente
        console.log(
          `Usuario ${userId} debe ser suspendido por ${suspensionDuration} (${totalPoints} puntos)`
        );

        // Registrar la acción automática
        const moderationLogsService = await import(
          "./moderationLogsService.js"
        );
        await moderationLogsService.logAction({
          action: "user_auto_suspended",
          targetType: "user",
          targetId: userId,
          reason: `Suspensión automática por acumulación de strikes (${totalPoints} puntos)`,
          severity: "high",
          automated: true,
          details: { points: totalPoints, duration: suspensionDuration },
        });
      }

      return {
        success: true,
        shouldSuspend: !!suspensionDuration,
        duration: suspensionDuration,
      };
    } catch (error) {
      console.error("Error verificando suspensión automática:", error);
      return { success: false, error: error.message };
    }
  },

  // Expirar strikes automáticamente
  async expireOldStrikes() {
    try {
      const now = new Date();
      const q = query(
        collection(db, "userStrikes"),
        where("isActive", "==", true),
        where("expiresAt", "<=", now)
      );

      const snapshot = await getDocs(q);
      const batch = [];

      snapshot.forEach((doc) => {
        batch.push(updateDoc(doc.ref, { isActive: false }));
      });

      await Promise.all(batch);

      // Actualizar contadores de usuarios afectados
      const userIds = [
        ...new Set(snapshot.docs.map((doc) => doc.data().userId)),
      ];
      await Promise.all(
        userIds.map((userId) => this.updateUserStrikeCount(userId))
      );

      return { success: true, expired: snapshot.size };
    } catch (error) {
      console.error("Error expirando strikes:", error);
      return { success: false, error: error.message };
    }
  },
};
