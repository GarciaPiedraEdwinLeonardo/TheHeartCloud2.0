import { useState } from 'react';
import { FaTimes, FaSpinner, FaExclamationTriangle, FaTrash, FaUserShield } from 'react-icons/fa';
import { usePostActions } from './../hooks/usePostActions';
import { auth, db } from './../../../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

function DeletePostModal({ isOpen, onClose, post, onPostDeleted, isModeratorAction = false }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { deletePost } = usePostActions();
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones diferentes según quién elimina
    if (isModeratorAction && !reason.trim()) {
      setError('Como moderador, debes proporcionar un motivo para la eliminación');
      return;
    }

    if (isModeratorAction && reason.length < 10) {
      setError('El motivo debe tener al menos 10 caracteres para acciones de moderación');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      
      if (isModeratorAction) {
        // Eliminación por moderador - se guarda en deleted_posts
        result = await deletePost(post.id, reason, true);
      } else {
        // Eliminación por usuario - se borra permanentemente
        result = await deletePost(post.id, 'user_deleted', false);
      }

      if (result.success) {
        if (onPostDeleted) {
          onPostDeleted(result.deletionType);
        }
        onClose();
        setReason('');
        
        // Mostrar mensaje diferente según el tipo de eliminación
        if (isModeratorAction) {
          alert('✅ Publicación eliminada y guardada para auditoría de moderación.');
        } else {
          alert('✅ Publicación eliminada permanentemente.');
        }
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
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  if (!isOpen || !post) return null;

  const getModalTitle = () => {
    if (isModeratorAction) {
      return 'Eliminar Publicación (Moderación)';
    }
    return 'Eliminar Publicación';
  };

  const getModalDescription = () => {
    if (isModeratorAction) {
      return 'Esta acción se registrará para auditoría del sistema';
    }
    return '¿Estás seguro de que quieres eliminar esta publicación?';
  };

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

        {/* Contenido scrolleable */}
        <div className="max-h-[calc(80vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
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

            {/* Motivo (solo para moderadores) */}
            {isModeratorAction && (
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 disabled:opacity-50 resize-none"
                  placeholder="Explica detalladamente por qué eliminas esta publicación. Este motivo será revisado por la moderación global."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reason.length} caracteres (mínimo 10)
                </p>
              </div>
            )}

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
                    {isModeratorAction ? 'Acción de moderación' : 'Esta acción es permanente'}
                  </h4>
                  <ul className={`text-xs space-y-1 ${
                    isModeratorAction ? 'text-red-700' : 'text-orange-700'
                  }`}>
                    {isModeratorAction ? (
                      <>
                        <li>• La publicación se guardará en registros de moderación</li>
                        <li>• El autor será notificado sobre la eliminación</li>
                        <li>• El motivo será revisado por moderación global</li>
                        <li>• Puede conllevar sanciones para el autor</li>
                        <li>• ⚠️ Esta acción queda registrada en el sistema</li>
                      </>
                    ) : (
                      <>
                        <li>• La publicación será eliminada permanentemente</li>
                        <li>• No podrás recuperar esta publicación</li>
                        <li>• Los comentarios y reacciones también se eliminarán</li>
                        <li>• Esta acción no se puede deshacer</li>
                      </>
                    )}
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
              disabled={loading || (isModeratorAction && reason.length < 10)}
              className={`px-6 py-3 rounded-lg transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 order-1 sm:order-2 ${
                isModeratorAction
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
              <FaTrash className="w-4 h-4" />
              {isModeratorAction ? 'Eliminar como Moderador' : 'Eliminar Publicación'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeletePostModal;