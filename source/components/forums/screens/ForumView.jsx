import { useState, useEffect } from 'react';
import { 
  FaUserPlus, 
  FaFlag, 
  FaCalendar, 
  FaUsers, 
  FaEdit, 
  FaUserShield, 
  FaSpinner, 
  FaCrown,
  FaArrowLeft,
  FaSignOutAlt,
  FaClock,
  FaInfoCircle,
  FaLock,
  FaCog,
  FaCheckCircle,
  FaMobile
} from 'react-icons/fa';
import { useForumActions } from './../hooks/useForumsActions';
import { useForumSettings } from './../hooks/useForumSettings';
import { usePostModeration } from './../hooks/usePostModeration';
import { useCommunityBans } from './../hooks/useCommunityBans';
import { useForumMembers } from './../hooks/useForumMembers';
import { auth, db } from './../../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AddModeratorModal from './../modals/AddModeratorModal';
import CreatePostModal from './../posts/modals/CreatePostModal';
import ReportModal from './../modals/ReportModal';
import ForumSettingsModal from './../modals/ForumSettingsModal';
import PostValidationModal from './../modals/PostValidationModal';
import DeleteContentModal from './../modals/DeleteContentModal';
import BanUserModal from './../modals/BanUserModal';
import MobileActionsModal from './../modals/MobileActionsModal';
import { usePosts } from './../posts/hooks/usePosts';
import PostList from './../posts/components/PostList';
import ManageMembersModal from './../modals/ManageMembersModal';

