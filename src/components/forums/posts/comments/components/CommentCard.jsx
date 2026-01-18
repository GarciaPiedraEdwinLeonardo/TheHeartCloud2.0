import { useState, useEffect, useRef } from 'react'; 
import { 
  FaHeart, 
  FaRegHeart, 
  FaReply, 
  FaEllipsisH, 
  FaUser, 
  FaCalendar,
  FaEdit, 
  FaTrash, 
  FaBan,
  FaSpinner,
  FaFlag,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from './../../../../../config/firebase';
import { useCommentActions } from './../hooks/useCommentActions';
import { useCommentLikes } from './../hooks/useCommentLikes';
import EditCommentModal from './../modals/EditCommentModal';
import DeleteCommentModal from './../modals/DeleteCommentModal';
import CreateCommentModal from './../modals/CreateCommentModal';
import ReportModal from './../../../modals/ReportModal';
import BanUserModal from './../../../modals/BanUserModal';

function CommentCard({ 
  comment, 
  postId, 
  userData, 
  onCommentCreated, 
  isReply = false, 
  forumData,
  onShowUserProfile,
  depth = 0 // Nuevo: recibir la profundidad actual
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [authorData, setAuthorData] = useState(null);
  const [forumDetails, setForumDetails] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const contentRef = useRef(null);
  
  const { likeComment } = useCommentActions();
  const { likeCount, userLiked, loading: likesLoading } = useCommentLikes(comment.id);
  const user = auth.currentUser;

  //Constante para el límite máximo de profundidad
  const MAX_DEPTH = 8;

  useEffect(() => {
    loadAuthorData();
    loadForumDetails();
  }, [comment.authorId, forumData]);

  useEffect(() => {
    // Verificar si el contenido es muy largo
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      const lineHeight = parseInt(getComputedStyle(contentRef.current).lineHeight);
      const maxLines = 6;
      const maxHeight = lineHeight * maxLines;
      
      setNeedsExpansion(contentHeight > maxHeight);
    }
  }, [comment.content]);

  const loadAuthorData = async () => {
    try {
      const authorDoc = await getDoc(doc(db, 'users', comment.authorId));
      if (authorDoc.exists()) {
        setAuthorData(authorDoc.data());
      }
    } catch (error) {
      console.error('Error cargando datos del autor:', error);
    }
  };

  const loadForumDetails = async () => {
    if (forumData) {
      setForumDetails(forumData);
    } else if (postId) {
      try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          const postData = postDoc.data();
          const forumDoc = await getDoc(doc(db, 'forums', postData.forumId));
          if (forumDoc.exists()) {
            setForumDetails({ id: forumDoc.id, ...forumDoc.data() });
          }
        }
      } catch (error) {
        console.error('Error cargando datos del foro:', error);
      }
    }
  };

  const handleAuthorClick = () => {
    if (onShowUserProfile && authorData) {
      onShowUserProfile({
        id: comment.authorId,
        ...authorData
      });
    }
  };

  const handleLike = async () => {
    if (!user) return;
    
    setActionLoading(true);
    const result = await likeComment(comment.id);
    setActionLoading(false);
    
    if (!result.success) {
      console.error("Error en like:", result.error);
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

  const handleReply = () => {
    setShowReplyModal(true);
    setShowMenu(false);
  };

  const handleBanAuthor = () => {
    if (authorData) {
      setShowBanModal(true);
      setShowMenu(false);
    }
  };

  const handleReport = () => {
    setShowReportModal(true);
    setShowMenu(false);
  };

  const handleCommentUpdated = () => {
    setShowEditModal(false);
  };

  const handleCommentDeleted = () => {
    setShowDeleteModal(false);
  };

  const handleReplyCreated = () => {
    setShowReplyModal(false);
    if (onCommentCreated) {
      onCommentCreated();
    }
  };

  const handleUserBanned = () => {
    setShowBanModal(false);
  };

  const toggleContent = () => {
    setShowFullContent(!showFullContent);
  };

  // Verificar permisos
  const isAuthor = user && user.uid === comment.authorId;
  const isGlobalModerator = userData && ['moderator', 'admin'].includes(userData?.role);
  
  const isForumModerator = forumDetails && forumDetails.moderators && forumDetails.moderators[user?.uid];
  const isForumOwner = forumDetails && forumDetails.ownerId === user?.uid;
  
  const canModerate = isGlobalModerator || isForumModerator || isForumOwner;
  
  //canReply ahora considera el límite de profundidad
  const canReply = userData && 
                   ['doctor', 'moderator', 'admin'].includes(userData?.role) && 
                   depth < MAX_DEPTH;
  
  const canReport = user && !isAuthor && !canModerate;

  const showMenuButton = user && (isAuthor || canModerate || canReport);

  const getAuthorName = () => {
    if (!authorData) return 'Usuario';
    
    const { name } = authorData;
    if (name && (name.name || name.apellidopat || name.apellidomat)) {
      return `${name.name || ''} ${name.apellidopat || ''} ${name.apellidomat || ''}`.trim();
    }
    
    return authorData.email || 'Usuario';
  };

  const getAuthorSpecialty = () => {
    if (!authorData) return null;
    return authorData.professionalInfo?.specialty || null;
  };

  const getAuthorPhoto = () => {
    if (!authorData) return null;
    return authorData.photoURL || null;
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

  const renderFormattedContent = (content) => {
    if (!content) return '';
    
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  return (
    <>
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${isReply ? 'bg-gray-50' : ''}`}>
        {/* Header del Comentario - Compacto y Responsivo */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button 
              onClick={handleAuthorClick}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 transition duration-200 group min-w-0 flex-1"
            >
              {getAuthorPhoto() ? (
                <img 
                  src={getAuthorPhoto()} 
                  alt={`Foto de ${getAuthorName()}`}
                  className="w-6 h-6 rounded-full object-cover border border-gray-200 group-hover:border-blue-300 transition duration-200 flex-shrink-0"
                />
              ) : (
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:from-blue-600 group-hover:to-purple-700 transition duration-200 flex-shrink-0">
                  <FaUser className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="text-left min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-medium text-gray-700 text-xs group-hover:text-blue-600 transition duration-200 truncate">
                    {getAuthorName()}
                  </span>
                  {/* Especialidad - oculta en móviles */}
                  {getAuthorSpecialty() && (
                    <span className="hidden sm:inline text-[10px] text-gray-400 flex-shrink-0">
                      • {getAuthorSpecialty()}
                    </span>
                  )}
                  {/* Fecha - oculta en móviles */}
                  <span className="hidden sm:inline text-[10px] text-gray-400 flex-shrink-0">
                    • {formatDate(comment.updatedAt || comment.createdAt)}
                  </span>
                  {/* Editado - oculta en móviles */}
                  {comment.updatedAt && (
                    <span className="hidden sm:inline text-[10px] text-gray-400 italic flex-shrink-0">
                      (editado)
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>

          {showMenuButton && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded transition duration-200"
              >
                <FaEllipsisH className="w-4 h-4 text-gray-500" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                  {isAuthor && (
                    <>
                      <button
                        onClick={handleEdit}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FaEdit className="w-3 h-3" />
                        Editar
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <FaTrash className="w-3 h-3" />
                        Eliminar
                      </button>
                    </>
                  )}

                  {canReport && (
                    <button
                      onClick={handleReport}
                      className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                    >
                      <FaFlag className="w-3 h-3" />
                      Reportar
                    </button>
                  )}

                  {canModerate && !isAuthor && (
                    <>
                      <div className="border-t border-gray-200 my-1"></div>
                      <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                        Moderación
                      </div>
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <FaTrash className="w-3 h-3" />
                        Eliminar Comentario
                      </button>
                      <button
                        onClick={handleBanAuthor}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <FaBan className="w-3 h-3" />
                        Banear Usuario
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contenido del Comentario - Destacado */}
        <div className="mb-4 relative">
          <div 
            ref={contentRef}
            className={`text-gray-900 whitespace-pre-line break-words leading-relaxed transition-all duration-300 ${
              showFullContent ? 'max-h-[500px]' : 'max-h-24'
            } ${
              needsExpansion ? 'overflow-y-auto pr-2' : 'overflow-hidden'
            }`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e0 #f7fafc',
              fontSize: '0.9375rem'
            }}
            dangerouslySetInnerHTML={{ __html: renderFormattedContent(comment.content) }}
          />
          
          {needsExpansion && (
            <button
              onClick={toggleContent}
              className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium transition duration-200"
            >
              {showFullContent ? (
                <>
                  <FaChevronUp className="w-3 h-3" />
                  Mostrar menos
                </>
              ) : (
                <>
                  <FaChevronDown className="w-3 h-3" />
                  Mostrar más
                </>
              )}
            </button>
          )}
        </div>

        {/* Acciones del Comentario - Más sutiles */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={!user || actionLoading || likesLoading}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition duration-200 text-xs ${
              userLiked 
                ? 'text-red-600 hover:text-red-700' 
                : 'text-gray-500 hover:text-gray-700'
            } ${(!user || actionLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {actionLoading ? (
              <FaSpinner className="w-3 h-3 animate-spin" />
            ) : userLiked ? (
              <FaHeart className="w-3 h-3" />
            ) : (
              <FaRegHeart className="w-3 h-3" />
            )}
            <span className="font-medium">{likeCount}</span>
          </button>

          {/* Reply - Solo si no ha alcanzado el límite de profundidad */}
          {canReply && (
            <button
              onClick={handleReply}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition duration-200 text-xs"
            >
              <FaReply className="w-3 h-3" />
              <span>Responder</span>
            </button>
          )}

          {/* NUEVO: Mensaje informativo cuando se alcanza el límite */}
          {userData && 
           ['doctor', 'moderator', 'admin'].includes(userData?.role) && 
           depth >= MAX_DEPTH && (
            <span className="text-[10px] text-gray-400 italic">
              Máximo nivel de respuestas alcanzado
            </span>
          )}
        </div>
      </div>

      {/* Modales */}
      <EditCommentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        comment={comment}
        onCommentUpdated={handleCommentUpdated}
      />

      <DeleteCommentModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        comment={comment}
        onCommentDeleted={handleCommentDeleted}
        isModeratorAction={canModerate && !isAuthor}
      />

      <CreateCommentModal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        postId={postId}
        postTitle="Responder comentario"
        parentCommentId={comment.id}
        onCommentCreated={handleReplyCreated}
      />

      {forumDetails && (
        <BanUserModal
          isOpen={showBanModal}
          onClose={() => setShowBanModal(false)}
          user={authorData ? { id: comment.authorId, ...authorData } : null}
          forumId={forumDetails.id}
          forumName={forumDetails.name}
          onUserBanned={handleUserBanned}
        />
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportType="comment"
        targetId={comment.id}
        targetName={`Comentario de ${getAuthorName()}`}
      />

    </>
  );
}

export default CommentCard;