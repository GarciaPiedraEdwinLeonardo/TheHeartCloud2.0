import { useState } from 'react';
import { FaTimes, FaSpinner, FaUsers, FaInfoCircle, FaLock, FaUnlock } from 'react-icons/fa';
import { useForumActions } from './../hooks/useForumsActions';

function CreateForumModal({ isOpen, onClose, onForumCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '• Respeto hacia todos los miembros\n• Contenido médico verificado\n• No spam ni autopromoción\n• Confidencialidad de pacientes\n• Lenguaje profesional',
    requiresApproval: false  // NUEVO: Por defecto entrada libre
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { createForum } = useForumActions();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('El nombre y descripción son obligatorios');
      return;
    }

    if (formData.name.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (formData.description.length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createForum(formData);
      
      if (result.success) {
        if (onForumCreated) {
          onForumCreated(result.forum);
        }
        onClose();
        setFormData({
          name: '',
          description: '',
          rules: '• Respeto hacia todos los miembros\n• Contenido médico verificado\n• No spam ni autopromoción\n• Confidencialidad de pacientes\n• Lenguaje profesional',
          requiresApproval: false
        });
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error creando comunidad:', error);
      setError('Error al crear la comunidad. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Comunidad</h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(90vh-80px)]">
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Nombre de la Comunidad */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Comunidad *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 disabled:opacity-50"
                placeholder="Ej: Cardiología Avanzada, Diabetes Tipo 1..."
                maxLength={50}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.name.length}/50 caracteres
              </p>
            </div>

            {/* Descripción */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={loading}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none disabled:opacity-50"
                placeholder="Describe el propósito, enfoque y temas que se discutirán en esta comunidad..."
                maxLength={500}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500 caracteres
              </p>
            </div>

            {/* NUEVO: Configuración de Membresía */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Configuración de Membresía
              </label>
              
              <div className="space-y-4">
                {/* Opción 1: Entrada libre */}
                <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition duration-200 ${
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
                      <FaUnlock className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Entrada Libre</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Los usuarios pueden unirse directamente sin necesidad de aprobación.
                    </p>
                  </div>
                </label>

                {/* Opción 2: Requiere aprobación */}
                <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition duration-200 ${
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
                      <FaLock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-900">Requiere Aprobación</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Los usuarios solicitan unirse y necesitan aprobación de un moderador.
                    </p>
                  </div>
                </label>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                {formData.requiresApproval 
                  ? 'Los usuarios enviarán solicitudes que deberás aprobar manualmente.'
                  : 'Cualquier usuario verificado podrá unirse automáticamente.'
                }
              </p>
            </div>

            {/* Reglas de la Comunidad */}
            <div className="mb-6">
              <label htmlFor="rules" className="block text-sm font-medium text-gray-700 mb-2">
                Reglas de la Comunidad
              </label>
              <textarea
                id="rules"
                name="rules"
                value={formData.rules}
                onChange={handleInputChange}
                disabled={loading}
                rows={6}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none disabled:opacity-50"
                placeholder="Establece las reglas básicas para los miembros de tu comunidad..."
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.rules.length}/1000 caracteres. Las reglas ayudan a mantener un ambiente profesional.
              </p>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Información importante</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Serás el dueño y primer moderador de la comunidad</li>
                    <li>• Puedes agregar más moderadores después</li>
                    <li>• Eres responsable del contenido en tu comunidad</li>
                    <li>• Las comunidades deben seguir las normas de TheHeartCloud</li>
                    <li>• {formData.requiresApproval 
                      ? 'Aprobarás manualmente las solicitudes de membresía' 
                      : 'Los usuarios podrán unirse libremente'
                    }</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Tu comunidad será pública y visible para todos los usuarios.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <FaUsers className="w-4 h-4" />
                      Crear Comunidad
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateForumModal;