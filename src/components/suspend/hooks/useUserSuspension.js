// src/hooks/useUserSuspension.js
import { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../config/firebase";

export function useUserSuspension() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const suspendUser = async (userId, reason, duration, suspendedBy) => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔨 Iniciando suspensión para usuario:", userId);
      console.log("📝 Razón:", reason);
      console.log("⏱️ Duración:", duration);
      console.log("👤 Suspendido por:", suspendedBy);

      let endDate = null;

      // Calcular fecha de fin basado en la duración (si no es permanente)
      if (duration !== "permanent") {
        const days = parseInt(duration);
        endDate = new Date();
        endDate.setDate(endDate.getDate() + days);
        console.log("📅 Fecha de fin calculada:", endDate);
      } else {
        console.log("⏰ Suspensión permanente");
      }

      // Preparar datos de suspensión según tu estructura de Firestore
      const suspensionData = {
        "suspension.isSuspended": true,
        "suspension.reason": reason,
        "suspension.startDate": serverTimestamp(),
        "suspension.endDate": endDate,
        "suspension.suspendedBy": suspendedBy,
        lastUpdated: serverTimestamp(),
      };

      console.log("💾 Actualizando documento con:", suspensionData);

      // Actualizar el documento del usuario
      await updateDoc(doc(db, "users", userId), suspensionData);

      console.log("✅ Usuario suspendido exitosamente");
      return { success: true };
    } catch (err) {
      console.error("❌ Error suspendiendo usuario:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const unsuspendUser = async (userId) => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔓 Levantando suspensión para usuario:", userId);

      const suspensionData = {
        "suspension.isSuspended": false,
        "suspension.reason": null,
        "suspension.startDate": null,
        "suspension.endDate": null,
        "suspension.suspendedBy": null,
        lastUpdated: serverTimestamp(),
      };

      await updateDoc(doc(db, "users", userId), suspensionData);

      console.log("✅ Suspensión levantada exitosamente");
      return { success: true };
    } catch (err) {
      console.error("❌ Error levantando suspensión:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    suspendUser,
    unsuspendUser,
    loading,
    error,
  };
}
