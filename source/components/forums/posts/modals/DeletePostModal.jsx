import { useState } from 'react';
import { FaTimes, FaSpinner, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { usePostActions } from './../hooks/usePostActions';

function DeletePostModal({ isOpen, onClose, post, onPostDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');
  
  const { deletePost } = usePostActions();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (confirmText !== 'ELIMINAR') {
      setError('Por favor escribe "ELIMINAR" para confirmar');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await deletePost(post.id);

      if (result.success) {
        if (onPostDeleted) {
          onPostDeleted();
        }
        onClose();
        setConfirmText('');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error al eliminar la publicación');
    } finally {
      setLoading(false);
    }
  };

  // Prevenir scroll del body cuando el modal está abierto
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Contenedor principal con max-height y overflow */}
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fijo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaExclamationTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">Eliminar Publicación</h2>
              <p className="text-sm text-gray-500 truncate">Esta acción no se puede deshacer</p>
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

        {/* Contenido scrolleable */}
        <div className="max-h-[calc(80vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Información de la publicación */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Publicación a eliminar:</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="font-semibold text-gray-900 text-sm mb-1 break-words">
                  {post.title}
                </p>
                <p className="text-xs text-gray-600 line-clamp-2 break-words">
                  {post.content}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Likes: {post.likes?.length || 0}</span>
                  <span>Comentarios: {post.stats?.commentCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Confirmación */}
            <div className="mb-6">
              <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 mb-2">
                Para confirmar, escribe <span className="font-mono text-red-600">ELIMINAR</span>:
              </label>
              <input
                type="text"
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={loading}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 disabled:opacity-50 font-mono"
                placeholder="ELIMINAR"
                required
              />
            </div>

            {/* Advertencia */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">Advertencia</h4>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li>• Esta acción no se puede deshacer</li>
                    <li>• La publicación será eliminada permanentemente</li>
                    <li>• Los comentarios asociados también se eliminarán</li>
                    <li>• Se reducirá tu contador de publicaciones</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer fijo con botones */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0 rounded-b-2xl">
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
              onClick={handleSubmit}
              disabled={loading || confirmText !== 'ELIMINAR'}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 order-1 sm:order-2"
            >
              {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
              <FaTrash className="w-4 h-4" />
              {loading ? 'Eliminando...' : 'Eliminar Publicación'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeletePostModal;