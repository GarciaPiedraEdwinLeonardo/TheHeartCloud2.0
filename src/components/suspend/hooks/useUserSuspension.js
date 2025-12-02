import { useState } from "react";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";

export function useUserSuspension() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //Verificar y quitar suspensión expirada
  const checkAndRemoveExpiredSuspension = async (userId) => {
    try {
      console.log(`🔍 Verificando suspensión para usuario: ${userId}`);

      const userDoc = await getDoc(doc(db, "users", userId));

      if (!userDoc.exists()) {
        console.error("❌ Usuario no encontrado:", userId);
        return {
          success: false,
          error: "Usuario no encontrado",
          expired: false,
        };
      }

      const userData = userDoc.data();
      const suspension = userData.suspension || {};

      // Si no está suspendido, no hacer nada
      if (!suspension.isSuspended) {
        return { success: true, expired: false, message: "No está suspendido" };
      }

      // Si es suspensión permanente, no expira
      if (!suspension.endDate) {
        return {
          success: true,
          expired: false,
          message: "Suspensión permanente",
        };
      }

      // Convertir Firestore Timestamp a Date
      const endDate = suspension.endDate.toDate();
      const now = new Date();

      // Verificar si la suspensión ha expirado
      if (now >= endDate) {
        console.log(`Suspensión expirada para usuario ${userId}. Quitando...`);

        // Quitar la suspensión automáticamente
        await updateDoc(doc(db, "users", userId), {
          "suspension.isSuspended": false,
          "suspension.reason": null,
          "suspension.startDate": null,
          "suspension.endDate": null,
          "suspension.suspendedBy": null,
          "suspension.expiredAt": serverTimestamp(),
          "suspension.autoRemoved": true,
          lastUpdated: serverTimestamp(),
        });

        console.log(
          `Suspensión quitada automáticamente para usuario ${userId}`
        );
        return {
          success: true,
          expired: true,
          message: "Suspensión quitada automáticamente",
        };
      }

      // Calcular tiempo restante
      const timeLeftMs = endDate - now;
      const hoursLeft = Math.floor(timeLeftMs / (1000 * 60 * 60));
      const minutesLeft = Math.floor(
        (timeLeftMs % (1000 * 60 * 60)) / (1000 * 60)
      );

      return {
        success: true,
        expired: false,
        message: `Tiempo restante: ${hoursLeft}h ${minutesLeft}m`,
        timeLeft: { hours: hoursLeft, minutes: minutesLeft, ms: timeLeftMs },
      };
    } catch (err) {
      console.error("Error verificando suspensión:", err);
      return { success: false, error: err.message, expired: false };
    }
  };

  // Función para suspender usuario
  const suspendUser = async (userId, reason, duration, suspendedBy) => {
    setLoading(true);
    setError(null);

    try {
      let endDate = null;

      // Calcular fecha de fin
      if (duration !== "permanent") {
        const days = parseInt(duration);
        endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        // Programar verificación automática (opcional)
        const timeUntilExpiry = endDate.getTime() - Date.now();
        if (timeUntilExpiry > 0 && timeUntilExpiry < 7 * 24 * 60 * 60 * 1000) {
          // Solo programar para suspensiones menores a 7 días
          console.log(
            `Programando verificación automática en ${timeUntilExpiry}ms`
          );
          setTimeout(async () => {
            await checkAndRemoveExpiredSuspension(userId);
          }, timeUntilExpiry);
        }
      }

      const suspensionData = {
        "suspension.isSuspended": true,
        "suspension.reason": reason,
        "suspension.startDate": serverTimestamp(),
        "suspension.endDate": endDate,
        "suspension.suspendedBy": suspendedBy,
        "suspension.duration": duration,
        lastUpdated: serverTimestamp(),
      };

      await updateDoc(doc(db, "users", userId), suspensionData);

      return { success: true, endDate };
    } catch (err) {
      console.error("Error suspendiendo usuario:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para quitar suspensión manualmente
  const unsuspendUser = async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const suspensionData = {
        "suspension.isSuspended": false,
        "suspension.reason": null,
        "suspension.startDate": null,
        "suspension.endDate": null,
        "suspension.suspendedBy": null,
        "suspension.manuallyRemovedAt": serverTimestamp(),
        lastUpdated: serverTimestamp(),
      };

      await updateDoc(doc(db, "users", userId), suspensionData);

      return { success: true };
    } catch (err) {
      console.error("Error levantando suspensión:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar si un usuario está suspendido (incluye verificación de expiración)
  const getUserSuspensionStatus = async (userId) => {
    try {
      const result = await checkAndRemoveExpiredSuspension(userId);

      if (result.expired) {
        // Si expiró, devolver que NO está suspendido
        return { isSuspended: false, expired: true, ...result };
      }

      // Si no expiró, verificar estado actual
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          isSuspended: userData.suspension?.isSuspended || false,
          expired: false,
          suspension: userData.suspension,
          ...result,
        };
      }

      return {
        isSuspended: false,
        expired: false,
        error: "Usuario no encontrado",
      };
    } catch (err) {
      console.error("Error obteniendo estado de suspensión:", err);
      return { isSuspended: false, expired: false, error: err.message };
    }
  };

  return {
    suspendUser,
    unsuspendUser,
    checkAndRemoveExpiredSuspension,
    getUserSuspensionStatus,
    loading,
    error,
  };
}
