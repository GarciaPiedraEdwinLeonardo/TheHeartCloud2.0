import { useState, useRef, useEffect, useCallback } from 'react';
import { FaTimes, FaSpinner, FaUsers, FaInfoCircle, FaLock, FaUnlock, FaExclamationCircle, FaCheck, FaSync } from 'react-icons/fa';
import { useForumActions } from './../hooks/useForumsActions';
import { toast } from 'react-hot-toast';
import debounce from 'lodash/debounce';

function CreateForumModal({ isOpen, onClose, onForumCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '• Respeto hacia todos los miembros\n• Contenido médico verificado\n• No spam ni autopromoción\n• Confidencialidad de pacientes\n• Lenguaje profesional',
    requiresApproval: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showGeneralError, setShowGeneralError] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [nameExistsError, setNameExistsError] = useState('');
  
  const { createForum, checkForumNameExists } = useForumActions();

  const nameRef = useRef(null);
  const descriptionRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setTouched({});
      setShowGeneralError(false);
      setNameExistsError('');
      setTimeout(() => {
        nameRef.current?.focus();
      }, 100);
    } else {
      setFormData({
        name: '',
        description: '',
        rules: '• Respeto hacia todos los miembros\n• Contenido médico verificado\n• No spam ni autopromoción\n• Confidencialidad de pacientes\n• Lenguaje profesional',
        requiresApproval: false
      });
    }
  }, [isOpen]);

  // Función debounced para verificar nombre en tiempo real
  const debouncedCheckName = useCallback(
  debounce(async (name) => {
    const trimmedName = name.trim();
    
    if (trimmedName.length < 3) {
      setNameExistsError('');
      return;
    }

    const nameError = validateField('name', trimmedName);
    if (nameError) {
      setNameExistsError('');
      return;
    }

    setCheckingName(true);
    try {
      const result = await checkForumNameExists(trimmedName);
      if (result.exists) {
        setNameExistsError(`Ya existe una comunidad llamada "${result.existingForumName}"`);
      } else {
        setNameExistsError('');
      }
    } catch (error) {
      console.error('Error verificando nombre:', error);
      setNameExistsError('');
    } finally {
      setCheckingName(false);
    }
  }, 700),
  []
);

  useEffect(() => {
    return () => {
      debouncedCheckName.cancel();
    };
  }, [debouncedCheckName]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'El nombre de la comunidad es obligatorio';
        if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
        if (value.trim().length > 50) return 'El nombre no puede exceder 50 caracteres';
        if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ0-9\s\-\.,!¡¿?()]+$/.test(value)) {
          return 'El nombre contiene caracteres no permitidos';
        }
        return '';
      
      case 'description':
        if (!value.trim()) return 'La descripción es obligatoria';
        if (value.trim().length < 10) return 'La descripción debe tener al menos 10 caracteres';
        if (value.trim().length > 500) return 'La descripción no puede exceder 500 caracteres';
        return '';
      
      case 'rules':
        if (value.trim().length > 1000) return 'Las reglas no pueden exceder 1000 caracteres';
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    newErrors.name = validateField('name', formData.name);
    newErrors.description = validateField('description', formData.description);
    newErrors.rules = validateField('rules', formData.rules);
    
    setErrors(newErrors);
    
    return !newErrors.name && !newErrors.description && !newErrors.rules && !nameExistsError;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }

    if (showGeneralError && errors[name]) {
      const error = validateField(name, newValue);
      if (!error) {
        setShowGeneralError(false);
      }
    }

    // Verificar nombre en tiempo real
    if (name === 'name') {
      // Limpiar error de nombre existente si el usuario está editando
      if (nameExistsError) {
        setNameExistsError('');
      }
      // Verificar con debounce
      debouncedCheckName(newValue);
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

    // Verificar nombre al perder el foco (última verificación)
    if (name === 'name' && value.trim().length >= 3 && !error) {
      debouncedCheckName(value);
    }
  };

  const handleSubmit = async () => {
    const allTouched = {
      name: true,
      description: true,
      rules: true
    };
    setTouched(allTouched);
    
    // Verificar nombre una última vez antes de enviar
    if (formData.name.trim().length >= 3) {
      setCheckingName(true);
      try {
        const result = await checkForumNameExists(formData.name);
        if (result.exists) {
          setNameExistsError(`Ya existe una comunidad llamada "${result.existingForumName}"`);
          setShowGeneralError(true);
          nameRef.current?.focus();
          setCheckingName(false);
          return;
        }
      } catch (error) {
        console.error('Error en verificación final:', error);
      } finally {
        setCheckingName(false);
      }
    }
    
    if (!validateForm()) {
      setShowGeneralError(true);
      
      // Enfocar en el primer campo con error
      if (nameExistsError) {
        nameRef.current?.focus();
      } else if (errors.name) {
        nameRef.current?.focus();
      } else if (errors.description) {
        descriptionRef.current?.focus();
      }
      
      const firstErrorElement = document.querySelector('.error-message');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      
      return;
    }

    setLoading(true);

    try {
      const result = await createForum(formData);
      
      if (result.success) {
        toast.success('¡Comunidad creada exitosamente!');
        if (onForumCreated) {
          onForumCreated(result.forum);
        }
        onClose();
      } else {
        // Si el error es por nombre duplicado (por si acaso)
        if (result.error && result.error.includes('Ya existe')) {
          setNameExistsError(result.error);
          nameRef.current?.focus();
        }
        toast.error(result.error || 'Error al crear la comunidad');
      }
    } catch (error) {
      console.error('Error creando comunidad:', error);
      toast.error('Error al crear la comunidad. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div 
        className="bg-white rounded-lg sm:rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Crear Nueva Comunidad</h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50"
          >
            <FaTimes className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(95vh-64px)] sm:h-[calc(90vh-80px)]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Mensaje de error general */}
            {showGeneralError && (errors.name || errors.description || errors.rules || nameExistsError) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg error-message">
                <div className="flex items-center gap-2 mb-2">
                  <FaExclamationCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-red-800 font-medium text-sm">Completa los campos requeridos</span>
                </div>
                <ul className="text-red-700 text-xs sm:text-sm space-y-1">
                  {nameExistsError && <li>• {nameExistsError}</li>}
                  {errors.name && <li>• {errors.name}</li>}
                  {errors.description && <li>• {errors.description}</li>}
                  {errors.rules && <li>• {errors.rules}</li>}
                </ul>
              </div>
            )}

            {/* Nombre de la Comunidad */}
            <div className="mb-4 sm:mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Comunidad *
              </label>
              <div className="relative">
                <input
                  ref={nameRef}
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  className={`block w-full pl-3 pr-10 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition duration-200 disabled:opacity-50 ${
                    (errors.name && touched.name) || nameExistsError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Ej: Cardiología Avanzada..."
                  maxLength={50}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {checkingName && (
                    <FaSync className="w-4 h-4 text-gray-400 animate-spin" />
                  )}
                  {!checkingName && formData.name.trim().length >= 3 && !nameExistsError && !errors.name && (
                    <FaCheck className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-1">
                  {nameExistsError && (
                    <>
                      <FaExclamationCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <p className="text-red-600 text-xs">{nameExistsError}</p>
                    </>
                  )}
                  {!nameExistsError && errors.name && touched.name && (
                    <>
                      <FaExclamationCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <p className="text-red-600 text-xs">{errors.name}</p>
                    </>
                  )}
                  {!nameExistsError && !errors.name && formData.name.trim().length >= 3 && (
                    <div className="flex items-center gap-1">
                      <FaCheck className="w-3 h-3 text-green-500" />
                      <p className="text-green-600 text-xs">Nombre disponible</p>
                    </div>
                  )}
                </div>
                <p className={`text-xs ${
                  formData.name.length < 3 ? 'text-red-500' : 
                  formData.name.length > 40 ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {formData.name.length}/50
                </p>
              </div>
            </div>

            {/* Descripción */}
            <div className="mb-4 sm:mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                ref={descriptionRef}
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={loading}
                rows={3}
                className={`block w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition duration-200 resize-none disabled:opacity-50 ${
                  errors.description && touched.description 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="Describe el propósito y temas..."
                maxLength={500}
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
                  formData.description.length > 400 ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {formData.description.length}/500
                </p>
              </div>
            </div>

            {/* Configuración de Membresía */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4">
                Configuración de Membresía
              </label>
              
              <div className="space-y-3 sm:space-y-4">
                {/* Opción 1: Entrada libre */}
                <label className={`flex items-start p-3 sm:p-4 border rounded-lg cursor-pointer transition duration-200 ${
                  !formData.requiresApproval
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      type="radio"
                      name="requiresApproval"
                      checked={!formData.requiresApproval}
                      onChange={() => setFormData(prev => ({ ...prev, requiresApproval: false }))}
                      disabled={loading}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FaUnlock className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900">Entrada Libre</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Los usuarios pueden unirse directamente sin aprobación.
                    </p>
                  </div>
                </label>

                {/* Opción 2: Requiere aprobación */}
                <label className={`flex items-start p-3 sm:p-4 border rounded-lg cursor-pointer transition duration-200 ${
                  formData.requiresApproval
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      type="radio"
                      name="requiresApproval"
                      checked={formData.requiresApproval}
                      onChange={() => setFormData(prev => ({ ...prev, requiresApproval: true }))}
                      disabled={loading}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FaLock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900">Requiere Aprobación</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Los usuarios necesitan aprobación de un moderador.
                    </p>
                  </div>
                </label>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                {formData.requiresApproval 
                  ? 'Aprobarás solicitudes manualmente.'
                  : 'Usuarios verificados se unirán automáticamente.'
                }
              </p>
            </div>

            {/* Reglas de la Comunidad */}
            <div className="mb-4 sm:mb-6">
              <label htmlFor="rules" className="block text-sm font-medium text-gray-700 mb-2">
                Reglas de la Comunidad
              </label>
              <textarea
                id="rules"
                name="rules"
                value={formData.rules}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={loading}
                rows={5}
                className={`block w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition duration-200 resize-none disabled:opacity-50 ${
                  errors.rules && touched.rules 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="Establece las reglas básicas..."
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-1">
                  {errors.rules && touched.rules && (
                    <>
                      <FaExclamationCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <p className="text-red-600 text-xs">{errors.rules}</p>
                    </>
                  )}
                </div>
                <p className={`text-xs ${
                  formData.rules.length > 900 ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {formData.rules.length}/1000
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Las reglas ayudan a mantener un ambiente profesional.
              </p>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <FaInfoCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-2">Información importante</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Serás el dueño y primer moderador</li>
                    <li>• Puedes agregar más moderadores después</li>
                    <li>• Eres responsable del contenido</li>
                    <li>• Seguir normas de TheHeartCloud</li>
                    <li>• {formData.requiresApproval 
                      ? 'Aprobarás solicitudes manualmente' 
                      : 'Los usuarios se unirán libremente'
                    }</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                Tu comunidad será pública y visible.
              </p>
              <div className="flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-sm sm:text-base bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || checkingName || nameExistsError}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      <span className="hidden sm:inline">Creando...</span>
                      <span className="sm:hidden">Creando</span>
                    </>
                  ) : (
                    <>
                      <FaUsers className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Crear Comunidad</span>
                      <span className="sm:hidden">Crear</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateForumModal;