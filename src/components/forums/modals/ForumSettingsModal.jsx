import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaGlobe, FaLock, FaUserShield, FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';
import { useForumSettings } from '../hooks/useForumSettings';

function ForumSettingsModal({ isOpen, onClose, forum, onSettingsUpdated }) {
  const [formData, setFormData] = useState({
    description: '',
    membershipSettings: {
      requiresApproval: false
    },
    requiresPostApproval: false
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showGeneralError, setShowGeneralError] = useState(false);
  
  const { updateForumSettings, loading, error } = useForumSettings();

  useEffect(() => {
    if (forum) {
      setFormData({
        description: forum.description || '',
        membershipSettings: {
          requiresApproval: forum.membershipSettings?.requiresApproval || false
        },
        requiresPostApproval: forum.requiresPostApproval || false
      });
    }
  }, [forum]);

  // Validaciones
  const validateField = (name, value) => {
    switch (name) {
      case 'description':
        if (!value.trim()) return 'La descripción es requerida';
        if (value.trim().length < 10) return 'La descripción debe tener al menos 10 caracteres';
        if (value.trim().length > 500) return 'La descripción no puede exceder 500 caracteres';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    newErrors.description = validateField('description', formData.description);
    
    setErrors(newErrors);
    
    // Retornar si hay errores
    return !newErrors.description;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si ya se mostró el error general y el usuario está corrigiendo, ocultarlo
    if (showGeneralError) {
      setShowGeneralError(false);
    }
    
    // Validar en tiempo real solo si el campo ya fue tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar el campo como tocado
    setTouched({ description: true });
    
    // Validar formulario completo
    if (!validateForm()) {
      // Mostrar el mensaje de error general
      setShowGeneralError(true);
      
      // Scroll al error
      const firstErrorElement = document.querySelector('.error-message');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      
      return;
    }

    const result = await updateForumSettings(forum.id, formData);
    if (result.success) {
      if (onSettingsUpdated) {
        onSettingsUpdated();
      }
      onClose();
      // Resetear estados al cerrar
      setErrors({});
      setTouched({});
      setShowGeneralError(false);
    }
  };

  // Resetear estados al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setTouched({});
      setShowGeneralError(false);
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Contenedor principal con max-height y overflow */}
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fijo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">Configuración de Comunidad</h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="max-h-[calc(80vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Mensaje de error general - SOLO cuando se intenta enviar con errores */}
            {showGeneralError && errors.description && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg error-message">
                <div className="flex items-center gap-2 mb-2">
                  <FaExclamationCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-red-800 font-medium text-sm">Completa el campo requerido</span>
                </div>
                <ul className="text-red-700 text-sm space-y-1">
                  {errors.description && <li>• {errors.description}</li>}
                </ul>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Descripción */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción de la comunidad *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={handleBlur}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 resize-none ${
                  errors.description && touched.description 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                maxLength={500}
                placeholder="Describe el propósito y temas de esta comunidad (mínimo 10 caracteres)..."
                required
              />
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-1">
                  {errors.description && touched.description && (
                    <>
                      <FaExclamationCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <p className="text-red-600 text-xs">{errors.description}</p>
                    </>
                  )}
                </div>
                <p className={`text-xs ${
                  formData.description.length < 10 ? 'text-red-500' : 
                  formData.description.length > 450 ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {formData.description.length}/500 caracteres
                </p>
              </div>
            </div>

            {/* Configuración de Membresía */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Configuración de Membresía
              </label>
              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition duration-200 ${
                  !formData.membershipSettings.requiresApproval 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="membershipType"
                    checked={!formData.membershipSettings.requiresApproval}
                    onChange={() => setFormData(prev => ({ 
                      ...prev, 
                      membershipSettings: { requiresApproval: false }
                    }))}
                    className="text-blue-600 focus:ring-blue-500 mt-1"
                  />
                  <FaGlobe className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Entrada Libre</p>
                    <p className="text-sm text-gray-600 mt-1">Cualquier usuario puede unirse directamente sin necesidad de aprobación</p>
                  </div>
                </label>
                
                <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition duration-200 ${
                  formData.membershipSettings.requiresApproval 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="membershipType"
                    checked={formData.membershipSettings.requiresApproval}
                    onChange={() => setFormData(prev => ({ 
                      ...prev, 
                      membershipSettings: { requiresApproval: true }
                    }))}
                    className="text-blue-600 focus:ring-blue-500 mt-1"
                  />
                  <FaLock className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Requiere Aprobación</p>
                    <p className="text-sm text-gray-600 mt-1">Los usuarios solicitan unirse y necesitan aprobación de un moderador</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Validación de Posts */}
            <div className="mb-6">
              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition duration-200 ${
                formData.requiresPostApproval 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.requiresPostApproval}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiresPostApproval: e.target.checked }))}
                  className="text-blue-600 focus:ring-blue-500 rounded mt-1"
                />
                <FaUserShield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Validación de publicaciones</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Los posts de miembros regulares requieren aprobación de moderadores.
                    <br />
                    <span className="text-blue-600 font-medium">Moderadores y dueños pueden publicar sin validación.</span>
                  </p>
                </div>
              </label>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Configuración de moderación</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Los cambios se aplican inmediatamente</li>
                    <li>• La validación de posts ayuda a mantener la calidad del contenido</li>
                    <li>• Las comunidades con aprobación son ideales para grupos especializados</li>
                    <li>• Siempre puedes cambiar esta configuración después</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer fijo con botones */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0 rounded-b-2xl">
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
              onClick={handleSubmit}
              disabled={loading || (errors.description && touched.description)}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForumSettingsModal;