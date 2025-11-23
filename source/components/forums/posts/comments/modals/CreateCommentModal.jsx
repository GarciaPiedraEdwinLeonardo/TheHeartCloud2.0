import { useState } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { useCommentActions } from './../hooks/useCommentActions';

function CreateCommentModal({ isOpen, onClose, postId, postTitle, parentCommentId = null, onCommentCreated }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { createComment } = useCommentActions();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('El contenido del comentario es obligatorio');
      return;
    }

    if (content.length < 2) {
      setError('El comentario debe tener al menos 2 caracteres');
      return;
    }

    if (content.length > 1000) {
      setError('El comentario no puede tener más de 1000 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createComment({
        content: content.trim(),
        postId,
        parentCommentId
      });

      if (result.success) {
        if (onCommentCreated) {
          onCommentCreated();
        }
        onClose();
        setContent('');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error al crear el comentario');
    } finally {
      setLoading(false);
    }
  };

  // Prevenir scroll del body cuando el modal está abierto
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  if (!isOpen) return null;

  const getModalTitle = () => {
    if (parentCommentId) {
      return 'Responder Comentario';
    }
    return `Comentar en: ${postTitle}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">{getModalTitle()}</h2>
            <p className="text-sm text-gray-500 mt-1 truncate">
              {parentCommentId ? 'Responde a este comentario' : 'Comparte tu opinión o conocimiento'}
            </p>
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

              {/* Contenido */}
              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Tu comentario *
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={loading}
                  rows={6}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none disabled:opacity-50"
                  placeholder="Escribe tu comentario aquí"
                  maxLength={1000}
                  required
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{content.length}/1000</span>
                </div>
              </div>
              
            </div>
          </div>

          {/* Footer con botones */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0 rounded-b-2xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium disabled:opacity-50 order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || content.length < 2}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 order-1 sm:order-2"
              >
                {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
                {parentCommentId ? 'Responder' : 'Publicar Comentario'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCommentModal;