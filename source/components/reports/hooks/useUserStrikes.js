import { useState, useEffect } from "react";
import { strikesService } from "../services/strikesService";

export const useUserStrikes = (userId) => {
  const [strikes, setStrikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (userId) {
      loadStrikes();
    }
  }, [userId]);

  const loadStrikes = async () => {
    try {
      setLoading(true);
      const result = await strikesService.getUserStrikes(userId);

      if (result.success) {
        setStrikes(result.strikes);
        setTotalPoints(
          result.strikes.reduce((sum, strike) => sum + strike.points, 0)
        );
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Error cargando strikes");
      console.error("Error en useUserStrikes:", err);
    } finally {
      setLoading(false);
    }
  };

  const addStrike = async (strikeData) => {
    try {
      const result = await strikesService.addStrike({
        userId,
        ...strikeData,
      });

      if (result.success) {
        await loadStrikes(); // Recargar lista
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error("Error agregando strike:", err);
      return { success: false, error: err.message };
    }
  };

  const getSuspensionLevel = () => {
    if (totalPoints >= 10) return { level: "permanent", pointsToNext: 0 };
    if (totalPoints >= 8) return { level: "30d", pointsToNext: 2 };
    if (totalPoints >= 5) return { level: "7d", pointsToNext: 3 };
    if (totalPoints >= 3) return { level: "1d", pointsToNext: 2 };
    return { level: "none", pointsToNext: 3 - totalPoints };
  };

  const getStrikeHistory = async () => {
    const result = await strikesService.getUserStrikes(userId, false);
    return result.success ? result.strikes : [];
  };

  return {
    strikes,
    loading,
    error,
    totalPoints,
    suspensionLevel: getSuspensionLevel(),
    refresh: loadStrikes,
    addStrike,
    getStrikeHistory,
  };
};
