import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs 
} from 'firebase/firestore';
import { db } from './../../../config/firebase';
import { useReports } from './../../reports/hooks/useReports';

export const useModerationDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [globalReports, setGlobalReports] = useState([]);
  const [deletedPosts, setDeletedPosts] = useState([]);
  const [deletedComments, setDeletedComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reportes de usuarios
  const { reports: userReports, loading: reportsLoading } = useReports({
    status: activeTab === 'pending' ? 'pending' : 
            activeTab === 'resolved' ? 'resolved' : null
  });

  // Reportes globales de moderadores de comunidades
  useEffect(() => {
    setLoading(true);
    
    try {
      const q = query(
        collection(db, 'global_moderation_reports'),
        orderBy('reportedAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const reportsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setGlobalReports(reportsData);
          setLoading(false);
        },
        (error) => {
          setError(error.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }, []);

  // Cargar contenido eliminado para auditoría
  const loadDeletedContent = async () => {
    try {
      setLoading(true);
      
      // Cargar posts eliminados
      const deletedPostsQuery = query(
        collection(db, 'deleted_posts'),
        orderBy('deletedAt', 'desc'),
        where('moderatorAction', '==', true) // Solo acciones de moderadores
      );
      
      const deletedPostsSnapshot = await getDocs(deletedPostsQuery);
      const postsData = deletedPostsSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'post',
        ...doc.data()
      }));
      setDeletedPosts(postsData);

      // Cargar comentarios eliminados
      const deletedCommentsQuery = query(
        collection(db, 'deleted_comments'),
        orderBy('deletedAt', 'desc'),
        where('moderatorAction', '==', true) // Solo acciones de moderadores
      );
      
      const deletedCommentsSnapshot = await getDocs(deletedCommentsQuery);
      const commentsData = deletedCommentsSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'comment',
        ...doc.data()
      }));
      setDeletedComments(commentsData);

    } catch (error) {
      console.error('Error loading deleted content:', error);
      setError('Error al cargar el contenido eliminado');
    } finally {
      setLoading(false);
    }
  };

  // Cargar contenido eliminado cuando se active la pestaña de auditoría
  useEffect(() => {
    if (activeTab === 'audit') {
      loadDeletedContent();
    }
  }, [activeTab]);

  // Combinar todos los reportes según la pestaña activa
  const getCombinedReports = () => {
    switch (activeTab) {
      case 'pending':
        return [
          ...userReports.filter(r => r.status === 'pending'),
          ...globalReports.filter(r => r.status === 'pending_review')
        ];
      case 'resolved':
        return [
          ...userReports.filter(r => r.status === 'resolved'),
          ...globalReports.filter(r => r.status === 'resolved')
        ];
      case 'global':
        return globalReports;
      case 'user_reports':
        return userReports;
      case 'audit':
        // Para auditoría, combinamos posts y comentarios eliminados
        return [...deletedPosts, ...deletedComments];
      default:
        return [];
    }
  };

  // Estadísticas actualizadas
  const stats = {
    pending: userReports.filter(r => r.status === 'pending').length + 
             globalReports.filter(r => r.status === 'pending_review').length,
    resolved: userReports.filter(r => r.status === 'resolved').length +
              globalReports.filter(r => r.status === 'resolved').length,
    global: globalReports.length,
    user_reports: userReports.length,
    audit: deletedPosts.length + deletedComments.length,
    total: userReports.length + globalReports.length + deletedPosts.length + deletedComments.length
  };

  return {
    reports: getCombinedReports(),
    loading: loading || reportsLoading,
    error,
    activeTab,
    setActiveTab,
    stats,
    refreshDeletedContent: loadDeletedContent
  };
};