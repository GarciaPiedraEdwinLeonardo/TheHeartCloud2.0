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
} from "firebase/firestore";
import { db, auth } from "./../../../config/firebase";

export const reportsService = {
  // Crear un nuevo reporte
  async createReport(reportData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuario no autenticado");

      const report = {
        // Información del contenido reportado
        targetType: reportData.targetType, // 'post', 'comment', 'user', 'forum', 'profile'
        targetId: reportData.targetId,
        targetData: reportData.targetData, // Snapshots del contenido reportado

        // Información del reporte
        reason: reportData.reason,
        description: reportData.description,
        urgency: reportData.urgency, // 'low', 'medium', 'high', 'critical'

        // Metadatos
        reportedBy: user.uid,
        reportedAt: serverTimestamp(),
        status: "pending", // 'pending', 'reviewed', 'resolved', 'dismissed'

        // Información del revisor (se llena después)
        reviewedBy: null,
        reviewedAt: null,
        moderatorNotes: null,
        actionTaken: null,

        // Estadísticas
        reportCount: 1, // Para reportes duplicados
        lastReportedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "reports"), report);
      return { success: true, reportId: docRef.id };
    } catch (error) {
      console.error("Error creando reporte:", error);
      return { success: false, error: error.message };
    }
  },

  // Obtener reportes con filtros
  async getReports(filters = {}) {
    try {
      let q = collection(db, "reports");

      // Aplicar filtros
      const constraints = [];
      if (filters.status)
        constraints.push(where("status", "==", filters.status));
      if (filters.targetType)
        constraints.push(where("targetType", "==", filters.targetType));
      if (filters.urgency)
        constraints.push(where("urgency", "==", filters.urgency));

      // Ordenar por fecha de reporte (más recientes primero)
      constraints.push(orderBy("reportedAt", "desc"));

      q = query(q, ...constraints);
      const snapshot = await getDocs(q);

      const reports = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, reports };
    } catch (error) {
      console.error("Error obteniendo reportes:", error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar estado de reporte
  async updateReport(reportId, updates) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuario no autenticado");

      const reportRef = doc(db, "reports", reportId);

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      // Si se está revisando, agregar información del moderador
      if (updates.status === "reviewed" || updates.status === "resolved") {
        updateData.reviewedBy = user.uid;
        updateData.reviewedAt = serverTimestamp();
      }

      await updateDoc(reportRef, updateData);
      return { success: true };
    } catch (error) {
      console.error("Error actualizando reporte:", error);
      return { success: false, error: error.message };
    }
  },

  // Obtener estadísticas de reportes
  async getReportsStats() {
    try {
      const [pending, reviewed, resolved, critical] = await Promise.all([
        this.getReports({ status: "pending" }),
        this.getReports({ status: "reviewed" }),
        this.getReports({ status: "resolved" }),
        this.getReports({ urgency: "critical" }),
      ]);

      return {
        success: true,
        stats: {
          pending: pending.success ? pending.reports.length : 0,
          reviewed: reviewed.success ? reviewed.reports.length : 0,
          resolved: resolved.success ? resolved.reports.length : 0,
          critical: critical.success ? critical.reports.length : 0,
          total:
            (pending.success ? pending.reports.length : 0) +
            (reviewed.success ? reviewed.reports.length : 0) +
            (resolved.success ? resolved.reports.length : 0),
        },
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      return { success: false, error: error.message };
    }
  },
};
