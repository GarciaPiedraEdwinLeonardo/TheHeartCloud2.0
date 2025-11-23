import { useState } from 'react';
import { FaSpinner, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import PostCard from './PostCard';
import CreatePostModal from './../modals/CreatePostModal';

function PostList({ 
  posts, 
  loading, 
  error, 
  forumId, 
  forumName, 
  userRole, 
  userMembership, 
  requiresPostApproval,
  onPostUpdate, 
  onDeleteContent, 
  onBanUser,
  onCommentClick,
  forumData,
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canCreatePost = ['doctor', 'moderator', 'admin'].includes(userRole);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando publicaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <FaExclamationTriangle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar publicaciones</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <FaExclamationTriangle className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {canCreatePost ? 'No hay publicaciones aún' : 'No hay publicaciones en esta comunidad'}
        </h3>
        <p className="text-gray-600 mb-6">
          {canCreatePost 
            ? 'Sé el primero en compartir contenido en esta comunidad'
            : 'Los miembros de esta comunidad aún no han publicado contenido'
          }
        </p>
      </div>
    );
  }

  const handlePostUpdated = () => {
    if (onPostUpdate) {
      onPostUpdate();
    }
  };

  const handlePostDeleted = () => {
    if (onPostUpdate) {
      onPostUpdate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Lista de posts*/}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onCommentClick={onCommentClick}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
            onDeleteContent={onDeleteContent}
            onBanUser={onBanUser}
            userRole={userRole} 
            userMembership={userMembership} 
            requiresPostApproval={requiresPostApproval}
            forumData={forumData}
          />
        ))}
      </div>

      {/* Modal para crear post */}
      {canCreatePost && (
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          forumId={forumId}
          forumName={forumName}
          requiresPostApproval={requiresPostApproval}
          canPostWithoutApproval={userMembership?.role === 'owner' || userMembership?.role === 'moderator'}
        />
      )}
    </div>
  );
}

export default PostList;