function ForumView({ forumData, onBack }) {
  // Estados principales
  const [userMembership, setUserMembership] = useState({ isMember: false, role: null });
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [forumDetails, setForumDetails] = useState(forumData);
  const [pendingPostsCount, setPendingPostsCount] = useState(0);
  
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
  const { joinForum, leaveForum, checkUserMembership, getForumData } = useForumActions();
  const { leaveForumAsOwner } = useForumSettings();
  const { getPendingPosts, deletePost } = usePostModeration();
  const { banUser } = useCommunityBans();
  const { members } = useForumMembers(forumDetails.id);
  const { posts, loading: postsLoading, error: postsError } = usePosts(forumDetails.id);
  const user = auth.currentUser;

  // Variables computadas
  const isOwner = userMembership.role === 'owner';
  const isModerator = userMembership.role === 'moderator';
  const canPost = userMembership.isMember && (userData?.role === 'doctor' || userData?.role === 'moderator' || userData?.role === 'admin');
  const canPostWithoutApproval = isOwner || isModerator;
  const canReport = !!user && userMembership.role === 'member';
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

  const handleBanUser = (user) => {
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const handleContentDeleted = () => {
    loadPendingPostsCount();
    // Aquí podrías recargar los posts si es necesario
  };

  const handleUserBanned = () => {
    // Recargar datos si es necesario
    loadForumDetails();
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
    ...(isOwner ? [{
      label: 'Gestionar Moderadores',
      icon: 'manageModerators',
      type: 'primary',
      onClick: () => setShowAddModeratorModal(true)
    }] : []),

    // Configuración (solo dueño)
    ...(isOwner ? [{
      label: 'Configuración',
      icon: 'settings',
      type: 'secondary',
      onClick: () => setShowSettingsModal(true)
    }] : []),

    // Gestionar miembros (dueño/moderadores con aprobación requerida)
    ...((isOwner || isModerator) && requiresApproval ? [{
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
    ...(isVerified && !userMembership.isMember ? [{
      label: hasPendingRequest ? 'Solicitud Enviada' : (requiresApproval ? 'Solicitar Unirse' : 'Unirse'),
      icon: 'join',
      type: 'success',
      onClick: handleJoinLeave,
      disabled: hasPendingRequest || actionLoading
    }] : []),

    // Abandonar comunidad
    ...(userMembership.isMember ? [{
      label: isOwner ? 'Transferir y Salir' : 'Abandonar Comunidad',
      icon: 'leave',
      type: 'danger',
      onClick: isOwner ? handleLeaveAsOwner : handleJoinLeave,
      disabled: actionLoading
    }] : [])
  ].filter(action => action !== null);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            <FaCrown className="w-3 h-3" />
            Dueño
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            <FaUserShield className="w-3 h-3" />
            Moderador
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('es-ES');
      }
      return new Date(timestamp).toLocaleDateString('es-ES');
    } catch (error) {
      return 'Fecha inválida';
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Contenido Principal */}
          <main className="lg:w-3/4">
            {/* Header del Foro */}
            <ForumHeader 
              forumDetails={forumDetails}
              userMembership={userMembership}
              getRoleBadge={getRoleBadge}
              formatDate={formatDate}
              onBack={onBack}
            />

            {/* Mensaje de bienvenida SOLO para usuarios no miembros pero verificados */}
            {!userMembership.isMember && isVerified && (
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
              // Handlers
              onCreatePost={() => setShowCreatePostModal(true)}
              onJoinLeave={handleJoinLeave}
              onLeaveAsOwner={handleLeaveAsOwner}
              onReport={() => setShowReportModal(true)}
              onManageModerators={() => setShowAddModeratorModal(true)}
              onManageMembers={() => setShowManageMembersModal(true)}
              onSettings={() => setShowSettingsModal(true)}
              onValidatePosts={() => setShowValidationModal(true)}
              formatDate={formatDate}
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

      <DeleteContentModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        content={selectedContent}
        contentType={selectedContent?.contentType}
        forumId={forumDetails.id}
        onContentDeleted={handleContentDeleted}
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

      {/* Botón flotante para móviles */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowMobileActions(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
        >
          <FaMobile className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

// Componente de Header
function ForumHeader({ forumDetails, userMembership, getRoleBadge, formatDate, onBack }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-green-100">
            <FaUsers className="w-6 h-6 text-green-600" />
          </div>
          <div className='min-w-0 flex-1'>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">
              {forumDetails.name}
            </h1>
            <p className="text-gray-600 text-lg break-words whitespace-normal">
              {forumDetails.description}
            </p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition duration-200"
        >
          <FaArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </button>
      </div>

      {/* Estadísticas del Foro */}
      <div className="flex flex-wrap gap-6 text-sm text-gray-500 border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2">
          <FaCalendar className="w-4 h-4" />
          <span>Creado el {formatDate(forumDetails.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaUsers className="w-4 h-4" />
          <span>{(forumDetails.memberCount || 0).toLocaleString()} miembros</span>
        </div>
        <div className="flex items-center gap-2">
          <FaEdit className="w-4 h-4" />
          <span>{(forumDetails.postCount || 0)} publicaciones</span>
        </div>
        {userMembership.role && (
          <div className="flex items-center gap-2">
            {getRoleBadge(userMembership.role)}
          </div>
        )}
        {forumDetails.requiresPostApproval && (
          <div className="flex items-center gap-2">
            <FaCheckCircle className="w-4 h-4 text-blue-500" />
            <span>Validación de posts activa</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de Mensaje de Bienvenida
function WelcomeMessage({ requiresApproval, hasPendingRequest, actionLoading, onJoinLeave }) {
  if (hasPendingRequest) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 text-center">
        <div className="text-gray-400 mb-4">
          <FaUsers className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Solicitud Enviada
        </h3>
        <p className="text-gray-600 mb-4">
          Tu solicitud para unirte a esta comunidad está en revisión. 
          Un moderador la aprobará pronto.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 inline-flex items-center gap-2">
          <FaClock className="w-4 h-4 text-blue-600" />
          <span className="text-blue-700 text-sm">Esperando aprobación</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 text-center">
      <div className="text-gray-400 mb-4">
        <FaUsers className="w-12 h-12 mx-auto" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {requiresApproval ? 'Solicitar Unirse a la Comunidad' : 'Unirse a la Comunidad'}
      </h3>
      <p className="text-gray-600 mb-4">
        {requiresApproval 
          ? 'Envía una solicitud para unirte a esta comunidad. Un moderador la revisará pronto.'
          : 'Únete para poder interactuar y publicar contenido.'
        }
      </p>
      <button
        onClick={onJoinLeave}
        disabled={actionLoading}
        className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition duration-200 font-medium flex items-center gap-2 mx-auto disabled:opacity-50"
      >
        {actionLoading ? (
          <FaSpinner className="w-4 h-4 animate-spin" />
        ) : (
          <FaUserPlus className="w-4 h-4" />
        )}
        {actionLoading ? 'Procesando...' : (
          requiresApproval ? 'Solicitar Unirse' : 'Unirse a la Comunidad'
        )}
      </button>
    </div>
  );
}

// Componente de Sidebar
function ForumSidebar({ 
  canPost, canPostWithoutApproval, isVerified, canReport, isOwner, isModerator, 
  requiresApproval, requiresPostApproval, pendingRequestsCount, pendingPostsCount,
  userMembership, actionLoading, hasPendingRequest, forumDetails,
  onCreatePost, onJoinLeave, onLeaveAsOwner, onReport, onManageModerators, 
  onManageMembers, onSettings, onValidatePosts, formatDate 
}) {
  return (
    <div className="sticky top-24 space-y-4">
      {/* Acciones del Foro */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Acciones</h3>
        <div className="space-y-3">
          
          {/* Crear Publicación */}
          {canPost && (
            <button
              onClick={onCreatePost}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <FaEdit className="w-4 h-4" />
              Crear Publicación
              {requiresPostApproval && !canPostWithoutApproval && (
                <span className="text-xs bg-blue-800 px-2 py-1 rounded-full">Requiere aprobación</span>
              )}
            </button>
          )}

          {/* Validar Publicaciones */}
          {(isOwner || isModerator) && requiresPostApproval && (
            <button
              onClick={onValidatePosts}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <FaCheckCircle className="w-4 h-4" />
              Validar Publicaciones
              {pendingPostsCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {pendingPostsCount}
                </span>
              )}
            </button>
          )}

          {/* Unirse/Solicitar Unirse/Abandonar */}
          {isVerified && !userMembership.isMember && (
            hasPendingRequest ? (
              <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium">
                <FaClock className="w-4 h-4" />
                Solicitud Enviada
              </div>
            ) : (
              <button
                onClick={onJoinLeave}
                disabled={actionLoading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
              >
                {actionLoading ? (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <FaUserPlus className="w-4 h-4" />
                )}
                {actionLoading ? 'Procesando...' : (
                  requiresApproval ? 'Solicitar Unirse' : 'Unirse a la Comunidad'
                )}
              </button>
            )
          )}

          {/* Abandonar Comunidad */}
          {userMembership.isMember && (
            <button
              onClick={isOwner ? onLeaveAsOwner : onJoinLeave}
              disabled={actionLoading}
              className="w-full bg-red-100 text-red-700 py-3 px-4 rounded-lg hover:bg-red-200 transition duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
            >
              <FaSignOutAlt className="w-4 h-4" />
              {actionLoading ? 'Procesando...' : (
                isOwner ? 'Transferir y Salir' : 'Abandonar Comunidad'
              )}
            </button>
          )}

          {/* Reportar Comunidad */}
          {canReport && (
            <button
              onClick={onReport}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <FaFlag className="w-4 h-4" />
              Reportar Comunidad
            </button>
          )}

          {/* Gestionar Moderadores */}
          {isOwner && (
            <button
              onClick={onManageModerators}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <FaUserShield className="w-4 h-4" />
              Gestionar Moderadores
            </button>
          )}

          {/* Configuración */}
          {isOwner && (
            <button
              onClick={onSettings}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <FaCog className="w-4 h-4" />
              Configuración
            </button>
          )}

          {/* Gestionar Solicitudes */}
          {(isOwner || isModerator) && requiresApproval && (
            <button
              onClick={onManageMembers}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <FaUsers className="w-4 h-4" />
              Gestionar Solicitudes
              {pendingRequestsCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          )}

          {/* Información para moderadores */}
          {(isOwner || isModerator) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-800 mb-1">
                <FaInfoCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Eres moderador</span>
              </div>
              <p className="text-xs text-blue-700">
                Tienes acceso a herramientas de moderación avanzadas.
                {requiresPostApproval && ' Puedes publicar sin validación.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Información del Foro */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Sobre esta comunidad</h3>
        
        <div className="space-y-3 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <FaCalendar className="w-4 h-4 text-gray-400" />
            <span>Creado el {formatDate(forumDetails.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaUsers className="w-4 h-4 text-gray-400" />
            <span>{(forumDetails.memberCount || 0).toLocaleString()} miembros</span>
          </div>
          <div className="flex items-center gap-2">
            <FaEdit className="w-4 h-4 text-gray-400" />
            <span>{(forumDetails.postCount || 0)} publicaciones</span>
          </div>
          {requiresApproval && (
            <div className="flex items-center gap-2">
              <FaLock className="w-4 h-4 text-orange-400" />
              <span>Requiere aprobación para unirse</span>
            </div>
          )}
          {requiresPostApproval && (
            <div className="flex items-center gap-2">
              <FaCheckCircle className="w-4 h-4 text-blue-400" />
              <span>Validación de posts activa</span>
            </div>
          )}
          {forumDetails.isPublic === false && (
            <div className="flex items-center gap-2">
              <FaLock className="w-4 h-4 text-red-400" />
              <span>Comunidad privada</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Reglas de la comunidad</h4>
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200 break-words whitespace-pre-line">
            {forumDetails.rules ? (
              <div className="break-words whitespace-pre-line">
                {forumDetails.rules}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                • Respeto hacia todos los miembros<br/>
                • Contenido médico verificado<br/>
                • No spam ni autopromoción<br/>
                • Confidencialidad de pacientes<br/>
                • Lenguaje profesional
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForumView;