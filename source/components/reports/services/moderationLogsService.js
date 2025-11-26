import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./../../../config/firebase";

export const moderationLogsService = {
  // Registrar una acción de moderación
  async logAction(actionData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuario no autenticado");

      const log = {
        // Información de la acción
        action: actionData.action, // 'user_suspended', 'post_removed', 'user_verified', etc.
        targetType: actionData.targetType, // 'user', 'post', 'comment', 'forum'
        targetId: actionData.targetId,

        // Detalles de la acción
        reason: actionData.reason,
        details: actionData.details, // Objeto flexible con snapshots

        // Información del moderador
        performedBy: user.uid,
        timestamp: serverTimestamp(),

        // Contexto adicional
        severity: actionData.severity || "medium", // 'low', 'medium', 'high', 'critical'
        requiresFollowUp: actionData.requiresFollowUp || false,
        automated: actionData.automated || false,
      };

      const docRef = await addDoc(collection(db, "moderationLogs"), log);

      // También actualizar estadísticas de moderación del usuario
      await this.updateModeratorStats(user.uid);

      return { success: true, logId: docRef.id };
    } catch (error) {
      console.error("Error registrando acción de moderación:", error);
      return { success: false, error: error.message };
    }
  },

  // Obtener logs con filtros
  async getLogs(filters = {}) {
    try {
      let q = collection(db, "moderationLogs");

      const constraints = [orderBy("timestamp", "desc")];

      if (filters.action)
        constraints.push(where("action", "==", filters.action));
      if (filters.targetType)
        constraints.push(where("targetType", "==", filters.targetType));
      if (filters.performedBy)
        constraints.push(where("performedBy", "==", filters.performedBy));
      if (filters.days) {
        const date = new Date();
        date.setDate(date.getDate() - filters.days);
        constraints.push(where("timestamp", ">=", date));
      }

      q = query(q, ...constraints);
      const snapshot = await getDocs(q);

      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, logs };
    } catch (error) {
      console.error("Error obteniendo logs:", error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar estadísticas del moderador
  async updateModeratorStats(userId) {
    try {
      // En una implementación real, esto actualizaría un documento de estadísticas
      // Por ahora es un placeholder para futura implementación
      console.log(`Actualizando estadísticas para moderador: ${userId}`);
      return { success: true };
    } catch (error) {
      console.error("Error actualizando estadísticas:", error);
      return { success: false, error: error.message };
    }
  },

  // Obtener estadísticas de moderación
  async getModerationStats(timeRange = 30) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - timeRange);

      const q = query(
        collection(db, "moderationLogs"),
        where("timestamp", ">=", date),
        orderBy("timestamp", "desc")
      );

      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map((doc) => doc.data());

      const stats = {
        totalActions: logs.length,
        actionsByType: logs.reduce((acc, log) => {
          acc[log.action] = (acc[log.action] || 0) + 1;
          return acc;
        }, {}),
        actionsByModerator: logs.reduce((acc, log) => {
          acc[log.performedBy] = (acc[log.performedBy] || 0) + 1;
          return acc;
        }, {}),
        severityBreakdown: logs.reduce((acc, log) => {
          acc[log.severity] = (acc[log.severity] || 0) + 1;
          return acc;
        }, {}),
      };

      return { success: true, stats };
    } catch (error) {
      console.error("Error obteniendo estadísticas de moderación:", error);
      return { success: false, error: error.message };
    }
  },
};
