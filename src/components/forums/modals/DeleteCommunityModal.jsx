import { useState } from 'react';
import { FaTimes, FaSpinner, FaExclamationTriangle, FaTrash, FaUsers } from 'react-icons/fa';
import { useCommunityDeletion } from './../hooks/useCommunityDeletion';
import { auth } from '../../../config/firebase';
import { toast } from 'react-hot-toast';

function DeleteCommunityModal({ isOpen, onClose, onDeleteConfirmed, communityName, forumId }) {
  const [reason, setReason] = useState('');
  const { deleteCommunity, loading, error } = useCommunityDeletion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast.error('Debes proporcionar un motivo para la eliminación');
      return;
    }

    if (reason.length < 10) {
      toast.error('El motivo debe tener al menos 10 caracteres');
      return;
    }

    try {
      const result = await deleteCommunity(forumId, reason, auth.currentUser?.email);

      if (result.success) {
        onDeleteConfirmed({ 
          reason,
          stats: result.stats 
        });
        onClose();
      } else {
        toast.error(`Error`);
        console.error("Error " + result.error);
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      toast.error('Ocurrió un error inesperado al eliminar la comunidad');
    }
  };

  // Prevenir scroll cuando el modal está abierto
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div 
        className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-md mx-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Responsive */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100">
              <FaUsers className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                Eliminar Comunidad
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {communityName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50 flex-shrink-0 ml-2"
          >
            <FaTimes className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido - Scroll en móvil */}
        <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Información de la comunidad */}
            <div className="mb-4 sm:mb-6">
              <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-2">
                Comunidad a eliminar:
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="font-semibold text-gray-900 text-sm break-words">{communityName}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Esta acción eliminará permanentemente todos los datos de la comunidad
                </p>
              </div>
            </div>

            {/* Motivo de la eliminación */}
            <div className="mb-4 sm:mb-6">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de la eliminación *
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                rows={4}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 disabled:opacity-50 resize-none"
                placeholder="Explica detalladamente por qué eliminas esta comunidad..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {reason.length} caracteres (mínimo 10)
              </p>
            </div>

            {/* Advertencia */}
            <div className="border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 bg-red-50 border-red-200">
              <div className="flex items-start gap-2 sm:gap-3">
                <FaExclamationTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-red-800 mb-1">
                    Acción irreversible
                  </h4>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li className="break-words">• Todas las publicaciones y comentarios se eliminarán</li>
                    <li className="break-words">• Los miembros perderán el acceso a la comunidad</li>
                    <li className="break-words">• No se podrá recuperar la comunidad</li>
                    <li className="break-words font-semibold">• ⚠️ Esta acción es permanente</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Botones responsive */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl sm:rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium disabled:opacity-50 text-sm sm:text-base order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || reason.length < 10}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Eliminar Comunidad</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteCommunityModal;