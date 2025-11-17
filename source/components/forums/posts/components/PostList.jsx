// components/PostList.jsx
import { useState } from 'react';
import { FaSpinner, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import PostCard from './PostCard';
import CreatePostModal from './../modals/CreatePostModal';

function PostList({ posts, loading, error, forumId, forumName, userRole, onPostUpdate }) {
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
        {canCreatePost && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-medium flex items-center gap-2 mx-auto"
          >
            <FaPlus className="w-4 h-4" />
            Crear primera publicación
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botón crear post (solo para usuarios que pueden) */}
      {canCreatePost && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Nueva Publicación
          </button>
        </div>
      )}

      {/* Lista de posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onCommentClick={() => console.log('Abrir comentarios:', post.id)} // Para implementar después
            onEdit={(post) => console.log('Editar post:', post.id)}
            onDelete={(post) => console.log('Eliminar post:', post.id)}
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
        />
      )}
    </div>
  );
}

export default PostList;