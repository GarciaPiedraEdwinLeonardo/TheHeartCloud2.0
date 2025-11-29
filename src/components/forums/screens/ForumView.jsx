import { useState, useEffect } from 'react';
import { FaSpinner} from 'react-icons/fa';
import { BiSolidFoodMenu } from "react-icons/bi";
import { useForumActions } from './../hooks/useForumsActions';
import { useForumSettings } from './../hooks/useForumSettings';
import { usePostModeration } from './../hooks/usePostModeration';
import { useCommunityBans } from './../hooks/useCommunityBans';
import { useForumMembers } from './../hooks/useForumMembers';
import { auth, db } from './../../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { usePosts } from './../posts/hooks/usePosts';
import AddModeratorModal from './../modals/AddModeratorModal';
import CreatePostModal from './../posts/modals/CreatePostModal';
import ReportModal from './../modals/ReportModal';
import ForumSettingsModal from './../modals/ForumSettingsModal';
import PostValidationModal from './../modals/PostValidationModal';
import BanUserModal from './../modals/BanUserModal';
import MobileActionsModal from '../modals/MobileActionsModal';
import ManageMembersModal from '../modals/ManageMembersModal';
import ForumHeader from './../components/ForumHeader';
import WelcomeMessage from './../components/WelcomeMessage';
import ForumSidebar from './../components/ForumSidebar';
import PostList from './../posts/components/PostList';
import DeleteCommunityModal from '../modals/DeleteCommunityModal';
import { useCommunityDeletion } from './../hooks/useCommunityDeletion'

