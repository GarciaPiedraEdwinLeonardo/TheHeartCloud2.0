import { useState } from 'react';
import { FaTimes, FaSpinner, FaExclamationTriangle, FaBan, FaCalendar, FaExclamationCircle } from 'react-icons/fa';
import { useUserSuspension } from '../../suspend/hooks/useUserSuspension';

function SuspendUserModal({ 
  isOpen, 
  onClose, 
  onSuspendConfirmed, 
  userName, 
  userId, 
  currentUserEmail,
  loading = false
}) {
  const [formData, setFormData] = useState({
    reason: '',
    duration: '7'
  });
  const [localError, setLocalError] = useState('');
  const [touched, setTouched] = useState(false);
  const { suspendUser, error } = useUserSuspension();

  const durationOptions = [
    { value: '1', label: '1 día' },
    { value: '3', label: '3 días' },
    { value: '7', label: '7 días' },
    { value: '30', label: '30 días' },
    { value: 'permanent', label: 'Permanente' }
  ];

  // Función de validación
  const validateReason = (reason) => {
    const trimmedReason = reason.trim();
    
    if (!trimmedReason) {
      return 'Debes proporcionar un motivo para la suspensión';
    }
    
    if (trimmedReason.length < 10) {
      return 'El motivo debe tener al menos 10 caracteres';
    }
    
    if (trimmedReason.length > 100) {
      return 'El motivo no puede exceder 100 caracteres';
    }
    
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar como tocado
    setTouched(true);
    
    // Validar
    const validationError = validateReason(formData.reason);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError('');

    const result = await suspendUser(
      userId, 
      formData.reason.trim(), 
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
    
    if (localError) setLocalError('');
    
    if (touched) {
      const validationError = validateReason(value);
      setLocalError(validationError);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const validationError = validateReason(formData.reason);
    setLocalError(validationError);
  };

  // Calcular si el botón debe estar deshabilitado
  const isSubmitDisabled = loading || localError || formData.reason.trim().length < 10;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-md mx-2 sm:mx-4 relative max-h-[90vh] sm:max-h-[95vh] flex flex-col">
        {/* Header - Fijo en móvil */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-red-100 flex-shrink-0">
              {loading ? (
                <FaSpinner className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 animate-spin" />
              ) : (
                <FaBan className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {loading ? 'Suspendiendo...' : 'Suspender Usuario'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {userName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50 flex-shrink-0 ml-2"
            aria-label="Cerrar"
          >
            <FaTimes className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            {/* Mostrar errores */}
            {(error || (localError && touched)) && (
              <div className={`mb-3 sm:mb-4 p-3 rounded-lg border ${
                error || localError ? 'bg-red-50 border-red-200' : ''
              }`}>
                <div className="flex items-start gap-2">
                  <FaExclamationCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className={`text-xs sm:text-sm ${
                    error || localError ? 'text-red-700' : ''
                  }`}>
                    {error || localError}
                  </p>
                </div>
              </div>
            )}

            {/* Overlay de carga */}
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 rounded-xl sm:rounded-2xl flex items-center justify-center z-10">
                <div className="text-center">
                  <FaSpinner className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-gray-600">Suspendiendo usuario...</p>
                </div>
              </div>
            )}

            {/* Duración */}
            <div className="mb-4 sm:mb-6">
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FaCalendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  <span className="text-sm">Duración de la suspensión</span>
                </div>
              </label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                disabled={loading}
                className="block w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 disabled:opacity-50"
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Motivo */}
            <div className="mb-4 sm:mb-6">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de la suspensión *
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={loading}
                rows={3}
                maxLength={100}
                className={`block w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 resize-none disabled:opacity-50 ${
                  localError && touched
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-red-500'
                }`}
                placeholder="Describe el motivo (mínimo 10 caracteres, máximo 100)..."
                required
              />
              
              {/* Mensaje de error */}
              {localError && touched && (
                <div className="flex items-center gap-1 mt-1">
                  <FaExclamationCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-xs">{localError}</p>
                </div>
              )}
              
              {/* Contador de caracteres */}
              <div className="flex justify-between items-center mt-1">
                <div className="flex-1 min-w-0">
                  {formData.reason.length > 0 && formData.reason.length < 10 && (
                    <span className="text-xs text-orange-500 truncate">
                      Mínimo 10 caracteres requeridos
                    </span>
                  )}
                </div>
                <p className={`text-xs flex-shrink-0 ${
                  formData.reason.length < 10 ? 'text-red-500' : 
                  formData.reason.length > 80 ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {formData.reason.length}/100
                </p>
              </div>
            </div>

            {/* Advertencia */}
            <div className="border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 bg-red-50 border-red-200">
              <div className="flex items-start gap-2 sm:gap-3">
                <FaExclamationTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-medium text-red-800 mb-1">
                    Acción de moderación importante
                  </h4>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li className="truncate">• El usuario será notificado sobre la suspensión</li>
                    <li className="truncate">• No podrá publicar ni comentar durante la suspensión</li>
                    <li className="truncate">• Esta acción queda registrada en el sistema</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Botones fijos en móvil */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-white rounded-lg transition duration-200 font-medium flex items-center justify-center gap-2 text-sm sm:text-base ${
                isSubmitDisabled
                  ? 'bg-red-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              } order-1 sm:order-2`}
            >
              {loading ? (
                <>
                  <FaSpinner className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span>Suspendiendo...</span>
                </>
              ) : (
                <>
                  <FaBan className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Suspender</span>
                  {formData.reason.trim().length < 10 && (
                    <FaExclamationCircle className="w-3 h-3 sm:w-4 sm:h-4" title="Motivo muy corto" />
                  )}
                </>
              )}
            </button>
          </div>
          
          {/* Mensaje de ayuda */}
          {!loading && isSubmitDisabled && (
            <p className="text-xs text-gray-500 mt-3 text-center sm:text-left">
              {formData.reason.trim().length < 10
                ? 'Escribe al menos 10 caracteres para habilitar el envío'
                : 'Corrige los errores para habilitar el envío'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SuspendUserModal;