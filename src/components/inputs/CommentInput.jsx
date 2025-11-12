import { useState } from 'react';
import { FaPaperPlane, FaImage, FaPaperclip } from 'react-icons/fa';

function CommentInput({ onSubmit, placeholder = "Escribe tu comentario...", buttonText = "Enviar", autoFocus = false }) {
  const [contenido, setContenido] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!contenido.trim()) {
      alert('Por favor escribe un comentario');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(contenido.trim());
      setContenido('');
    } catch (error) {
      console.error('Error al enviar comentario:', error);
      alert('Error al enviar el comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (type) => {
    // Lógica para subir archivos
    console.log('Subir archivo:', type);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Área de texto */}
      <textarea
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows={3}
        autoFocus={autoFocus}
      />

      {/* Barra de herramientas y botón */}
      <div className="flex items-center justify-between">
        {/* Herramientas */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleFileUpload('image')}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition duration-200"
            title="Insertar imagen"
          >
            <FaImage className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleFileUpload('file')}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition duration-200"
            title="Insertar archivo"
          >
            <FaPaperclip className="w-4 h-4" />
          </button>
        </div>

        {/* Botón de enviar */}
        <button
          type="submit"
          disabled={isSubmitting || !contenido.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPaperPlane className="w-4 h-4" />
          <span>{isSubmitting ? 'Enviando...' : buttonText}</span>
        </button>
      </div>
    </form>
  );
}

export default CommentInput;