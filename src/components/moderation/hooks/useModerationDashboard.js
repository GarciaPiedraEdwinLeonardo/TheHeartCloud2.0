import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useReports } from "../../reports/hooks/useReports";

export const useModerationDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [globalReports, setGlobalReports] = useState([]);
  const [deletedPosts, setDeletedPosts] = useState([]);
  const [deletedComments, setDeletedComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Reportes de usuarios
  const {
    reports: userReports,
    loading: reportsLoading,
    refresh: refreshUserReports,
  } = useReports({
    status:
      activeTab === "pending"
        ? "pending"
        : activeTab === "resolved"
        ? "resolved"
        : null,
  });

  // Cargar reportes globales
  const loadGlobalReports = async () => {
    try {
      console.log("📥 Cargando reportes globales...");

      const q = query(
        collection(db, "global_moderation_reports"),
        orderBy("reportedAt", "desc")
      );

      const snapshot = await getDocs(q);
      const reportsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Asegurar campos compatibles
        type: getContentTypeFromAction(doc.data().actionType),
        targetName: getTargetNameFromAction(doc.data().actionType, doc.data()),
        createdAt: doc.data().reportedAt,
      }));

      console.log(`✅ ${reportsData.length} reportes globales cargados`);
      setGlobalReports(reportsData);
    } catch (error) {
      console.error("❌ Error loading global reports:", error);
      throw error;
    }
  };

  // Helper para determinar tipo de contenido desde actionType
  const getContentTypeFromAction = (actionType) => {
    if (actionType.includes("post")) return "post";
    if (actionType.includes("comment")) return "comment";
    if (actionType.includes("user") || actionType.includes("community"))
      return "user";
    return "moderator_action";
  };

  // Helper para obtener nombre del target
  const getTargetNameFromAction = (actionType, data) => {
    switch (actionType) {
      case "post_deleted_by_moderator":
        return `Post eliminado: ${data.postId}`;
      case "post_rejected":
        return `Post rechazado: ${data.postId}`;
      case "comment_rejected":
        return `Comentario rechazado: ${data.commentId}`;
      case "community_ban":
        return `Usuario baneado: ${data.userId}`;
      default:
        return `Acción: ${actionType}`;
    }
  };

  // Cargar contenido eliminado - CORREGIDO
  const loadDeletedContent = async () => {
    try {
      console.log("📥 Cargando contenido eliminado...");

      // Cargar posts eliminados
      const deletedPostsQuery = query(
        collection(db, "deleted_posts"),
        orderBy("deletedAt", "desc"),
        where("moderatorAction", "==", true)
      );

      const deletedPostsSnapshot = await getDocs(deletedPostsQuery);
      const postsData = deletedPostsSnapshot.docs.map((doc) => ({
        id: doc.id,
        type: "post",
        moderatorAction: true,
        ...doc.data(),
      }));
      setDeletedPosts(postsData);

      // Cargar comentarios eliminados
      const deletedCommentsQuery = query(
        collection(db, "deleted_comments"),
        orderBy("deletedAt", "desc"),
        where("moderatorAction", "==", true)
      );

      const deletedCommentsSnapshot = await getDocs(deletedCommentsQuery);
      const commentsData = deletedCommentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        type: "comment",
        moderatorAction: true,
        ...doc.data(),
      }));
      setDeletedComments(commentsData);

      console.log(
        `✅ ${postsData.length} posts y ${commentsData.length} comentarios eliminados cargados`
      );
    } catch (error) {
      console.error("❌ Error loading deleted content:", error);
      throw error;
    }
  };

  // Cargar todos los datos - CORREGIDO
  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Iniciando carga de datos del dashboard...");

      const loadPromises = [loadGlobalReports()];

      if (activeTab === "audit") {
        loadPromises.push(loadDeletedContent());
      }

      await Promise.all(loadPromises);
      console.log("✅ Todos los datos cargados exitosamente");
    } catch (error) {
      console.error("❌ Error cargando datos del dashboard:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales y cuando cambie la pestaña
  useEffect(() => {
    loadAllData();
  }, [activeTab, refreshTrigger]);

  // Cargar contenido eliminado cuando se active la pestaña de auditoría
  useEffect(() => {
    if (activeTab === "audit") {
      loadDeletedContent();
    }
  }, [activeTab]);

  // Combinar reportes según pestaña activa - CORREGIDO
  const getCombinedReports = () => {
    console.log(`🔄 Combinando reportes para pestaña: ${activeTab}`);

    switch (activeTab) {
      case "pending":
        const pendingUserReports = userReports.filter(
          (r) => r.status === "pending"
        );
        const pendingGlobalReports = globalReports.filter(
          (r) => r.status === "pending_review"
        );
        console.log(
          `📊 Pendientes: ${pendingUserReports.length} usuarios + ${pendingGlobalReports.length} globales`
        );
        return [...pendingUserReports, ...pendingGlobalReports];

      case "resolved":
        const resolvedUserReports = userReports.filter(
          (r) => r.status === "resolved"
        );
        const resolvedGlobalReports = globalReports.filter(
          (r) => r.status === "resolved"
        );
        console.log(
          `📊 Resueltos: ${resolvedUserReports.length} usuarios + ${resolvedGlobalReports.length} globales`
        );
        return [...resolvedUserReports, ...resolvedGlobalReports];

      case "global":
        console.log(`📊 Globales: ${globalReports.length} reportes`);
        return globalReports;

      case "user_reports":
        console.log(`📊 Usuarios: ${userReports.length} reportes`);
        return userReports;

      case "audit":
        const auditData = [...deletedPosts, ...deletedComments];
        console.log(`📊 Auditoría: ${auditData.length} elementos`);
        return auditData;

      default:
        return [];
    }
  };

  // Calcular estadísticas - CORREGIDO
  const stats = {
    pending:
      userReports.filter((r) => r.status === "pending").length +
      globalReports.filter((r) => r.status === "pending_review").length,
    resolved:
      userReports.filter((r) => r.status === "resolved").length +
      globalReports.filter((r) => r.status === "resolved").length,
    global: globalReports.length,
    user_reports: userReports.length,
    audit: deletedPosts.length + deletedComments.length,
    total:
      userReports.length +
      globalReports.length +
      deletedPosts.length +
      deletedComments.length,
  };

  const refreshAll = () => {
    console.log("🔄 Refrescando todos los datos...");
    setRefreshTrigger((prev) => prev + 1);
    refreshUserReports();
  };

  return {
    reports: getCombinedReports(),
    loading: loading || reportsLoading,
    error,
    activeTab,
    setActiveTab,
    stats,
    refreshData: refreshAll,
  };
};
