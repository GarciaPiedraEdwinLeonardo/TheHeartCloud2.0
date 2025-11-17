// components/PostCard.jsx
import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaThumbsDown, FaRegThumbsDown, FaComment, FaEllipsisH, FaUser, FaCalendar } from 'react-icons/fa';
import { usePostActions } from './../hooks/usePostActions';
import { auth, db } from './../../../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import PostImages from './PostImages';

function PostCard({ post, onCommentClick, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const [userReaction, setUserReaction] = useState(null);
  const [authorData, setAuthorData] = useState(null);
  const { reactToPost } = usePostActions();
  const user = auth.currentUser;

  // Cargar datos del autor
  useEffect(() => {
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
    loadAuthorData();
  }, [post.authorId]);

  // Determinar reacción del usuario actual
  useEffect(() => {
    if (!user) return;
    if (post.likes?.includes(user.uid)) setUserReaction('like');
    else if (post.dislikes?.includes(user.uid)) setUserReaction('dislike');
  }, [user, post.likes, post.dislikes]);

  const handleReaction = async (reactionType) => {
    if (!user) return;
    
    const result = await reactToPost(post.id, reactionType);
    if (result.success) {
      setUserReaction(reactionType === 'remove' ? null : reactionType);
    }
  };

  const canModify = user && (user.uid === post.authorId || user.role === 'moderator' || user.role === 'admin');

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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
      {/* Header del Post */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FaUser className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{getAuthorName()}</h3>
            {getAuthorSpecialty() && (
              <p className="text-sm text-gray-600">{getAuthorSpecialty()}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <FaCalendar className="w-3 h-3" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Menú de opciones */}
        {canModify && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <FaEllipsisH className="w-4 h-4 text-gray-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onEdit(post);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    onDelete(post);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contenido del Post */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-3 break-words">
          {post.title}
        </h2>
        <div className="text-gray-700 whitespace-pre-line break-words leading-relaxed">
          {post.content}
        </div>
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

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {/* Like */}
          <button
            onClick={() => handleReaction(userReaction === 'like' ? 'remove' : 'like')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition duration-200 ${
              userReaction === 'like' 
                ? 'bg-red-50 text-red-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {userReaction === 'like' ? (
              <FaHeart className="w-4 h-4" />
            ) : (
              <FaRegHeart className="w-4 h-4" />
            )}
            <span className="text-sm">{post.likes?.length || 0}</span>
          </button>

          {/* Dislike */}
          <button
            onClick={() => handleReaction(userReaction === 'dislike' ? 'remove' : 'dislike')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition duration-200 ${
              userReaction === 'dislike' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {userReaction === 'dislike' ? (
              <FaThumbsDown className="w-4 h-4" />
            ) : (
              <FaRegThumbsDown className="w-4 h-4" />
            )}
            <span className="text-sm">{post.dislikes?.length || 0}</span>
          </button>

          {/* Comentar */}
          <button
            onClick={onCommentClick}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <FaComment className="w-4 h-4" />
            <span className="text-sm">Comentar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostCard;