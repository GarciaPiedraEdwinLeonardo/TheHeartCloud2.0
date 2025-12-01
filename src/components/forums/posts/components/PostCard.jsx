import { useState, useEffect } from 'react';
import { 
  FaHeart, FaRegHeart, FaThumbsDown, FaRegThumbsDown, FaComment, 
  FaEllipsisH, FaUser, FaCalendar, FaEdit, FaTrash, FaBan,
  FaClock, FaCheckCircle, FaTimesCircle, FaFlag, FaUsers
} from 'react-icons/fa';
import { usePostActions } from './../hooks/usePostActions';
import { auth, db } from './../../../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import PostImages from './PostImages';
import EditPostModal from './../modals/EditPostModal';
import DeletePostModal from './../modals/DeletePostModal';
import ReportModal from '../../modals/ReportModal';

function PostCard({ 
  post, 
  onCommentClick, 
  onPostUpdated, 
  onPostDeleted, 
  onDeleteContent, 
  onBanUser,
  onShowUserProfile,
  onShowForum, // Nueva prop para navegar al foro
  userRole,
  userMembership,
  requiresPostApproval,
  forumData
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [userReaction, setUserReaction] = useState(null);
  const [authorData, setAuthorData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes || []);
  const [localDislikes, setLocalDislikes] = useState(post.dislikes || []);
  
  const { reactToPost } = usePostActions();
  const user = auth.currentUser;

  // Cargar datos del autor y usuario actual
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error cargando userData:', error);
        }
      }
    };

    const loadAuthorData = async () => {
      if (post.authorId) {
        try {
          const authorDoc = await getDoc(doc(db, 'users', post.authorId));
          if (authorDoc.exists()) {
            setAuthorData(authorDoc.data());
          }
        } catch (error) {
          console.error('Error cargando datos del autor:', error);
        }
      }
    };

    loadUserData();
    loadAuthorData();
  }, [user, post.authorId]);

  // Sincronizar estado local con props
  useEffect(() => {
    setLocalLikes(post.likes || []);
    setLocalDislikes(post.dislikes || []);
  }, [post.likes, post.dislikes]);

  // Determinar reacción del usuario actual
  useEffect(() => {
    if (!user) return;
    if (localLikes.includes(user.uid)) setUserReaction('like');
    else if (localDislikes.includes(user.uid)) setUserReaction('dislike');
    else setUserReaction(null);
  }, [user, localLikes, localDislikes]);

  const handleReaction = async (reactionType) => {
    if (!user) return;
    
    // Optimistic update - actualizar UI inmediatamente
    const previousReaction = userReaction;
    const previousLikes = [...localLikes];
    const previousDislikes = [...localDislikes];

    // Calcular nuevos estados optimistas
    let newLikes = [...localLikes];
    let newDislikes = [...localDislikes];

    if (reactionType === "like") {
      if (previousReaction === "like") {
        // Quitar like
        newLikes = newLikes.filter(id => id !== user.uid);
        setUserReaction(null);
      } else {
        // Agregar like, quitar dislike si existe
        newLikes = [...newLikes.filter(id => id !== user.uid), user.uid];
        newDislikes = newDislikes.filter(id => id !== user.uid);
        setUserReaction("like");
      }
    } else if (reactionType === "dislike") {
      if (previousReaction === "dislike") {
        // Quitar dislike
        newDislikes = newDislikes.filter(id => id !== user.uid);
        setUserReaction(null);
      } else {
        // Agregar dislike, quitar like si existe
        newDislikes = [...newDislikes.filter(id => id !== user.uid), user.uid];
        newLikes = newLikes.filter(id => id !== user.uid);
        setUserReaction("dislike");
      }
    } else if (reactionType === "remove") {
      newLikes = newLikes.filter(id => id !== user.uid);
      newDislikes = newDislikes.filter(id => id !== user.uid);
      setUserReaction(null);
    }

    // Aplicar cambios optimistas
    setLocalLikes(newLikes);
    setLocalDislikes(newDislikes);

    // Hacer la llamada real a Firebase
    const result = await reactToPost(post.id, reactionType);
    
    if (!result.success) {
      // Revertir cambios si hay error
      setLocalLikes(previousLikes);
      setLocalDislikes(previousDislikes);
      setUserReaction(previousReaction);
      console.error("Error en reacción:", result.error);
    }
  };

  // Verificar permisos para modificar - CORREGIDO
  const isAuthor = user && user.uid === post.authorId;
  const isForumModerator = user && ['owner', 'moderator'].includes(userMembership?.role);
  const isGlobalModerator = user && ['moderator', 'admin'].includes(userData?.role);
  const canModerate = isForumModerator || isGlobalModerator;
  
  // Mostrar menú si: es el autor O puede moderar
  const showOptionsMenu = isAuthor || canModerate;
  const canReport = user && !isAuthor && !canModerate;

  // Nueva función para manejar clic en perfil de usuario
  const handleAuthorClick = () => {
    if (onShowUserProfile && authorData) {
      onShowUserProfile({
        id: post.authorId,
        ...authorData
      });
    }
  };

  // Nueva función para manejar clic en la comunidad
  const handleForumClick = () => {
    if (onShowForum && forumData) {
      onShowForum(forumData);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setShowMenu(false);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
    setShowMenu(false);
  };

  const handleModeratorDelete = () => {
    setShowDeleteModal(true);
    setShowMenu(false);
  };

  const handleBanAuthor = () => {
    if (authorData && onBanUser) {
      onBanUser({
        id: post.authorId,
        ...authorData
      });
    }
    setShowMenu(false);
  };

  const handleReport = () => {
    setShowReportModal(true);
    setShowMenu(false);
  };

  const handlePostUpdated = () => {
    if (onPostUpdated) {
      onPostUpdated();
    }
    setShowEditModal(false);
  };

  const handlePostDeleted = () => {
    if (onPostDeleted) {
      onPostDeleted();
    }
    setShowDeleteModal(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return new Date(timestamp).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  // Obtener nombre completo del autor
  const getAuthorName = () => {
    if (!authorData) return 'Usuario';
    
    const { name } = authorData;
    if (name && (name.name || name.apellidopat || name.apellidomat)) {
      return `${name.name || ''} ${name.apellidopat || ''} ${name.apellidomat || ''}`.trim();
    }
    
    return authorData.email || 'Usuario';
  };

  // Obtener especialidad del autor
  const getAuthorSpecialty = () => {
    if (!authorData) return null;
    return authorData.professionalInfo?.specialty || null;
  };

  // Obtener aura del autor
  const getAuthorAura = () => {
    if (!authorData) return 0;
    return authorData.stats?.aura || 0;
  };

  // Obtener foto de perfil del autor
  const getAuthorPhoto = () => {
    if (!authorData) return null;
    return authorData.photoURL || null;
  };

  // Obtener nombre del foro
  const getForumName = () => {
    if (forumData?.name) return forumData.name;
    if (post.forumData?.name) return post.forumData.name;
    if (post.forumName) return post.forumName;
    return 'Comunidad';
  };

  // Determinar estado del post
  const getPostStatus = () => {
    if (post.status === 'pending') {
      return { label: 'Pendiente de aprobación', color: 'bg-yellow-100 text-yellow-800', icon: FaClock };
    }
    if (post.status === 'rejected') {
      return { label: 'Rechazado', color: 'bg-red-100 text-red-800', icon: FaTimesCircle };
    }
    if (post.validatedAt) {
      return { label: 'Verificado', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
    }
    return null;
  };

  const postStatus = getPostStatus();

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
        {/* Header del Post */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {/* Foto de perfil del autor - Clickable */}
            <button 
              onClick={handleAuthorClick}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1 transition duration-200 group"
            >
              {getAuthorPhoto() ? (
                <img 
                  src={getAuthorPhoto()} 
                  alt={`Foto de ${getAuthorName()}`}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 group-hover:border-blue-300 transition duration-200"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:from-blue-600 group-hover:to-purple-700 transition duration-200">
                  <FaUser className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition duration-200">
                  {getAuthorName()}
                </h3>
                {getAuthorSpecialty() && (
                  <p className="text-sm text-gray-600">{getAuthorSpecialty()}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <FaCalendar className="w-3 h-3" />
                  <span>{formatDate(post.createdAt)}</span>
                  {post.updatedAt && (
                    <>
                      <span>•</span>
                      <span className="text-gray-400">Editado</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Estado del post y menú de opciones */}
          <div className="flex items-center gap-2">
            {postStatus && (
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${postStatus.color}`}>
                <postStatus.icon className="w-3 h-3" />
                {postStatus.label}
              </span>
            )}
            
            {/* MOSTRAR MENÚ SI: es autor O puede moderar */}
            {(showOptionsMenu || canReport) && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <FaEllipsisH className="w-4 h-4 text-gray-500" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                    {/* Acciones del autor */}
                    {isAuthor && post.status !== 'rejected' && (
                      <button
                        onClick={handleEdit}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FaEdit className="w-3 h-3" />
                        Editar
                      </button>
                    )}
                    
                    {isAuthor && (
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <FaTrash className="w-3 h-3" />
                        Eliminar
                      </button>
                    )}

                    {/* Reportar (solo si no es autor y no es moderador) */}
                    {canReport && (
                      <button
                        onClick={handleReport}
                        className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                      >
                        <FaFlag className="w-3 h-3" />
                        Reportar
                      </button>
                    )}

                    {/* Separador para acciones de moderación - SOLO si puede moderar y NO es el autor */}
                    {canModerate && !isAuthor && (
                      <>
                        <div className="border-t border-gray-200 my-1"></div>
                        <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                          Moderación
                        </div>
                        <button
                          onClick={handleModeratorDelete}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <FaTrash className="w-3 h-3" />
                          Eliminar como moderador
                        </button>
                        
                        {/* Solo mostrar opción de banear si es moderador del foro (no moderador/administrador global) */}
                        {isForumModerator && !isGlobalModerator && (
                          <button
                            onClick={handleBanAuthor}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <FaBan className="w-3 h-3" />
                            Banear autor
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Información de la Comunidad */}
        {forumData && (
          <div className="mb-4">
            <button
              onClick={handleForumClick}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition duration-200 text-sm font-medium border border-blue-200"
            >
              <FaUsers className="w-3 h-3" />
              <span>{getForumName()}</span>
            </button>
          </div>
        )}

        {/* Contenido del Post */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-3 break-words">
            {post.title}
          </h2>
          <div className="text-gray-700 whitespace-pre-line break-words leading-relaxed">
            {post.content}
          </div>

          {/* Motivo de rechazo */}
          {post.status === 'rejected' && post.rejectionReason && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-1">Motivo de rechazo:</p>
              <p className="text-sm text-red-700">{post.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Imágenes */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            <PostImages images={post.images} />
          </div>
        )}

        {/* Stats y Acciones */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          {/* Estadísticas */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FaComment className="w-4 h-4" />
              <span>{post.stats?.commentCount || 0} comentarios</span>
            </div>
          </div>

          {/* Acciones - Solo mostrar si el post está activo o el usuario es moderador */}
          {(post.status === 'active' || canModerate) && (
            <div className="flex items-center gap-2">
              {/* Like */}
              <button
                onClick={() => handleReaction(userReaction === 'like' ? 'remove' : 'like')}
                disabled={post.status !== 'active'}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition duration-200 ${
                  userReaction === 'like' 
                    ? 'bg-red-50 text-red-600 border border-red-200' 
                    : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                } ${post.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {userReaction === 'like' ? (
                  <FaHeart className="w-4 h-4" />
                ) : (
                  <FaRegHeart className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{localLikes.length}</span>
              </button>

              {/* Dislike */}
              <button
                onClick={() => handleReaction(userReaction === 'dislike' ? 'remove' : 'dislike')}
                disabled={post.status !== 'active'}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition duration-200 ${
                  userReaction === 'dislike' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                } ${post.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {userReaction === 'dislike' ? (
                  <FaThumbsDown className="w-4 h-4" />
                ) : (
                  <FaRegThumbsDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{localDislikes.length}</span>
              </button>

              {/* Comentar */}
              <button
                onClick={() => {
                  if (onCommentClick) {
                    onCommentClick(post); // Pasar el objeto post completo
                  }
                }}
                disabled={post.status !== 'active'}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition duration-200 ${
                  post.status === 'active' 
                    ? 'text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <FaComment className="w-4 h-4" />
                <span className="text-sm">Comentar ({post.stats?.commentCount || 0})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <EditPostModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        post={post}
        onPostUpdated={handlePostUpdated}
      />

      <DeletePostModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        post={post}
        onPostDeleted={handlePostDeleted}
        isModeratorAction={canModerate && !isAuthor}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportType="post"
        targetId={post.id}
        targetName={post.title}
      />
    </>
  );
}

export default PostCard;