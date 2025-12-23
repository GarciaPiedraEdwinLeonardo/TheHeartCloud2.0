import { useState, useEffect } from 'react';
import { FaSpinner, FaCheck, FaTimes, FaEye, FaUser, FaImage } from 'react-icons/fa';
import { usePostModeration } from '../hooks/usePostModeration';
import { auth, db } from '../../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import PostImages from '../posts/components/PostImages';

function PostValidationModal({ isOpen, onClose, forumId, forumName, onPostsValidated }) {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  
  const { getPendingPosts, validatePost, rejectPost } = usePostModeration();

  useEffect(() => {
    if (isOpen && forumId) {
      loadPendingPosts();
    }
  }, [isOpen, forumId]);

  const loadPendingPosts = async () => {
    setLoading(true);
    const posts = await getPendingPosts(forumId);
    
    // Enriquecer posts con datos de autor
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        try {
          const authorDoc = await getDoc(doc(db, 'users', post.authorId));
          const authorData = authorDoc.exists() ? authorDoc.data() : null;
          
          return {
            ...post,
            authorName: authorData?.name ? 
              `${authorData.name.name || ''} ${authorData.name.apellidopat || ''} ${authorData.name.apellidomat || ''}`.trim() 
              : 'Usuario',
            authorSpecialty: authorData?.professionalInfo?.specialty || null
          };
        } catch (error) {
          return { ...post, authorName: 'Usuario', authorSpecialty: null };
        }
      })
    );
    
    setPendingPosts(enrichedPosts);
    setLoading(false);
  };

  const handleValidate = async (postId) => {
    setActionLoading(prev => ({ ...prev, [postId]: 'validating' }));
    const result = await validatePost(postId, forumId, forumName);
    if (result.success) {
      // Actualizar UI inmediatamente
      setPendingPosts(prev => prev.filter(post => post.id !== postId));
      if (onPostsValidated) {
        onPostsValidated();
      }
    } else {
      toast.error("Error al validar intenta de nuevo mas tarde");
      console.error(`Error al validar: ${result.error}`);
    }
    setActionLoading(prev => ({ ...prev, [postId]: null }));
  };

  const handleReject = async (postId) => {
    setActionLoading(prev => ({ ...prev, [postId]: 'rejecting' }));
    const result = await rejectPost(postId, forumId, forumName);
    if (result.success) {
      // Actualizar UI inmediatamente 
      setPendingPosts(prev => prev.filter(post => post.id !== postId));
      
      if (onPostsValidated) {
        onPostsValidated();
      }
    } else {
      toast.error('Error al rechazar intente de nuevo mas tarde');
      console.error(`Error al rechazar: ${result.error}`);
    }
    setActionLoading(prev => ({ ...prev, [postId]: null }));
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

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 truncate">Validar Publicaciones</h2>
            <p className="text-sm text-gray-600 mt-1 truncate">
              Revisa y aprueba publicaciones pendientes en {forumName}
              {pendingPosts.length > 0 && ` - ${pendingPosts.length} pendiente(s)`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 flex-shrink-0 ml-4"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : pendingPosts.length === 0 ? (
            <div className="text-center py-12">
              <FaEye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay publicaciones pendientes</h3>
              <p className="text-gray-600">Todas las publicaciones han sido revisadas.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingPosts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  {/* Header del Post */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaUser className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">{post.authorName}</h3>
                        {post.authorSpecialty && (
                          <p className="text-sm text-gray-600 truncate">{post.authorSpecialty}</p>
                        )}
                        <p className="text-xs text-gray-500 truncate">
                          {formatDate(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full flex-shrink-0 ml-3">
                      Pendiente
                    </span>
                  </div>

                  {/* Contenido del Post */}
                  <div className="mb-4">
                    <h4 className="font-bold text-lg text-gray-900 mb-2 break-words">{post.title}</h4>
                    <div className="text-gray-700 whitespace-pre-line bg-white p-4 rounded-lg border max-h-60 overflow-y-auto">
                      {post.content}
                    </div>
                  </div>

                  {post.images && post.images.length > 0 && (
                    <div className="mb-4">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <PostImages images={post.images} />
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleValidate(post.id)}
                      disabled={actionLoading[post.id]}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 min-h-[42px]"
                    >
                      {actionLoading[post.id] === 'validating' ? (
                        <FaSpinner className="w-4 h-4 animate-spin" />
                      ) : (
                        <FaCheck className="w-4 h-4" />
                      )}
                      Aprobar
                    </button>
                    
                    <button
                      onClick={() => handleReject(post.id)}
                      disabled={actionLoading[post.id]}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 min-h-[42px]"
                    >
                      {actionLoading[post.id] === 'rejecting' ? (
                        <FaSpinner className="w-4 h-4 animate-spin" />
                      ) : (
                        <FaTimes className="w-4 h-4" />
                      )}
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer*/}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span className="truncate">
              {pendingPosts.length === 0 
                ? 'No hay publicaciones pendientes' 
                : `${pendingPosts.length} publicación(es) pendiente(s)`
              }
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium whitespace-nowrap"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostValidationModal;