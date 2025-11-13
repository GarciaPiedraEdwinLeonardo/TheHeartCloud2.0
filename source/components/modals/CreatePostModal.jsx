import { useState, useRef } from 'react';
import { 
  FaTimes, 
  FaImage, 
  FaPaperclip, 
  FaBold, 
  FaItalic, 
  FaListUl, 
  FaListOl,
  FaLink,
  FaCode
} from 'react-icons/fa';

function CreatePostModal({ 
  isOpen, 
  onClose,
  currentTheme // Tema actual donde se está creando el post
}) {
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const textareaRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'contenido') {
      setCharacterCount(value.length);
    }
  };

  // Funciones para formatear texto
  const insertTextAtCursor = (textBefore, textAfter = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const newText = textBefore + selectedText + textAfter;
    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    
    setFormData(prev => ({
      ...prev,
      contenido: newValue
    }));

    // Restaurar el foco y posición del cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textBefore.length, start + textBefore.length + selectedText.length);
    }, 0);
  };

  const formatText = (type) => {
    const formats = {
      bold: ['**', '**'],
      italic: ['_', '_'],
      bulletList: ['- ', ''],
      numberedList: ['1. ', ''],
      link: ['[', '](https://)'],
      code: ['`', '`']
    };

    if (formats[type]) {
      insertTextAtCursor(formats[type][0], formats[type][1]);
    }
  };

  const handleFileUpload = (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : '*';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (type === 'image') {
          insertTextAtCursor(`![${file.name}](/ruta/a/imagen)`);
        } else {
          insertTextAtCursor(`[${file.name}](/ruta/a/archivo)`);
        }
      }
    };
    
    input.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || !formData.contenido.trim()) {
      alert('Por favor completa el título y contenido');
      return;
    }

    if (formData.contenido.length < 10) {
      alert('El contenido debe tener al menos 10 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      // Aquí iría la lógica para crear el post
      const postData = {
        ...formData,
        tema: currentTheme,
        fecha: new Date().toISOString()
      };

      console.log('Creando post:', postData);
      
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('¡Post creado exitosamente!');
      handleClose();
      
    } catch (error) {
      console.error('Error al crear post:', error);
      alert('Error al crear el post. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      titulo: '',
      contenido: ''
    });
    setCharacterCount(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Crear Publicación
            </h2>
            {currentTheme && (
              <p className="text-sm text-gray-600 mt-1">
                En: <span className="font-semibold text-blue-600">{currentTheme}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            disabled={isSubmitting}
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Título */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Escribe un título claro y descriptivo..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
              maxLength={120}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.titulo.length}/120 caracteres
            </p>
          </div>

          {/* Contenido con barra de herramientas */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido <span className="text-red-500">*</span>
            </label>
            
            {/* Barra de herramientas */}
            <div className="flex flex-wrap gap-1 p-3 bg-gray-50 border border-gray-300 rounded-t-lg">
              {/* Formato de texto */}
              <button
                type="button"
                onClick={() => formatText('bold')}
                className="p-2 hover:bg-gray-200 rounded transition duration-200"
                title="Negrita"
              >
                <FaBold className="w-4 h-4 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => formatText('italic')}
                className="p-2 hover:bg-gray-200 rounded transition duration-200"
                title="Itálica"
              >
                <FaItalic className="w-4 h-4 text-gray-600" />
              </button>
              
              {/* Listas */}
              <button
                type="button"
                onClick={() => formatText('bulletList')}
                className="p-2 hover:bg-gray-200 rounded transition duration-200"
                title="Lista con viñetas"
              >
                <FaListUl className="w-4 h-4 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => formatText('numberedList')}
                className="p-2 hover:bg-gray-200 rounded transition duration-200"
                title="Lista numerada"
              >
                <FaListOl className="w-4 h-4 text-gray-600" />
              </button>
              
              {/* Separador */}
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              {/* Multimedia */}
              <button
                type="button"
                onClick={() => handleFileUpload('image')}
                className="p-2 hover:bg-gray-200 rounded transition duration-200"
                title="Insertar imagen"
              >
                <FaImage className="w-4 h-4 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => handleFileUpload('file')}
                className="p-2 hover:bg-gray-200 rounded transition duration-200"
                title="Insertar archivo"
              >
                <FaPaperclip className="w-4 h-4 text-gray-600" />
              </button>
              
              {/* Enlaces y código */}
              <button
                type="button"
                onClick={() => formatText('link')}
                className="p-2 hover:bg-gray-200 rounded transition duration-200"
                title="Insertar enlace"
              >
                <FaLink className="w-4 h-4 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => formatText('code')}
                className="p-2 hover:bg-gray-200 rounded transition duration-200"
                title="Insertar código"
              >
                <FaCode className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Área de texto */}
            <textarea
              ref={textareaRef}
              name="contenido"
              value={formData.contenido}
              onChange={handleInputChange}
              placeholder="Comparte tus conocimientos, experiencias, casos clínicos, preguntas... Usa las herramientas de arriba para formatear tu texto."
              className="w-full px-4 py-3 border border-gray-300 border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={12}
              maxLength={5000}
              required
            />
            
            {/* Contadores y ayuda */}
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <div>
                <span>Mínimo 10 caracteres</span>
                <span className="mx-2">•</span>
                <span>Soporta Markdown básico</span>
              </div>
              <span className={characterCount > 4500 ? 'text-red-500 font-medium' : ''}>
                {characterCount}/5000 caracteres
              </span>
            </div>

            {/* Preview de Markdown (opcional) */}
            {formData.contenido.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Vista previa:</h4>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {formData.contenido}
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.titulo.trim() || !formData.contenido.trim() || formData.contenido.length < 10}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;