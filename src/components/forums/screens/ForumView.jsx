import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { BiSolidFoodMenu } from "react-icons/bi";
import { useForumActions } from './../hooks/useForumsActions';
import { useForumSettings } from './../hooks/useForumSettings';
import { usePostModeration } from './../hooks/usePostModeration';
import { auth, db } from './../../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { usePosts } from './../posts/hooks/usePosts';
import AddModeratorModal from './../modals/AddModeratorModal';
import CreatePostModal from './../posts/modals/CreatePostModal';
import ReportModal from './../modals/ReportModal';
import ForumSettingsModal from './../modals/ForumSettingsModal';
import PostValidationModal from './../modals/PostValidationModal';
import BanUserModal from './../modals/BanUserModal';
import MobileCommunityModal from '../modals/MobileCommunityModal';
import ManageMembersModal from '../modals/ManageMembersModal';
import ForumHeader from './../components/ForumHeader';
import WelcomeMessage from './../components/WelcomeMessage';
import ForumSidebar from './../components/ForumSidebar';
import PostList from './../posts/components/PostList';
import LeaveAsOwnerModal from '../modals/LeaveAsOwnerModal';
import DeleteCommunityModal from '../modals/DeleteCommunityModal';
import { useCommunityDeletion } from './../hooks/useCommunityDeletion'
import { toast } from 'react-hot-toast';

function ForumView({ onShowPost, onShowUserProfile }) {
  // HOOKS DE ROUTER
  const { forumId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Intentar obtener forumData del state (navegación interna)
  const stateForumData = location.state?.forumData;
  
  // Estados principales
  const [userMembership, setUserMembership] = useState({ isMember: false, role: null });
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [forumDetails, setForumDetails] = useState(stateForumData || null);
  const [pendingPostsCount, setPendingPostsCount] = useState(0);
  const [isUserBanned, setIsUserBanned] = useState(false); 
  const [showDeleteCommunityModal, setShowDeleteCommunityModal] = useState(false);
  
  // Estados de modales
  const [showAddModeratorModal, setShowAddModeratorModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLeaveAsOwnerModal, setShowLeaveAsOwnerModal] = useState(false);
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
  const { getPendingPosts } = usePostModeration();
  const { posts, loading: postsLoading, error: postsError } = usePosts(forumId);
  const { deleteCommunity } = useCommunityDeletion();
  const user = auth.currentUser;

  // Variables computadas
  const isOwner = userMembership.role === 'owner';
  const isModerator = userMembership.role === 'moderator';
  const canPost = userMembership.isMember && (userData?.role === 'doctor' || userData?.role === 'moderator' || userData?.role === 'admin') && !isUserBanned;
  const canPostWithoutApproval = (isOwner || isModerator) && !isUserBanned;
  const canReport = !!user && userMembership.role === 'member' && !isUserBanned;
  const isVerified = userData?.role !== 'unverified';
  const requiresApproval = forumDetails?.membershipSettings?.requiresApproval;
  const requiresPostApproval = forumDetails?.requiresPostApproval;
  const pendingRequestsCount = forumDetails?.pendingMembers ? Object.keys(forumDetails.pendingMembers).length : 0;

  // Efecto para cargar datos del foro
  useEffect(() => {
    if (!forumId) {
      navigate('/home');
      return;
    }

    const initializeForum = async () => {
      setLoading(true);
      
      // Si tenemos data del state, usarla
      if (stateForumData) {
        setForumDetails(stateForumData);
      }
      
      // Siempre cargar user data y verificar membresía
      if (user) {
        await loadUserData();
        
        // Si NO tenemos forumData del state, cargar de Firebase
        if (!stateForumData) {
          await loadForumDetails();
        } else {
          // Si tenemos forumData, solo verificar membresía y baneo
          const isBanned = await checkBanStatus(forumId, user.uid);
          const membership = await checkUserMembership(forumId);
          
          if (isBanned) {
            setUserMembership({ isMember: false, role: null });
          } else {
            setUserMembership(membership);
          }
          
          // Verificar solicitud pendiente
          if (stateForumData.pendingMembers && stateForumData.pendingMembers[user.uid]) {
            setHasPendingRequest(true);
          }
        }
      } else {
        // Si no hay usuario, solo cargar forumData si no existe
        if (!stateForumData) {
          const forumResult = await getForumData(forumId);
          if (forumResult.success) {
            setForumDetails(forumResult.data);
          }
        }
      }
      
      setLoading(false);
    };

    initializeForum();
  }, [forumId]);

  // Efecto para reiniciar estados al cambiar de foro
  useEffect(() => {
    setIsUserBanned(false);
    setUserMembership({ isMember: false, role: null });
    setHasPendingRequest(false);
    setPendingPostsCount(0);
  }, [forumId]);

  // Cargar posts pendientes si es moderador
  useEffect(() => {
    if (forumDetails?.id && (isOwner || isModerator) && requiresPostApproval) {
      loadPendingPostsCount();
    }
  }, [forumDetails?.id, isOwner, isModerator, requiresPostApproval]);

  // Función para verificar si el usuario está baneado
  const checkBanStatus = async (forumId, userId) => {
    if (!forumId || !userId) {
      return false;
    }

    try {
      const banned = await isUserBannedFromForum(forumId, userId);
      setIsUserBanned(banned);
      return banned;
    } catch (error) {
      console.error("Error verificando baneo:", error);
      setIsUserBanned(false);
      return false;
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
    try {
      // Cargar detalles del foro
      const forumResult = await getForumData(forumId);
      
      if (!forumResult.success) {
        // Si el foro no existe o hay error, NO mostrar toast aquí
        // El componente ya mostrará la pantalla de error
        console.warn('⚠️ Comunidad no encontrada:', forumId);
        setForumDetails(null);
        setLoading(false);
        return;
      }
      
      setForumDetails(forumResult.data);
      
      // Solo continuar si hay usuario autenticado
      if (user) {
        // Verificar solicitud pendiente
        if (forumResult.data.pendingMembers && forumResult.data.pendingMembers[user.uid]) {
          setHasPendingRequest(true);
        } else {
          setHasPendingRequest(false);
        }
        
        // Verificar estado de baneo primero
        const isBanned = await checkBanStatus(forumId, user.uid);
        
        // Verificar membresía
        const membership = await checkUserMembership(forumId);
        
        // Si está baneado, forzar que no sea miembro
        if (isBanned) {
          setUserMembership({ isMember: false, role: null });
        } else {
          setUserMembership(membership);
        }
      }

    } catch (error) {
      // Solo loguear errores críticos, no 404s
      if (error.response?.status !== 404) {
        console.error('Error crítico cargando foro:', error);
      }
      setForumDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingPostsCount = async () => {
    const pending = await getPendingPosts(forumId);
    setPendingPostsCount(pending.length);
  };

  const handleJoinLeave = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para unirte a comunidades');
      return;
    }

    // Re-verificar baneo antes de intentar unirse
    const currentBanStatus = await checkBanStatus(forumId, user.uid);
    if (currentBanStatus) {
      toast.error('No puedes unirte a esta comunidad porque has sido baneado');
      return;
    }

    setActionLoading(true);
    
    try {
      if (userMembership.isMember) {
        const result = await leaveForum(forumId);
        if (result.success) {
          setUserMembership({ isMember: false, role: null });
          await reloadForumData();
          toast.success('Has abandonado la comunidad');
        } else {
          toast.error("Algo salió mal, intenta de nuevo más tarde");
          console.error(result.error);
        }
      } else {
        const result = await joinForum(forumId);
        if (result.success) {
          if (result.requiresApproval) {
            toast.success(result.message);
            setHasPendingRequest(true);
            await reloadForumData();
          } else {
            setUserMembership({ isMember: true, role: 'member' });
            await reloadForumData();
            toast.success('Te has unido a la comunidad');
          }
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      toast.error('Error al procesar la acción');
      console.error('Error al unirse:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveAsOwner = async () => {
    setShowLeaveAsOwnerModal(true);
  };

  const handleConfirmLeaveAsOwner = async () => {
    const result = await leaveForumAsOwner(forumId);

    if (result.success) {
      toast.success('Has abandonado la comunidad. La propiedad ha sido transferida.');
      setShowLeaveAsOwnerModal(false);
      navigate('/home');
    } else {
      console.error("Error en transferencia:", result.error);
      toast.error(result.error);
    }
  };

  const handleDeleteContent = (content, contentType) => {
    setSelectedContent({ ...content, contentType });
    setShowDeleteModal(true);
  };

  const handleDeleteCommunity = () => {
    setShowDeleteCommunityModal(true);
  };

  const handleDeleteCommunityConfirmed = () => {
      setShowDeleteCommunityModal(false);
      navigate('/home', { replace: true });
  };

  const handleBanUser = (user) => {
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const handleShowUserProfile = (userData) => {
    if (onShowUserProfile) {
      onShowUserProfile(userData);
    }
  };

  const handleUserBanned = async () => {
    try {
      setShowBanModal(false);
      setSelectedUser(null);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await loadForumDetails();
      
      toast.success('Usuario baneado exitosamente');
    } catch (error) {
      console.error("Error en recarga después de baneo:", error);
      toast.error('Error actualizando la vista');
    }
  };

  const reloadForumData = async () => {
    const forumResult = await getForumData(forumId);
    if (forumResult.success) {
      setForumDetails(forumResult.data);
    }
  };

  const handlePostUpdate = () => {
    loadPendingPostsCount();
  };

  // Acciones para móviles
  const mobileActions = [
    ...(canPost ? [{
      label: 'Crear Publicación',
      icon: 'createPost',
      type: 'primary',
      onClick: () => setShowCreatePostModal(true)
    }] : []),

    ...((isOwner || isModerator) && requiresPostApproval ? [{
      label: `Validar Publicaciones${pendingPostsCount > 0 ? ` (${pendingPostsCount})` : ''}`,
      icon: 'validatePosts',
      type: 'warning',
      onClick: () => setShowValidationModal(true)
    }] : []),

    ...(isOwner && !isUserBanned ? [{
      label: 'Gestionar Moderadores',
      icon: 'manageModerators',
      type: 'primary',
      onClick: () => setShowAddModeratorModal(true)
    }] : []),

    ...(isOwner && !isUserBanned ? [{
      label: 'Configuración',
      icon: 'settings',
      type: 'secondary',
      onClick: () => setShowSettingsModal(true)
    }] : []),

    ...((isOwner || isModerator) && requiresApproval && !isUserBanned ? [{
      label: `Gestionar Solicitudes${pendingRequestsCount > 0 ? ` (${pendingRequestsCount})` : ''}`,
      icon: 'manageMembers',
      type: 'warning',
      onClick: () => setShowManageMembersModal(true)
    }] : []),

    ...(canReport ? [{
      label: 'Reportar Comunidad',
      icon: 'report',
      type: 'secondary',
      onClick: () => setShowReportModal(true)
    }] : []),

    ...(isVerified && !userMembership.isMember && !isUserBanned ? [{
      label: hasPendingRequest ? 'Solicitud Enviada' : (requiresApproval ? 'Solicitar Unirse' : 'Unirse'),
      icon: 'join',
      type: 'success',
      onClick: handleJoinLeave,
      disabled: hasPendingRequest || actionLoading
    }] : []),

    ...(userMembership.isMember && !isUserBanned ? [{
      label: isOwner ? 'Transferir y Salir' : 'Abandonar Comunidad',
      icon: 'leave',
      type: 'danger',
      onClick: isOwner ? handleLeaveAsOwner : handleJoinLeave,
      disabled: actionLoading
    }] : [])
  ].filter(action => action !== null);

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

  if (!forumDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSpinner className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Comunidad no encontrada
            </h2>
            <p className="text-gray-600 mb-6">
              La comunidad que buscas no existe o ha sido eliminada.
            </p>
          </div>
          <button
            onClick={() => navigate('/home')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
          >
            Volver al inicio
          </button>
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
              onBack={() => navigate(-1)}
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
              forumId={forumId}
              forumName={forumDetails.name}
              userRole={userData?.role}
              userMembership={userMembership}
              requiresPostApproval={requiresPostApproval}
              onPostUpdate={handlePostUpdate}
              onDeleteContent={handleDeleteContent}
              onBanUser={handleBanUser}
              onCommentClick={handleCommentClick}
              onShowUserProfile={handleShowUserProfile}
              forumData={forumDetails}
            />
          </main>

          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <ForumSidebar 
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
              userMembership={userMembership}
              actionLoading={actionLoading}
              hasPendingRequest={hasPendingRequest}
              forumDetails={forumDetails}
              isUserBanned={isUserBanned}
              onCreatePost={() => setShowCreatePostModal(true)}
              onJoinLeave={handleJoinLeave}
              onLeaveAsOwner={() => setShowLeaveAsOwnerModal(true)}
              onReport={() => setShowReportModal(true)}
              onManageModerators={() => setShowAddModeratorModal(true)}
              onManageMembers={() => setShowManageMembersModal(true)}
              onSettings={() => setShowSettingsModal(true)}
              onValidatePosts={() => setShowValidationModal(true)}
              onDeleteCommunity={handleDeleteCommunity}
              userRole={userData?.role}
              onOpenMobileActions={() => setShowMobileActions}
            />
          </aside>
        </div>
      </div>

      {/* Modales */}
      <AddModeratorModal 
        isOpen={showAddModeratorModal}
        onClose={() => setShowAddModeratorModal(false)}
        forumId={forumId}
      />

      <CreatePostModal 
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        forumId={forumId}
        forumName={forumDetails.name}
        requiresPostApproval={requiresPostApproval}
        canPostWithoutApproval={canPostWithoutApproval}
      />

      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportType="forum"
        targetId={forumId}
        targetName={forumDetails.name}
      />

      <ManageMembersModal 
        isOpen={showManageMembersModal}
        onClose={() => setShowManageMembersModal(false)}
        forumId={forumId}
        onMembersUpdated={reloadForumData}
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
        forumId={forumId}
        forumName={forumDetails.name}
        onPostsValidated={loadPendingPostsCount}
      />

      <BanUserModal
        isOpen={showBanModal}
        onClose={() => {
          setShowBanModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        forumId={forumId}
        forumName={forumDetails.name}
        onUserBanned={handleUserBanned}
      />

      <MobileCommunityModal
        isOpen={showMobileActions}
        onClose={() => setShowMobileActions(false)}
        actions={mobileActions}
        forumDetails={forumDetails}
        userMembership={userMembership}
        isUserBanned={isUserBanned}
      />

      <DeleteCommunityModal
        isOpen={showDeleteCommunityModal}
        onClose={() => setShowDeleteCommunityModal(false)}
        onDeleteConfirmed={handleDeleteCommunityConfirmed}
        communityName={forumDetails.name}
        forumId={forumId}
      />

      <LeaveAsOwnerModal
        isOpen={showLeaveAsOwnerModal}
        onClose={() => setShowLeaveAsOwnerModal(false)}
        onConfirm={handleConfirmLeaveAsOwner}
        communityName={forumDetails.name}
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