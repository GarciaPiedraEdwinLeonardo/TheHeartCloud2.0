import { useState } from 'react';
import { FaTimes, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

function LeaveAsOwnerModal({ isOpen, onClose, onConfirm, communityName}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Prevenir scroll del body cuando el modal está abierto
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con ícono de advertencia */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaExclamationTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Abandonar Comunidad
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Esta acción es irreversible
              </p>
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

        {/* Contenido */}
        <div className="p-6">
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Estás a punto de abandonar <span className="font-semibold text-gray-900">"{communityName}"</span> como propietario.
            </p>

            {/* Información importante */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <FaExclamationTriangle className="w-4 h-4" />
                ¿Qué sucederá?
              </h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Se transferirá la propiedad al moderador más antiguo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Perderás todos los privilegios de propietario</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>No podrás recuperar la propiedad automáticamente</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-gray-600">
              ¿Estás seguro de que deseas continuar?
            </p>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
              Sí, abandonar comunidad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaveAsOwnerModal;