import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../config/firebase";

export const reportService = {
  // Crear un nuevo reporte
  async createReport(reportData) {
    try {
      // Limpiar el objeto - remover campos undefined
      const cleanReportData = Object.fromEntries(
        Object.entries(reportData).filter(
          ([_, value]) => value !== undefined && value !== null
        )
      );

      const reportWithMetadata = {
        ...cleanReportData,
        status: "pending",
        assignedModerator: null,
        resolution: null,
        resolvedAt: null,
        resolvedBy: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, "reports"),
        reportWithMetadata
      );
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error creando reporte:", error);
      return { success: false, error: error.message };
    }
  },
};
