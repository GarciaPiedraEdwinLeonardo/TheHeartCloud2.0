import { FaUser, FaComments, FaHeart, FaThumbsDown, FaCalendar } from 'react-icons/fa';

function SearchPostsList({ posts, searchQuery, onPostClick, onShowUserProfile }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <FaComments className="w-16 h-16 mx-auto" />
        </div>
        <p className="text-gray-500 text-lg mb-2">
          No se encontraron publicaciones relacionadas con "{searchQuery}"
        </p>
        <p className="text-gray-400 text-sm">
          Intenta con otros términos de búsqueda
        </p>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return new Date(timestamp).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  const handleAuthorClick = (e, post) => {
    e.stopPropagation();
    if (onShowUserProfile && post.authorData) {
      onShowUserProfile({
        id: post.authorId,
        ...post.authorData
      });
    }
  };

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <div 
          key={post.id} 
          className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition duration-200 cursor-pointer"
          onClick={() => onPostClick(post)}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-2 break-words">
                {post.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2 break-words">
                {post.content}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
            {/* Información del autor */}
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => handleAuthorClick(e, post)}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 transition duration-200"
              >
                {post.authorData?.photoURL ? (
                  <img 
                    src={post.authorData.photoURL} 
                    alt={`Foto de ${post.authorData.name?.name || 'autor'}`}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="w-3 h-3 text-blue-600" />
                  </div>
                )}
                <span className="font-medium text-gray-700">
                  {post.authorData?.name ? 
                    `${post.authorData.name.name || ''} ${post.authorData.name.apellidopat || ''}`.trim() 
                    : 'Usuario'
                  }
                </span>
              </button>
              
              {post.authorData?.professionalInfo?.specialty && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {post.authorData.professionalInfo.specialty}
                </span>
              )}
            </div>

            {/* Estadísticas del post */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <FaCalendar className="w-3 h-3" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaHeart className="w-3 h-3 text-red-500" />
                <span>{post.likes?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaThumbsDown className="w-3 h-3 text-blue-500" />
                <span>{post.dislikes?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaComments className="w-3 h-3 text-gray-500" />
                <span>{post.stats?.commentCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Comunidad */}
          {post.forumData && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Publicado en: <span className="font-medium text-blue-600">{post.forumData.name}</span>
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default SearchPostsList;