import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { usePostActions } from './../hooks/usePostActions';
import { toast } from 'react-hot-toast';

function DeletePostModal({ isOpen, onClose, post, onPostDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { deletePost } = usePostActions();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');

    try {
      const result = await deletePost(post.id);

      if (result.success) {
        if (onPostDeleted) {
          onPostDeleted();
        }
        onClose();
        toast.success('Publicación eliminada permanentemente');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al eliminar la publicación');
    } finally {
      setLoading(false);
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

  // Reset de errores al cerrar
  useEffect(() => {
    if (!isOpen) {
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Contenedor principal */}
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-orange-100">
              <FaExclamationTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                Eliminar Publicación
              </h2>
              <p className="text-sm text-gray-500 truncate">
                Esta acción es permanente
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50 flex-shrink-0 ml-2"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Información del post */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Publicación a eliminar:</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="font-semibold text-gray-900 text-sm mb-1 break-words">{post.title}</p>
                <p className="text-xs text-gray-600 line-clamp-2 break-words">
                  {post.content?.substring(0, 150)}...
                </p>
              </div>
            </div>

            {/* Advertencia */}
            <div className="border rounded-lg p-4 mb-6 bg-orange-50 border-orange-200">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-orange-600" />
                <div>
                  <h4 className="text-sm font-medium mb-1 text-orange-800">
                    Esta acción es permanente
                  </h4>
                  <ul className="text-xs space-y-1 text-orange-700">
                    <li>• La publicación será eliminada permanentemente</li>
                    <li>• No podrás recuperar esta publicación</li>
                    <li>• Los comentarios y reacciones también se eliminarán</li>
                    <li>• Las imágenes serán eliminadas del servidor</li>
                    <li>• Esta acción no se puede deshacer</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium disabled:opacity-50 order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-lg transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 order-1 sm:order-2 bg-red-600 text-white hover:bg-red-700"
              >
                {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
                <FaTrash className="w-4 h-4" />
                Eliminar Permanentemente
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DeletePostModal;