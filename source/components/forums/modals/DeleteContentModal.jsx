import { useState } from 'react';
import { FaTimes, FaSpinner, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { usePostModeration } from './../hooks/usePostModeration';

function DeleteContentModal({ isOpen, onClose, content, contentType, forumId, onContentDeleted }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { deletePost } = usePostModeration();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Por favor proporciona un motivo para la eliminación');
      return;
    }

    if (reason.length < 10) {
      setError('El motivo debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      
      if (contentType === 'post') {
        result = await deletePost(content.id, reason, forumId);
      }
      // Aquí puedes agregar más tipos (comments, etc.)

      if (result.success) {
        if (onContentDeleted) {
          onContentDeleted();
        }
        onClose();
        setReason('');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al eliminar el contenido');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !content) return null;

  const getContentTitle = () => {
    if (contentType === 'post') return content.title;
    return 'Contenido';
  };

  const getContentPreview = () => {
    if (contentType === 'post') return content.content?.substring(0, 200) + '...';
    return content.content?.substring(0, 100) + '...';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Eliminar {contentType === 'post' ? 'Publicación' : 'Contenido'}
              </h2>
              <p className="text-sm text-gray-600">Esta acción se reportará a moderación</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Información del contenido */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Contenido a eliminar:</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="font-semibold text-gray-900 text-sm mb-1">{getContentTitle()}</p>
              <p className="text-xs text-gray-600 line-clamp-2">{getContentPreview()}</p>
            </div>
          </div>

          {/* Motivo */}
          <div className="mb-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de la eliminación *
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 disabled:opacity-50"
              placeholder="Explica detalladamente por qué estás eliminando este contenido..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length} caracteres (mínimo 10)
            </p>
          </div>

          {/* Advertencia */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">Esta acción es permanente</h4>
                <ul className="text-xs text-red-700 space-y-1">
                  <li>• El contenido será eliminado permanentemente</li>
                  <li>• Se notificará al autor sobre la eliminación</li>
                  <li>• El motivo será revisado por moderación global</li>
                  <li>• Esta acción no se puede deshacer</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || reason.length < 10}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
              <FaTrash className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeleteContentModal;