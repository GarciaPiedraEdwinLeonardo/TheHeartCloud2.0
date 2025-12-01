import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaSpinner, FaImage, FaExclamationCircle } from 'react-icons/fa';
import { usePostActions } from './../hooks/usePostActions';
import { usePostUpload } from './../hooks/usePostUpload';
import { toast } from 'react-hot-toast';

function EditPostModal({ isOpen, onClose, post, onPostUpdated }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showGeneralError, setShowGeneralError] = useState(false);
  
  const { editPost } = usePostActions();
  const { uploadImage, uploading: imageUploading } = usePostUpload();

  // Refs para focus automático
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  // Inicializar formData cuando el post cambia
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
      });
      setImages(post.images || []);
      setErrors({});
      setTouched({});
      setShowGeneralError(false);
    }
  }, [post]);

  // Validaciones
  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'El título es obligatorio';
        if (value.trim().length < 5) return 'El título debe tener al menos 5 caracteres';
        if (value.trim().length > 200) return 'El título no puede exceder 200 caracteres';
        if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ0-9\s\-\.,!¡¿?()":]+$/.test(value)) {
          return 'El título contiene caracteres no permitidos';
        }
        return '';
      
      case 'content':
        if (!value.trim()) return 'El contenido es obligatorio';
        if (value.trim().length < 10) return 'El contenido debe tener al menos 10 caracteres';
        if (value.trim().length > 10000) return 'El contenido no puede exceder 10000 caracteres';
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    newErrors.title = validateField('title', formData.title);
    newErrors.content = validateField('content', formData.content);
    
    setErrors(newErrors);
    
    return !newErrors.title && !newErrors.content;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validar en tiempo real solo si el campo ya fue tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }

    // Ocultar el mensaje de error general cuando el usuario empiece a corregir
    if (showGeneralError && errors[name]) {
      const error = validateField(name, value);
      if (!error) {
        setShowGeneralError(false);
      }
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 1) {
      toast.error('Máximo 1 imagen permitida');
      return;
    }

    for (const file of files) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Formato de imagen no permitido. Use JPEG, PNG o WebP');
        continue;
      }

      // Validar tamaño (2MB)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('La imagen no puede pesar más de 2MB');
        continue;
      }

      const result = await uploadImage(file);
      if (result.success) {
        setImages(prev => [...prev, result.image]);
        toast.success('Imagen subida exitosamente');
      } else {
        toast.error(result.error || 'Error al subir la imagen');
      }
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    const allTouched = {
      title: true,
      content: true
    };
    setTouched(allTouched);
    
    // Validar formulario completo
    if (!validateForm()) {
      // Mostrar mensaje de error general solo al enviar
      setShowGeneralError(true);
      
      // Encontrar el primer campo con error y hacer focus
      if (errors.title) {
        titleRef.current?.focus();
      } else if (errors.content) {
        contentRef.current?.focus();
      }
      
      // Scroll al primer error
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
      const result = await editPost(post.id, {
        title: formData.title,
        content: formData.content,
        images: images
      });

      if (result.success) {
        toast.success('Publicación actualizada exitosamente');
        if (onPostUpdated) {
          onPostUpdated();
        }
        onClose();
      } else {
        toast.error(result.error || 'Error al actualizar la publicación');
      }
    } catch (error) {
      toast.error('Error al actualizar la publicación');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Publicación</h2>
            <p className="text-sm text-gray-600 mt-1">Actualiza tu contenido</p>
          </div>
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
            {/* Mensaje de error general - SOLO al enviar */}
            {showGeneralError && (errors.title || errors.content) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg error-message">
                <div className="flex items-center gap-2 mb-2">
                  <FaExclamationCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-red-800 font-medium text-sm">Completa los campos requeridos</span>
                </div>
                <ul className="text-red-700 text-sm space-y-1">
                  {errors.title && <li>• {errors.title}</li>}
                  {errors.content && <li>• {errors.content}</li>}
                </ul>
              </div>
            )}

            {/* Título */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                ref={titleRef}
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={loading}
                className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 disabled:opacity-50 ${
                  errors.title && touched.title 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="Escribe un título claro y descriptivo..."
                maxLength={200}
                required
              />
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-1">
                  {errors.title && touched.title && (
                    <>
                      <FaExclamationCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <p className="text-red-600 text-xs">{errors.title}</p>
                    </>
                  )}
                </div>
                <p className={`text-xs ${
                  formData.title.length < 5 ? 'text-red-500' : 
                  formData.title.length > 180 ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {formData.title.length}/200 caracteres
                </p>
              </div>
            </div>

            {/* Contenido */}
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Contenido *
              </label>
              <textarea
                ref={contentRef}
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={loading}
                rows={8}
                className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 resize-none disabled:opacity-50 ${
                  errors.content && touched.content 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="Comparte tu conocimiento, experiencia, pregunta o caso clínico..."
                maxLength={10000}
                required
              />
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-1">
                  {errors.content && touched.content && (
                    <>
                      <FaExclamationCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <p className="text-red-600 text-xs">{errors.content}</p>
                    </>
                  )}
                </div>
                <p className={`text-xs ${
                  formData.content.length < 10 ? 'text-red-500' : 
                  formData.content.length > 8000 ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {formData.content.length}/10000 caracteres
                </p>
              </div>
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
                        disabled={loading}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
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
                {images.length === 0 ? 'Agregar imagen (opcional)' : 'Reemplazar imagen'}
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 cursor-pointer disabled:opacity-50">
                  <FaImage className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">
                    {images.length === 0 ? 'Subir imagen' : 'Cambiar imagen'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleImageUpload}
                    disabled={loading || imageUploading}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Máximo 1 imagen. Formatos: JPEG, PNG, WebP. Tamaño máximo: 2MB.
              </p>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Los cambios se aplicarán inmediatamente.
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
                  {loading ? 'Guardando...' : imageUploading ? 'Subiendo...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPostModal;
