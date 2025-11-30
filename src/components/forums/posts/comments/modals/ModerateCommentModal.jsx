import { useState } from 'react';
import { FaTimes, FaSpinner, FaExclamationTriangle, FaTrash, FaUserShield } from 'react-icons/fa';
import { useCommentModeration } from './../hooks/useCommentModeration';
import { toast } from 'react-hot-toast';

function ModerateCommentModal({ isOpen, onClose, comment, forumData, onCommentModerated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [deleteReplies, setDeleteReplies] = useState(true);
  
  const { deleteComment } = useCommentModeration();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Debes proporcionar una razón para la eliminación');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await deleteComment(
        comment.id,
        reason.trim(),
        forumData.id,
        true, // isModeratorAction
        deleteReplies // deleteReplies
      );

      if (result.success) {
        if (onCommentModerated) {
          onCommentModerated(result.deletedCount);
        }
        onClose();
        
        // Mostrar mensaje con información
        if (result.deletedCount > 1) {
          toast.success(`Comentario eliminado junto con ${result.deletedCount - 1} respuesta(s) por moderación.`);
        } else {
          toast.success('Comentario eliminado por moderación.');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al eliminar el comentario');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !comment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaUserShield className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                Eliminar Comentario (Moderación)
              </h2>
              <p className="text-sm text-gray-500 truncate">Esta acción se registrará para auditoría</p>
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
        <div className="max-h-[calc(80vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Información del comentario */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Comentario a eliminar:</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="text-sm text-gray-700 line-clamp-3 break-words">
                  {comment.content}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Creado el: {comment.createdAt?.toDate?.().toLocaleDateString('es-ES') || 'Fecha no disponible'}
                </div>
              </div>
            </div>

            {/* Razón de eliminación */}
            <div className="mb-6">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Razón de eliminación *
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 resize-none disabled:opacity-50"
                placeholder="Explica por qué este comentario debe ser eliminado..."
                required
              />
            </div>

            {/* Opción para eliminar respuestas */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteReplies}
                  onChange={(e) => setDeleteReplies(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Eliminar también las respuestas
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Si está marcado, todas las respuestas a este comentario también serán eliminadas
                  </p>
                </div>
              </label>
            </div>

            {/* Advertencia */}
            <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">
                    Acción de moderación
                  </h4>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li>• El comentario se marcará como eliminado por moderación</li>
                    <li>• El autor será notificado sobre la eliminación</li>
                    <li>• La acción quedará registrada en el sistema de auditoría</li>
                    <li>• Puede conllevar sanciones para el autor</li>
                    <li>• Se reportará a moderación global</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer con botones */}
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
              disabled={loading || !reason.trim()}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 order-1 sm:order-2"
            >
              {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
              <FaTrash className="w-4 h-4" />
              Eliminar como Moderador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModerateCommentModal;