import { useState } from 'react';
import { FaTimes, FaSpinner, FaExclamationTriangle, FaBan, FaCalendar } from 'react-icons/fa';
import { useUserSuspension } from '../../suspend/hooks/useUserSuspension';

function SuspendUserModal({ 
  isOpen, 
  onClose, 
  onSuspendConfirmed, 
  userName, 
  userId, 
  currentUserEmail,
  loading = false  // Recibir la prop loading
}) {
  const [formData, setFormData] = useState({
    reason: '',
    duration: '7'
  });
  const [localError, setLocalError] = useState('');
  const { suspendUser, error } = useUserSuspension();

  const durationOptions = [
    { value: '1', label: '1 día' },
    { value: '3', label: '3 días' },
    { value: '7', label: '7 días' },
    { value: '30', label: '30 días' },
    { value: 'permanent', label: 'Permanente' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones locales
    if (!formData.reason.trim()) {
      setLocalError('Debes proporcionar un motivo para la suspensión');
      return;
    }

    if (formData.reason.length < 10) {
      setLocalError('El motivo debe tener al menos 10 caracteres');
      return;
    }

    setLocalError(''); // Limpiar errores locales

    const result = await suspendUser(
      userId, 
      formData.reason, 
      formData.duration, 
      currentUserEmail
    );

    if (result.success) {
      onSuspendConfirmed(formData);
      onClose();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (localError) setLocalError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100">
              {loading ? (
                <FaSpinner className="w-5 h-5 text-red-600 animate-spin" />
              ) : (
                <FaBan className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {loading ? 'Suspendiendo...' : 'Suspender Usuario'}
              </h2>
              <p className="text-sm text-gray-500">
                {userName}
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

        <form onSubmit={handleSubmit} className="p-6">
          {/* Mostrar errores del hook o locales */}
          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error || localError}</p>
            </div>
          )}

          {/* Overlay de carga */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 rounded-2xl flex items-center justify-center z-10">
              <div className="text-center">
                <FaSpinner className="w-8 h-8 text-red-600 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Suspendiendo usuario...</p>
              </div>
            </div>
          )}

          {/* Duración */}
          <div className="mb-6">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <FaCalendar className="w-4 h-4 text-gray-500" />
                <span>Duración de la suspensión</span>
              </div>
            </label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              disabled={loading}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 disabled:opacity-50"
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Motivo */}
          <div className="mb-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de la suspensión *
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              disabled={loading}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 resize-none disabled:opacity-50"
              placeholder="Describe detalladamente el motivo de la suspensión..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.reason.length} caracteres (mínimo 10)
            </p>
          </div>

          {/* Advertencia */}
          <div className="border rounded-lg p-4 mb-6 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Acción de moderación importante
                </h4>
                <ul className="text-xs text-red-700 space-y-1">
                  <li>• El usuario será notificado sobre la suspensión</li>
                  <li>• No podrá publicar ni comentar durante la suspensión</li>
                  <li>• El motivo será revisado por moderación global</li>
                  <li>• Esta acción queda registrada en el sistema</li>
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
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || formData.reason.length < 10}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Suspendiendo...
                </>
              ) : (
                <>
                  <FaBan className="w-4 h-4" />
                  Suspender
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SuspendUserModal;