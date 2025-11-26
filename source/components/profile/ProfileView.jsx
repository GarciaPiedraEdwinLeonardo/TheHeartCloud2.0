import { useState, useEffect } from 'react';
import { useUserProfile } from './hooks/useUserProfile';
import { auth } from './../../config/firebase';
import ProfileHeader from './components/ProfileHeader';
import TabNavigation from './components/TabNavigation';
import TabContent from './components/TabContent';
import StatsSidebar from './components/StatsSidebar';
import StatsModal from './components/StatsModal';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import ReportModal from '../forums/modals/ReportModal';

function ProfileView({ onShowForum, onShowMain, onShowPost, userId = null }) {
  const [activeTab, setActiveTab] = useState('publicaciones');
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Usar el hook con el userId proporcionado (si es null, usa el usuario actual)
  const { userData, loading, error, refreshProfile } = useUserProfile(userId);

  // Determinar si es el perfil propio
  const isOwnProfile = !userId || userId === auth.currentUser?.uid;

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
    console.log('🖱️ Click en comentar post:', post);
    if (onShowPost) {
      onShowPost(post);
    } else {
      console.log('Navegando al post:', post.id);
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
              />

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabContent 
                  activeTab={activeTab} 
                  userData={userData} 
                  onTopicClick={handleTopicClick}
                  onCommentClick={handleCommentClick}
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
        targetData={{
          email: userData.email,
          name: userData.name,
          role: userData.role,
          professionalInfo: userData.professionalInfo || {},
          joinDate: userData.createdAt,
          photoURL: userData.photoURL,
          stats: userData.stats || {},
          verificationStatus: userData.verificationStatus || 'unverified',
          specialty: userData.professionalInfo?.specialty || null,
          institution: userData.professionalInfo?.institution || null
        }}
      />
    </>
  );
}

export default ProfileView;