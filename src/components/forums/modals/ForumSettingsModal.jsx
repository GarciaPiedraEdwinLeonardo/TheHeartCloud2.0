import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaGlobe, FaLock, FaUserShield, FaInfoCircle, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import { useForumSettings } from '../hooks/useForumSettings';
import { toast } from 'react-hot-toast';

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
  const [showPostApprovalWarning, setShowPostApprovalWarning] = useState(false);
  
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

  // Detectar cuando se desactiva la validación de posts
  useEffect(() => {
    if (forum) {
      const wasRequiringApproval = forum.requiresPostApproval || false;
      const willRequireApproval = formData.requiresPostApproval || false;
      
      // Mostrar advertencia si se está desactivando
      if (wasRequiringApproval && !willRequireApproval) {
        setShowPostApprovalWarning(true);
      } else {
        setShowPostApprovalWarning(false);
      }
    }
  }, [formData.requiresPostApproval, forum]);

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
    return !newErrors.description;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (showGeneralError) {
      setShowGeneralError(false);
    }
    
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
    
    setTouched({ description: true });
    
    if (!validateForm()) {
      setShowGeneralError(true);
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
      // Mostrar mensaje especial si se activaron posts
      if (result.postsActivated && result.postsActivated > 0) {
        toast.success(result.message, { duration: 5000 });
      } else {
        toast.success('Configuración actualizada exitosamente');
      }
      
      if (onSettingsUpdated) {
        onSettingsUpdated();
      }
      
      onClose();
      setErrors({});
      setTouched({});
      setShowGeneralError(false);
      setShowPostApprovalWarning(false);
    } else {
      toast.error(result.error || 'Error al actualizar la configuración');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setTouched({});
      setShowGeneralError(false);
      setShowPostApprovalWarning(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ margin: 0, padding: 0 }}
    >
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4 overflow-y-auto">
        <div 
          className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8 flex flex-col"
          style={{ maxHeight: 'calc(100vh - 4rem)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">Configuración de Comunidad</h2>
              <p className="text-sm text-gray-600 mt-1">Ajusta las opciones de moderación</p>
            </div>
            <button 
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50 flex-shrink-0 ml-4"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit}>
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

              {/* Advertencia cuando se desactiva validación */}
              {showPostApprovalWarning && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FaCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium text-sm mb-1">Activación automática</p>
                      <p className="text-green-700 text-xs">
                        Todos los posts pendientes de validación serán activados automáticamente cuando guardes los cambios. Los autores recibirán una notificación.
                      </p>
                    </div>
                  </div>
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
                      <li>• Desactivar la validación activa automáticamente posts pendientes</li>
                      <li>• Siempre puedes cambiar esta configuración después</li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
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
    </div>
  );
}

export default ForumSettingsModal;