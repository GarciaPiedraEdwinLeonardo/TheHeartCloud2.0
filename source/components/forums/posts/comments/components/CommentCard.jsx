import { useState, useEffect } from 'react';
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
  FaFlag
} from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from './../../../../../config/firebase';
import { useCommentActions } from './../hooks/useCommentActions';
import { useCommentLikes } from './../hooks/useCommentLikes';
import EditCommentModal from './../modals/EditCommentModal';
import DeleteCommentModal from './../modals/DeleteCommentModal';
import CreateCommentModal from './../modals/CreateCommentModal';
import ReportModal from './../../../modals/ReportModal';
import BanUserModal from './../../../modals/BanUserModal'

function CommentCard({ comment, postId, userData, onCommentCreated, isReply = false, forumData }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [authorData, setAuthorData] = useState(null);
  const [forumDetails, setForumDetails] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { likeComment } = useCommentActions();
  const { likeCount, userLiked, loading: likesLoading } = useCommentLikes(comment.id);
  const user = auth.currentUser;

  useEffect(() => {
    loadAuthorData();
    loadForumDetails();
  }, [comment.authorId, forumData]);

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
      // Cargar datos del foro desde el post si no se proporcionan
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

  // Verificar permisos
  const isAuthor = user && user.uid === comment.authorId;
  const isGlobalModerator = userData && ['moderator', 'admin'].includes(userData?.role);
  
  // Verificar si es moderador del foro
  const isForumModerator = forumDetails && forumDetails.moderators && forumDetails.moderators[user?.uid];
  const isForumOwner = forumDetails && forumDetails.ownerId === user?.uid;
  
  const canModerate = isGlobalModerator || isForumModerator || isForumOwner;
  const showOptionsMenu = isAuthor || canModerate;
  const canReply = userData && ['doctor', 'moderator', 'admin'].includes(userData?.role);
  const canReport = user && !isAuthor; // No puedes reportar tu propio comentario

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

  // Función para renderizar contenido con formato básico
  const renderFormattedContent = (content) => {
    if (!content) return '';
    
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  return (
    <>
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${isReply ? 'bg-gray-50' : ''}`}>
        {/* Header del Comentario */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaUser className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-sm">{getAuthorName()}</h3>
                {getAuthorSpecialty() && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {getAuthorSpecialty()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <FaCalendar className="w-3 h-3" />
                <span>{formatDate(comment.createdAt)}</span>
                {comment.updatedAt && (
                  <>
                    <span>•</span>
                    <span className="text-gray-400">Editado</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Menú de opciones */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded transition duration-200"
            >
              <FaEllipsisH className="w-4 h-4 text-gray-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                {/* Acciones del autor */}
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

                {/* Reportar (solo si no es el autor) */}
                {canReport && (
                  <button
                    onClick={handleReport}
                    className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                  >
                    <FaFlag className="w-3 h-3" />
                    Reportar
                  </button>
                )}

                {/* Acciones de moderación */}
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
        </div>

        {/* Contenido del Comentario */}
        <div className="mb-4">
          <div 
            className="text-gray-700 whitespace-pre-line break-words leading-relaxed text-sm"
            dangerouslySetInnerHTML={{ __html: renderFormattedContent(comment.content) }}
          />
        </div>

        {/* Acciones del Comentario */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={!user || actionLoading || likesLoading}
            className={`flex items-center gap-2 px-2 py-1 rounded transition duration-200 text-sm ${
              userLiked 
                ? 'text-red-600 hover:text-red-700' 
                : 'text-gray-600 hover:text-gray-700'
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

          {/* Reply */}
          {canReply && (
            <button
              onClick={handleReply}
              className="flex items-center gap-2 px-2 py-1 rounded text-gray-600 hover:text-gray-700 hover:bg-gray-100 transition duration-200 text-sm"
            >
              <FaReply className="w-3 h-3" />
              <span>Responder</span>
            </button>
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