function ForumView({ forumData, onBack, onShowPost, onShowUserProfile }) {
  // Estados principales
  const [userMembership, setUserMembership] = useState({ isMember: false, role: null });
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [forumDetails, setForumDetails] = useState(forumData);
  const [pendingPostsCount, setPendingPostsCount] = useState(0);
  const [isUserBanned, setIsUserBanned] = useState(false); 
  const [showDeleteCommunityModal, setShowDeleteCommunityModal] = useState(false);
  
  // Estados de modales
  const [showAddModeratorModal, setShowAddModeratorModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Hooks
  const { joinForum, leaveForum, checkUserMembership, getForumData, isUserBannedFromForum } = useForumActions();
  const { leaveForumAsOwner } = useForumSettings();
  const { getPendingPosts, deletePost } = usePostModeration();
  const [currentPost, setCurrentPost] = useState(null);
  const { banUser } = useCommunityBans();
  const { members } = useForumMembers(forumDetails.id);
  const { posts, loading: postsLoading, error: postsError } = usePosts(forumDetails.id);
  const { deleteCommunity, loading: deleteLoading, error: deleteError } = useCommunityDeletion();
  const user = auth.currentUser;

  // Variables computadas
  const isOwner = userMembership.role === 'owner';
  const isModerator = userMembership.role === 'moderator';
  const canPost = userMembership.isMember && (userData?.role === 'doctor' || userData?.role === 'moderator' || userData?.role === 'admin') && !isUserBanned;
  const canPostWithoutApproval = (isOwner || isModerator) && !isUserBanned;
  const canReport = !!user && userMembership.role === 'member' && !isUserBanned;
  const isVerified = userData?.role !== 'unverified';
  const requiresApproval = forumDetails.membershipSettings?.requiresApproval;
  const requiresPostApproval = forumDetails.requiresPostApproval;
  const pendingRequestsCount = forumDetails.pendingMembers ? Object.keys(forumDetails.pendingMembers).length : 0;

  // Efectos
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  useEffect(() => {
    if (forumData.id) {
      loadForumDetails();
    }
  }, [forumData.id]);

  useEffect(() => {
    if (forumDetails.id && (isOwner || isModerator) && requiresPostApproval) {
      const loadPending = async () => {
        await loadPendingPostsCount();
      };
      loadPending();
    }
  }, [forumDetails.id, isOwner, isModerator, requiresPostApproval]);

  // Función para verificar si el usuario está baneado
  const checkBanStatus = async () => {
    if (user && forumDetails.id) {
      try {
        const banned = await isUserBannedFromForum(forumDetails.id, user.uid);
        setIsUserBanned(banned);
        console.log("🔍 Estado de baneo:", banned);
      } catch (error) {
        console.error("Error verificando baneo:", error);
        setIsUserBanned(false);
      }
    }
  };

  // Funciones
  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error cargando userData:', error);
    }
  };

  const loadForumDetails = async () => {
    setLoading(true);
    
    try {
      const forumResult = await getForumData(forumData.id);
      if (forumResult.success) {
        setForumDetails(forumResult.data);
        
        // Verificar si el usuario tiene solicitud pendiente
        if (user && forumResult.data.pendingMembers && forumResult.data.pendingMembers[user.uid]) {
          setHasPendingRequest(true);
        } else {
          setHasPendingRequest(false);
        }
      }
      
      const membership = await checkUserMembership(forumData.id);
      setUserMembership(membership);

      // Verificar estado de baneo después de cargar los datos del foro
      await checkBanStatus();
    } catch (error) {
      console.error('Error cargando detalles del foro:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingPostsCount = async () => {
    const pending = await getPendingPosts(forumDetails.id);
    setPendingPostsCount(pending.length);
  };

  const handleJoinLeave = async () => {
    if (!user) {
      alert('Debes iniciar sesión para unirte a comunidades');
      return;
    }

    // Verificar si está baneado antes de intentar unirse
    if (isUserBanned) {
      alert('No puedes unirte a esta comunidad porque has sido baneado');
      return;
    }

    setActionLoading(true);
    
    try {
      if (userMembership.isMember) {
        const result = await leaveForum(forumData.id);
        if (result.success) {
          setUserMembership({ isMember: false, role: null });
          await reloadForumData();
        } else {
          alert(result.error);
        }
      } else {
        const result = await joinForum(forumData.id);
        if (result.success) {
          if (result.requiresApproval) {
            alert('✅ ' + result.message);
            setHasPendingRequest(true);
            await reloadForumData();
          } else {
            setUserMembership({ isMember: true, role: 'member' });
            await reloadForumData();
          }
        } else {
          alert(result.error);
        }
      }
    } catch (error) {
      alert('Error al procesar la acción');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveAsOwner = async () => {
    if (!window.confirm('¿Estás seguro de que quieres abandonar la comunidad? Se transferirá la propiedad al moderador más antiguo.')) {
      return;
    }

    console.log("🔄 Iniciando proceso de transferencia...");

    const result = await leaveForumAsOwner(forumDetails.id);

    if (result.success) {
      console.log("✅ Transferencia exitosa:");
      console.log(" - Nuevo dueño:", result.newOwnerId);
      console.log(" - Dueño anterior:", result.previousOwnerId);

      alert('Has abandonado la comunidad. La propiedad ha sido transferida.');

       // Recargar los datos del foro para ver los cambios
      await loadForumDetails();
      onBack();
    } else {
      console.error("Error en transferencia:", result.error);
      alert(result.error);
    }
  };

  const handleDeleteContent = (content, contentType) => {
    setSelectedContent({ ...content, contentType });
    setShowDeleteModal(true);
  };

  const handleDeleteCommunity = () => {
    setShowDeleteCommunityModal(true);
  };

  const handleDeleteCommunityConfirmed = async (deleteData) => {
    console.log('🗑️ Confirmando eliminación de:', forumDetails.name);
    
    const result = await deleteCommunity(
      forumDetails.id, 
      deleteData.reason, 
      auth.currentUser?.email
    );
    
    if (result.success) {
      // SIEMPRE considerar éxito y cerrar el modal
      console.log('✅ Eliminación exitosa:', result.message);
      console.log('📊 Estadísticas:', result.stats);
      
      setShowDeleteCommunityModal(false);
      onBack(); // Navegar de regreso
      
      // Mostrar mensaje de éxito
      setTimeout(() => {
        alert(`Comunidad "${forumDetails.name}" eliminada exitosamente`);
      }, 100);
    } else {
      // Solo mostrar error si realmente falló
      alert('Error al eliminar comunidad: ' + result.error);
    }
  };


  const handleBanUser = (user) => {
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const handleShowUserProfile = (userData) => {
    console.log('👤 Mostrar perfil de usuario desde ForumView:', userData);
    if (onShowUserProfile) {
      onShowUserProfile(userData);
    }
  };

  const handleUserBanned = async () => {
    // Recargar datos del foro y verificar baneos
    await loadForumDetails();
    await checkBanStatus();
  };

  const reloadForumData = async () => {
    const forumResult = await getForumData(forumData.id);
    if (forumResult.success) {
      setForumDetails(forumResult.data);
    }
  };

  const handlePostUpdate = () => {
    loadPendingPostsCount();
  };


  // Acciones para móviles
  const mobileActions = [
    // Crear publicación
    ...(canPost ? [{
      label: 'Crear Publicación',
      icon: 'createPost',
      type: 'primary',
      onClick: () => setShowCreatePostModal(true)
    }] : []),

    // Validar publicaciones (moderadores)
    ...((isOwner || isModerator) && requiresPostApproval ? [{
      label: `Validar Publicaciones${pendingPostsCount > 0 ? ` (${pendingPostsCount})` : ''}`,
      icon: 'validatePosts',
      type: 'warning',
      onClick: () => setShowValidationModal(true)
    }] : []),

    // Gestionar moderadores (solo dueño)
    ...(isOwner && !isUserBanned ? [{
      label: 'Gestionar Moderadores',
      icon: 'manageModerators',
      type: 'primary',
      onClick: () => setShowAddModeratorModal(true)
    }] : []),

    // Configuración (solo dueño)
    ...(isOwner && !isUserBanned ? [{
      label: 'Configuración',
      icon: 'settings',
      type: 'secondary',
      onClick: () => setShowSettingsModal(true)
    }] : []),

    // Gestionar miembros (dueño/moderadores con aprobación requerida)
    ...((isOwner || isModerator) && requiresApproval && !isUserBanned ? [{
      label: `Gestionar Solicitudes${pendingRequestsCount > 0 ? ` (${pendingRequestsCount})` : ''}`,
      icon: 'manageMembers',
      type: 'warning',
      onClick: () => setShowManageMembersModal(true)
    }] : []),

    // Reportar comunidad (miembros)
    ...(canReport ? [{
      label: 'Reportar Comunidad',
      icon: 'report',
      type: 'secondary',
      onClick: () => setShowReportModal(true)
    }] : []),

    // Unirse/Abandonar
    ...(isVerified && !userMembership.isMember && !isUserBanned ? [{
      label: hasPendingRequest ? 'Solicitud Enviada' : (requiresApproval ? 'Solicitar Unirse' : 'Unirse'),
      icon: 'join',
      type: 'success',
      onClick: handleJoinLeave,
      disabled: hasPendingRequest || actionLoading
    }] : []),

    // Abandonar comunidad
    ...(userMembership.isMember && !isUserBanned ? [{
      label: isOwner ? 'Transferir y Salir' : 'Abandonar Comunidad',
      icon: 'leave',
      type: 'danger',
      onClick: isOwner ? handleLeaveAsOwner : handleJoinLeave,
      disabled: actionLoading
    }] : [])
  ].filter(action => action !== null);

  // Renderizado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando comunidad...</p>
        </div>
      </div>
    );
  }

  const handleCommentClick = (post) => {
    if (onShowPost) {
      onShowPost(post);
    }
};

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Contenido Principal */}
          <main className="lg:w-3/4">
            <ForumHeader 
              forumDetails={forumDetails}
              userMembership={userMembership}
              onBack={onBack}
            />

            {/* Mensaje de bienvenida SOLO para usuarios no miembros pero verificados */}
            {!userMembership.isMember && isVerified && !isUserBanned && (
              <WelcomeMessage 
                requiresApproval={requiresApproval}
                hasPendingRequest={hasPendingRequest}
                actionLoading={actionLoading}
                onJoinLeave={handleJoinLeave}
              />
            )}

            {/* Lista de Posts */}
            <PostList
              posts={posts}
              loading={postsLoading}
              error={postsError}
              forumId={forumDetails.id}
              forumName={forumDetails.name}
              userRole={userData?.role}
              userMembership={userMembership}
              requiresPostApproval={requiresPostApproval}
              onPostUpdate={handlePostUpdate}
              onDeleteContent={handleDeleteContent}
              onBanUser={handleBanUser}
              onCommentClick={handleCommentClick}
              onShowUserProfile={handleShowUserProfile}
              forumData={forumData}
            />
          </main>

          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <ForumSidebar 
              // Permisos
              canPost={canPost}
              canPostWithoutApproval={canPostWithoutApproval}
              isVerified={isVerified}
              canReport={canReport}
              isOwner={isOwner}
              isModerator={isModerator}
              requiresApproval={requiresApproval}
              requiresPostApproval={requiresPostApproval}
              pendingRequestsCount={pendingRequestsCount}
              pendingPostsCount={pendingPostsCount}
              // Estados
              userMembership={userMembership}
              actionLoading={actionLoading}
              hasPendingRequest={hasPendingRequest}
              forumDetails={forumDetails}
              isUserBanned={isUserBanned} // ← NUEVA PROP
              // Handlers
              onCreatePost={() => setShowCreatePostModal(true)}
              onJoinLeave={handleJoinLeave}
              onLeaveAsOwner={handleLeaveAsOwner}
              onReport={() => setShowReportModal(true)}
              onManageModerators={() => setShowAddModeratorModal(true)}
              onManageMembers={() => setShowManageMembersModal(true)}
              onSettings={() => setShowSettingsModal(true)}
              onValidatePosts={() => setShowValidationModal(true)}
              onDeleteCommunity={handleDeleteCommunity}
              userRole={userData?.role}
            />
          </aside>
        </div>
      </div>

      {/* Modales */}
      <AddModeratorModal 
        isOpen={showAddModeratorModal}
        onClose={() => setShowAddModeratorModal(false)}
        forumId={forumDetails.id}
      />

      <CreatePostModal 
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        forumId={forumDetails.id}
        forumName={forumDetails.name}
        requiresPostApproval={requiresPostApproval}
        canPostWithoutApproval={canPostWithoutApproval}
      />

      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportType="forum"
        targetId={forumDetails.id}
        targetName={forumDetails.name}
      />

      <ManageMembersModal 
        isOpen={showManageMembersModal}
        onClose={() => setShowManageMembersModal(false)}
        forumId={forumDetails.id}
      />

      <ForumSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        forum={forumDetails}
        userRole={userMembership.role}
        onSettingsUpdated={loadForumDetails}
      />

      <PostValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        forumId={forumDetails.id}
        forumName={forumDetails.name}
        onPostsValidated={loadPendingPostsCount}
      />

      <BanUserModal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        user={selectedUser}
        forumId={forumDetails.id}
        forumName={forumDetails.name}
        onUserBanned={handleUserBanned}
      />

      <MobileActionsModal
        isOpen={showMobileActions}
        onClose={() => setShowMobileActions(false)}
        actions={mobileActions}
      />

      <DeleteCommunityModal
        isOpen={showDeleteCommunityModal}
        onClose={() => setShowDeleteCommunityModal(false)}
        onDeleteConfirmed={handleDeleteCommunityConfirmed}
        communityName={forumDetails.name}
        forumId={forumDetails.id}
      />

      {/* Botón flotante para móviles */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowMobileActions(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
        >
          <BiSolidFoodMenu className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default ForumView;