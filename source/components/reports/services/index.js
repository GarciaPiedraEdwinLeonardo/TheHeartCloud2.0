export { reportsService } from "./reportsService";
export { moderationLogsService } from "./moderationLogsService";
export { strikesService } from "./strikesService";

// Servicio unificado para acciones de moderación
export const moderationService = {
  // Acción completa de moderación con registro
  async takeModerationAction(actionData) {
    try {
      const { action, targetType, targetId, reason, details } = actionData;

      // 1. Registrar en logs
      const logResult = await moderationLogsService.logAction({
        action,
        targetType,
        targetId,
        reason,
        details,
        severity: actionData.severity || "medium",
      });

      if (!logResult.success) {
        throw new Error("Error registrando acción en logs");
      }

      // 2. Si la acción incluye un strike, agregarlo
      if (actionData.strikeData) {
        await strikesService.addStrike(actionData.strikeData);
      }

      // 3. Si hay reportes relacionados, marcarlos como resueltos
      if (actionData.relatedReports) {
        for (const reportId of actionData.relatedReports) {
          await reportsService.updateReport(reportId, {
            status: "resolved",
            actionTaken: action,
            moderatorNotes: reason,
          });
        }
      }

      return { success: true, logId: logResult.logId };
    } catch (error) {
      console.error("Error en acción de moderación:", error);
      return { success: false, error: error.message };
    }
  },
};
