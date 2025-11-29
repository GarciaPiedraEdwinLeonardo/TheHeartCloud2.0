import { useState, useEffect } from 'react';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import PostCard from './../../forums/posts/components/PostCard';
import CommentCard from './../../forums/posts/comments/components/CommentCard';
import DeletePostModal from './../../forums/posts/modals/DeletePostModal';
import DeleteCommentModal from './../../forums/posts/comments/modals/DeleteCommentModal';

function ContentPreview({ report, contentType, isGlobalReport }) {
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Simular carga de datos (en producción usarías los hooks reales)
  useEffect(() => {
    const loadContentData = async () => {
      setLoading(true);
      setError(null);

      try {
        // En una implementación real, usarías:
        // const { post } = usePost(report.targetId);
        // const { comment } = useComment(report.targetId);
        
        // Por ahora simulamos datos básicos
        let data = null;

        if (contentType === 'post') {
          data = {
            id: report.targetId,
            title: report.targetName || 'Publicación reportada',
            content: report.description || 'Contenido de la publicación...',
            authorId: report.targetAuthorId || 'unknown',
            authorName: report.targetAuthorName || 'Usuario',
            createdAt: report.createdAt || new Date(),
            likes: [],
            dislikes: [],
            images: [],
            stats: { commentCount: 0 },
            status: 'active'
          };
        } else if (contentType === 'comment') {
          data = {
            id: report.targetId,
            content: report.description || 'Contenido del comentario...',
            authorId: report.targetAuthorId || 'unknown',
            authorName: report.targetAuthorName || 'Usuario',
            createdAt: report.createdAt || new Date(),
            likes: [],
            likeCount: 0,
            postId: report.postId || 'unknown'
          };
        }

        setContentData(data);
      } catch (err) {
        console.error('Error cargando contenido:', err);
        setError('No se pudo cargar el contenido');
      } finally {
        setLoading(false);
      }
    };

    loadContentData();
  }, [contentType, report]);

  const handleDeleteContent = () => {
    setShowDeleteModal(true);
  };

  const handleContentDeleted = () => {
    setShowDeleteModal(false);
    // Aquí podrías recargar los reportes o cerrar el modal
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="w-6 h-6 text-blue-500 animate-spin mr-3" />
        <span className="text-gray-600">Cargando contenido...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-sm bg-red-50 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!contentData) {
    return (
      <div className="text-center py-8 text-gray-500">
        No se pudo cargar el contenido
      </div>
    );
  }

  return (
    <div className="content-preview">
      {/* Header de acciones */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">Acciones de Moderación</h3>
            <p className="text-sm text-blue-700">
              Revisa el contenido y toma la acción apropiada
            </p>
          </div>
          <button
            onClick={handleDeleteContent}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium"
          >
            Eliminar {contentType === 'post' ? 'Publicación' : 'Comentario'}
          </button>
        </div>
      </div>

      {/* Contenido real */}
      {contentType === 'post' && (
        <PostCard
          post={contentData}
          onCommentClick={() => {}}
          onPostUpdated={() => {}}
          onPostDeleted={handleContentDeleted}
          userRole="moderator" // Para mostrar opciones de moderación
          userMembership={{}}
          requiresPostApproval={false}
          showCommentsButton={false}
        />
      )}

      {contentType === 'comment' && (
        <div className="border border-gray-200 rounded-lg">
          <CommentCard
            comment={contentData}
            postId={contentData.postId}
            userData={{ role: 'moderator' }} // Para mostrar opciones de moderación
            onCommentCreated={() => {}}
            isReply={false}
            forumData={null}
          />
        </div>
      )}

      {/* Modales de eliminación */}
      {contentType === 'post' && (
        <DeletePostModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          post={contentData}
          onPostDeleted={handleContentDeleted}
          isModeratorAction={true}
        />
      )}

      {contentType === 'comment' && (
        <DeleteCommentModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          comment={contentData}
          onCommentDeleted={handleContentDeleted}
          isModeratorAction={true}
        />
      )}
    </div>
  );
}

export default ContentPreview;