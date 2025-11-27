import { useState } from 'react';
import { FaTimes, FaSpinner, FaExclamationTriangle, FaTrash, FaUserShield } from 'react-icons/fa';
import { useCommentActions } from './../hooks/useCommentActions';

function DeleteCommentModal({ isOpen, onClose, comment, onCommentDeleted, isModeratorAction = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { deleteComment } = useCommentActions();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');

    try {
      const result = await deleteComment(comment.id, isModeratorAction);

      if (result.success) {
        if (onCommentDeleted) {
          onCommentDeleted(result.deletionType);
        }
        onClose();
        
        // Mostrar mensaje diferente según el tipo de eliminación
        if (isModeratorAction) {
          alert('✅ Comentario eliminado por moderación.');
        } else {
          alert('✅ Comentario eliminado.');
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

  // Prevenir scroll del body cuando el modal está abierto
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  if (!isOpen || !comment) return null;

  const getModalTitle = () => {
    if (isModeratorAction) {
      return 'Eliminar Comentario (Moderación)';
    }
    return 'Eliminar Comentario';
  };

  const getModalDescription = () => {
    if (isModeratorAction) {
      return 'Esta acción se registrará para auditoría del sistema';
    }
    return '¿Estás seguro de que quieres eliminar este comentario?';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isModeratorAction ? 'bg-red-100' : 'bg-orange-100'
            }`}>
              {isModeratorAction ? (
                <FaUserShield className="w-5 h-5 text-red-600" />
              ) : (
                <FaExclamationTriangle className="w-5 h-5 text-orange-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {getModalTitle()}
              </h2>
              <p className="text-sm text-gray-500 truncate">{getModalDescription()}</p>
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

            {/* Advertencia */}
            <div className={`border rounded-lg p-4 mb-6 ${
              isModeratorAction 
                ? 'bg-red-50 border-red-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  isModeratorAction ? 'text-red-600' : 'text-orange-600'
                }`} />
                <div>
                  <h4 className={`text-sm font-medium mb-1 ${
                    isModeratorAction ? 'text-red-800' : 'text-orange-800'
                  }`}>
                    {isModeratorAction ? 'Acción de moderación' : 'Eliminación permanente'}
                  </h4>
                  <ul className={`text-xs space-y-1 ${
                    isModeratorAction ? 'text-red-700' : 'text-orange-700'
                  }`}>
                    {isModeratorAction ? (
                      <>
                        <li>• El comentario se marcará como eliminado por moderación</li>
                        <li>• El autor será notificado sobre la eliminación</li>
                        <li>• La acción quedará registrada en el sistema</li>
                        <li>• Puede conllevar sanciones para el autor</li>
                      </>
                    ) : (
                      <>
                        <li>• El comentario será eliminado permanentemente</li>
                        <li>• No podrás recuperar este comentario</li>
                        <li>• Las respuestas a este comentario también se eliminarán</li>
                        <li>• Esta acción no se puede deshacer</li>
                      </>
                    )}
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
              disabled={loading}
              className={`px-6 py-3 rounded-lg transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 order-1 sm:order-2 ${
                isModeratorAction
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
              <FaTrash className="w-4 h-4" />
              {isModeratorAction ? 'Eliminar como Moderador' : 'Eliminar Comentario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteCommentModal;