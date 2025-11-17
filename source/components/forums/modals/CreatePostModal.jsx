// components/modals/CreatePostModal.jsx
import { useState } from 'react';
import { FaTimes, FaSpinner, FaImage, FaPaperclip } from 'react-icons/fa';

function CreatePostModal({ isOpen, onClose, defaultForum = '' }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    forum: defaultForum,
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('El título y contenido son obligatorios');
      return;
    }

    if (formData.content.length < 10) {
      setError('El contenido debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Integrar con Firebase para guardar el post
      console.log('Creando post:', formData);
      
      // Simular delay de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('¡Publicación creada exitosamente!');
      onClose();
      setFormData({
        title: '',
        content: '',
        forum: defaultForum,
        tags: ''
      });
    } catch (error) {
      setError('Error al crear la publicación');
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
          <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Publicación</h2>
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

            {/* Título */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título de la publicación *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={loading}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 disabled:opacity-50"
                placeholder="Escribe un título claro y descriptivo..."
                required
              />
            </div>

            {/* Contenido */}
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Contenido *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                disabled={loading}
                rows={12}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none disabled:opacity-50"
                placeholder="Comparte tu conocimiento, experiencia, pregunta o caso clínico. Sé claro y profesional en tu redacción."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 10 caracteres. Usa un lenguaje profesional y respetuoso.
              </p>
            </div>

            {/* Etiquetas */}
            <div className="mb-6">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Etiquetas (opcional)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                disabled={loading}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 disabled:opacity-50"
                placeholder="Ej: cardiología, hipertensión, tratamiento..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Separa las etiquetas con comas. Ayudan a otros a encontrar tu publicación.
              </p>
            </div>

            {/* Herramientas adicionales */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Herramientas adicionales</h4>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 disabled:opacity-50"
                >
                  <FaImage className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">Imagen</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 disabled:opacity-50"
                >
                  <FaPaperclip className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">Archivo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Tu publicación será visible para todos los miembros de la comunidad.
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
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
                  {loading ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;