import { useState, useEffect } from 'react';
import { useUserProfile } from './hooks/useUserProfile';
import { auth, db } from './../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ProfileHeader from './components/ProfileHeader';
import TabNavigation from './components/TabNavigation';
import TabContent from './components/TabContent';
import StatsSidebar from './components/StatsSidebar';
import StatsModal from './components/StatsModal';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import ReportModal from '../forums/modals/ReportModal';
import SuspendUserModal from './components/SuspendedUserModal';
import { useUserSuspension } from '../suspend/hooks/useUserSuspension';
import { toast } from 'react-hot-toast';

function ProfileView({ onShowForum, onShowMain, onShowPost, userId = null }) {
  const [activeTab, setActiveTab] = useState('publicaciones');
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  
  // Usar el hook con el userId proporcionado (si es null, usa el usuario actual)
  const { userData, loading, error, refreshProfile } = useUserProfile(userId);
  const { suspendUser, loading: suspendLoading, error: suspendError } = useUserSuspension();

  // Determinar si es el perfil propio
  const isOwnProfile = !userId || userId === auth.currentUser?.uid;

  // Cargar el rol del usuario actual (admin/moderador)
  useEffect(() => {
    const loadCurrentUserRole = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUserRole(userData.role);
          }
        } catch (error) {
          console.error('Error cargando rol del usuario actual:', error);
          toast.error('Error al cargar información del usuario');
        }
      }
    };

    loadCurrentUserRole();
  }, []);

  // Mostrar errores de suspensión con toast
  useEffect(() => {
    if (suspendError) {
      toast.error(`Error al suspender usuario: ${suspendError}`);
    }
  }, [suspendError]);

  const handleTopicClick = (topic) => {
    if (onShowForum && topic.id) {
      onShowForum({
        id: topic.id,
        name: topic.nombre,
        description: topic.description
      });
    }
  };

  const handleReportClick = () => {
    setShowReportModal(true);
  }

  const handleCommentClick = (post) => {
    if (onShowPost) {
      onShowPost(post);
    } else {
      if (post.forumId && onShowForum) {
        onShowForum({ id: post.forumId });
      }
    }
  };

  const handleHomeClick = () => {
    if (onShowMain) {
      onShowMain();
    }
  };

  const handleSuspendUser = () => {
    setShowSuspendModal(true);
  };

  const handleSuspendConfirmed = async (suspendData) => {
    
    if (!userId && !userData?.id) {
      toast.error('Error: No se pudo identificar al usuario a suspender');
      return;
    }

    const targetUserId = userId || userData.id;
    
    // Mostrar toast de carga
    const loadingToast = toast.loading('Suspendiendo usuario...');
    
    const result = await suspendUser(
      targetUserId, 
      suspendData.reason, 
      suspendData.duration, 
      auth.currentUser.email
    );
    
    // Cerrar toast de carga
    toast.dismiss(loadingToast);
    
    if (result.success) {
      // Mostrar mensaje de éxito
      toast.success(`Usuario ${userData.nombreCompleto} suspendido exitosamente por ${suspendData.duration} días`);
      
      // Cerrar modal
      setShowSuspendModal(false);
      
      // Recargar datos del perfil
      refreshProfile();
      
    } else {
      console.error('❌ Error en suspensión:', result.error);
      toast.error('Error al suspender usuario: ' + result.error);
    }
  };

  // Si no hay usuario autenticado Y es perfil propio
  if (!auth.currentUser && isOwnProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          type="info"
          message="Debes iniciar sesión para ver tu perfil"
          showHomeButton={true}
          onHomeClick={handleHomeClick}
        />
      </div>
    );
  }

  // Si es perfil de otro usuario y no está autenticado
  if (!auth.currentUser && !isOwnProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          type="info"
          message="Debes iniciar sesión para ver perfiles de otros usuarios"
          showHomeButton={true}
          onHomeClick={handleHomeClick}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Cargando perfil..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          message={error}
          onRetry={refreshProfile}
          showHomeButton={true}
          onHomeClick={handleHomeClick}
        />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          type="info"
          message="No se pudo cargar la información del perfil"
          showHomeButton={true}
          onHomeClick={handleHomeClick}
          onRetry={refreshProfile}
        />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            
            {/* Contenido Principal */}
            <main className="lg:w-3/4">
              <ProfileHeader 
                userData={userData} 
                onShowStats={() => setShowStatsModal(true)}
                isOwnProfile={isOwnProfile}
                onReportProfile={handleReportClick}
                onSuspendUser={handleSuspendUser}
                userRole={currentUserRole}
              />

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabContent 
                  activeTab={activeTab} 
                  userData={userData} 
                  onTopicClick={handleTopicClick}
                  onCommentClick={handleCommentClick}
                  onShowForum={onShowForum}
                />
              </div>
            </main>

            {/* Sidebar - Solo desktop */}
            <aside className="hidden lg:block lg:w-1/4">
              <div className="sticky top-24">
                <StatsSidebar estadisticas={userData.estadisticas} />
              </div>
            </aside>

          </div>
        </div>

        {/* Modal de Estadísticas - Solo móvil */}
        <StatsModal 
          isOpen={showStatsModal}
          onClose={() => setShowStatsModal(false)}
          estadisticas={userData.estadisticas}
        />
      </div>

      {/* Modal de Reportar Perfil */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportType="profile"
        targetId={userId || userData.id}
        targetName={userData.nombreCompleto || 'Usuario'}
      />

      {/* Modal de Suspender Usuario */}
      <SuspendUserModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onSuspendConfirmed={handleSuspendConfirmed}
        userName={userData.nombreCompleto}
        userId={userId || userData.id}
        currentUserEmail={auth.currentUser?.email}
        loading={suspendLoading}
      />
    </>
  );
}

export default ProfileView;