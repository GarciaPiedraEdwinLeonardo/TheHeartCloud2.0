import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaHistory, FaUserEdit } from 'react-icons/fa';
import { useCommentActions } from './../hooks/useCommentActions';

function EditCommentModal({ isOpen, onClose, comment, onCommentUpdated }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  
  const { editComment } = useCommentActions();

  useEffect(() => {
    if (comment) {
      setContent(comment.content || '');
    }
  }, [comment]);

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

    // Verificar si realmente hubo cambios
    if (content === comment.content) {
      setError('No hay cambios para guardar');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await editComment(comment.id, content.trim());

      if (result.success) {
        if (onCommentUpdated) {
          onCommentUpdated();
        }
        onClose();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error al actualizar el comentario');
    } finally {
      setLoading(false);
    }
  };

  const formatHistoryDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return new Date(timestamp).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  // Prevenir scroll del body cuando el modal está abierto
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  if (!isOpen || !comment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaUserEdit className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">Editar Comentario</h2>
              <p className="text-sm text-gray-500 truncate">Actualiza tu comentario</p>
            </div>
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

              {/* Botón para ver historial */}
              {comment.editHistory && comment.editHistory.length > 0 && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
                  >
                    <FaHistory className="w-4 h-4" />
                    <span>Ver historial de ediciones ({comment.editHistory.length})</span>
                  </button>
                </div>
              )}

              {/* Historial de ediciones */}
              {showHistory && comment.editHistory && comment.editHistory.length > 0 && (
                <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Historial de Ediciones</h4>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {comment.editHistory.map((edit, index) => (
                      <div key={index} className="text-sm border-l-2 border-blue-500 pl-3">
                        <div className="text-gray-500 mb-1">
                          Editado el {formatHistoryDate(edit.editedAt)}
                        </div>
                        <div className="text-gray-700 bg-white p-2 rounded border">
                          {edit.previousContent}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contenido */}
              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Comentario *
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={loading}
                  rows={6}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none disabled:opacity-50"
                  placeholder="Escribe tu comentario aquí..."
                  maxLength={1000}
                  required
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Soporte para <strong>**negritas**</strong> y <em>*cursivas*</em></span>
                  <span>{content.length}/1000</span>
                </div>
              </div>

              {/* Información */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Información importante</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Esta edición quedará registrada en el historial</li>
                  <li>• Los cambios serán visibles inmediatamente</li>
                  <li>• No puedes editar comentarios de otros usuarios</li>
                  <li>• Mantén un lenguaje profesional y respetuoso</li>
                </ul>
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
                disabled={loading || content.length < 2 || content === comment.content}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 order-1 sm:order-2"
              >
                {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
                Guardar Cambios
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCommentModal;