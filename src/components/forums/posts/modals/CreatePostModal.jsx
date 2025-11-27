import { useState } from 'react';
import { FaTimes, FaSpinner, FaImage, FaPaperclip, FaUserShield } from 'react-icons/fa';
import { usePostActions } from './../hooks/usePostActions';
import { usePostUpload } from './../hooks/usePostUpload';

function CreatePostModal({ isOpen, onClose, forumId, forumName, requiresPostApproval, canPostWithoutApproval }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { createPost } = usePostActions();
  const { uploadImage, uploading: imageUploading } = usePostUpload();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 1) {
      setError('Máximo 1 imagen');
      return;
    }

    for (const file of files) {
      const result = await uploadImage(file);
      if (result.success) {
        setImages(prev => [...prev, result.image]);
      }
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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
    setError('');

    try {
      // Determinar el estado del post basado en la configuración y permisos
      const postStatus = requiresPostApproval && !canPostWithoutApproval ? 'pending' : 'active';

      const result = await createPost({
        ...formData,
        forumId: forumId,
        images: images,
        status: postStatus // Agregar el estado del post
      });

      if (result.success) {
        onClose();
        setFormData({ title: '', content: '' });
        setImages([]);
        
        // Mostrar mensaje diferente si requiere aprobación
        if (requiresPostApproval && !canPostWithoutApproval) {
          alert('✅ Tu publicación ha sido enviada y está pendiente de aprobación por un moderador.');
        } else {
          alert('✅ Publicación creada exitosamente.');
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error al crear la publicación');
    } finally {
      setLoading(false);
    }
  };

  // Prevenir scroll del body
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 truncate">Crear Publicación</h2>
            <p className="text-sm text-gray-600 mt-1 truncate">En {forumName}</p>
            {requiresPostApproval && !canPostWithoutApproval && (
              <div className="flex items-center gap-2 mt-2 text-amber-600 text-sm">
                <FaUserShield className="w-4 h-4" />
                <span>Tu publicación requerirá aprobación de un moderador</span>
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50 flex-shrink-0 ml-2"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(100vh-100px)]">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Título */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
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
                  maxLength={200}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/200 caracteres
                </p>
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
                  rows={8}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none disabled:opacity-50"
                  placeholder="Comparte tu conocimiento, experiencia, pregunta o caso clínico..."
                  maxLength={10000}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.content.length}/10000 caracteres (mínimo 10)
                </p>
              </div>

              {/* Imágenes subidas */}
              {images.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imágenes ({images.length}/1)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subir imágenes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agregar imágenes (opcional)
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 cursor-pointer disabled:opacity-50">
                    <FaImage className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Subir imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={loading || imageUploading || images.length >= 1}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Máximo 1 imágen. Formatos: JPEG, PNG, WebP. Tamaño máximo: 2MB por imagen.
                </p>
              </div>

              {/* Información de validación */}
              {requiresPostApproval && !canPostWithoutApproval && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FaUserShield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800 mb-1">Publicación pendiente de aprobación</h4>
                      <p className="text-xs text-amber-700">
                        Tu publicación será revisada por un moderador antes de ser visible para la comunidad. 
                        Recibirás una notificación cuando sea aprobada.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer con botones */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0 rounded-b-2xl">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {requiresPostApproval && !canPostWithoutApproval 
                  ? 'Tu publicación será revisada antes de ser visible'
                  : 'Tu publicación será visible para todos los miembros de la comunidad'
                }
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
                  disabled={loading || imageUploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {(loading || imageUploading) && <FaSpinner className="w-4 h-4 animate-spin" />}
                  {loading ? 'Publicando...' : imageUploading ? 'Subiendo...' : (
                    requiresPostApproval && !canPostWithoutApproval ? 'Enviar para Aprobación' : 'Publicar'
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

export default CreatePostModal;