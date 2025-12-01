import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaHistory } from 'react-icons/fa';
import { useCommentActions } from './../hooks/useCommentActions';

function EditCommentModal({ isOpen, onClose, comment, onCommentUpdated }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  
  const { editComment } = useCommentActions();

  // Constantes de validación (iguales al CreateCommentModal)
  const MIN_LENGTH = 2;
  const MAX_LENGTH = 500;
  const CHAR_WARNING_THRESHOLD = 450;

  useEffect(() => {
    if (comment) {
      setContent(comment.content || '');
      setError('');
      setShowHistory(false);
    }
  }, [comment]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    
    // Limitar caracteres en tiempo real
    if (newContent.length <= MAX_LENGTH) {
      setContent(newContent);
      setError(''); // Limpiar error al escribir
    }
  };

  const validateContent = () => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      return 'El contenido del comentario es obligatorio';
    }

    if (trimmedContent.length < MIN_LENGTH) {
      return `El comentario debe tener al menos ${MIN_LENGTH} caracteres`;
    }

    if (trimmedContent.length > MAX_LENGTH) {
      return `El comentario no puede tener más de ${MAX_LENGTH} caracteres`;
    }

    // Validación adicional: evitar comentarios con solo espacios o saltos de línea
    if (trimmedContent.replace(/\s/g, '').length === 0) {
      return 'El comentario no puede contener solo espacios';
    }

    // Validación adicional: limitar saltos de línea excesivos
    const lineBreaks = (trimmedContent.match(/\n/g) || []).length;
    if (lineBreaks > 20) {
      return 'El comentario tiene demasiados saltos de línea';
    }

    // Verificar si realmente hubo cambios
    if (trimmedContent === comment.content.trim()) {
      return 'No hay cambios para guardar';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateContent();
    if (validationError) {
      setError(validationError);
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
      return new Date(timestamp).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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

  // Calcular caracteres restantes y estado
  const remainingChars = MAX_LENGTH - content.length;
  const isNearLimit = content.length >= CHAR_WARNING_THRESHOLD;
  const hasChanges = content.trim() !== comment.content.trim();
  const isValid = content.trim().length >= MIN_LENGTH && content.length <= MAX_LENGTH && hasChanges;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">Editar Comentario</h2>
            <p className="text-sm text-gray-500 mt-1 truncate">
              Actualiza tu comentario
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

              {/* Botón para ver historial */}
              {comment.editHistory && comment.editHistory.length > 0 && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition duration-200 font-medium"
                  >
                    <FaHistory className="w-4 h-4" />
                    <span>
                      {showHistory ? 'Ocultar' : 'Ver'} historial ({comment.editHistory.length} {comment.editHistory.length === 1 ? 'edición' : 'ediciones'})
                    </span>
                  </button>
                </div>
              )}

              {/* Historial de ediciones */}
              {showHistory && comment.editHistory && comment.editHistory.length > 0 && (
                <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaHistory className="w-4 h-4 text-gray-600" />
                    Historial de Ediciones
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {comment.editHistory.map((edit, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <span className="font-medium">Versión {comment.editHistory.length - index}</span>
                          <span>•</span>
                          <span>{formatHistoryDate(edit.editedAt)}</span>
                        </div>
                        <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
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
                  Tu comentario *
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={handleContentChange}
                  disabled={loading}
                  rows={6}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none disabled:opacity-50"
                  placeholder="Escribe tu comentario aquí (máximo 500 caracteres)"
                  maxLength={MAX_LENGTH}
                  required
                />
                <div className="flex justify-between items-center text-xs mt-2">
                  <span className="text-gray-500">
                    Mínimo {MIN_LENGTH} caracteres
                  </span>
                  <span 
                    className={`font-medium ${
                      isNearLimit 
                        ? 'text-orange-600' 
                        : remainingChars === 0 
                          ? 'text-red-600' 
                          : 'text-gray-500'
                    }`}
                  >
                    {content.length}/{MAX_LENGTH}
                  </span>
                </div>
                
                {/* Advertencia cuando está cerca del límite */}
                {isNearLimit && remainingChars > 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ Te quedan {remainingChars} caracteres
                  </p>
                )}
                
                {/* Mensaje cuando alcanza el límite */}
                {remainingChars === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Has alcanzado el límite de caracteres
                  </p>
                )}

                {/* Mensaje cuando no hay cambios */}
                {!hasChanges && content.length >= MIN_LENGTH && (
                  <p className="text-xs text-gray-500 mt-1">
                    No se detectaron cambios en el comentario
                  </p>
                )}
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
                disabled={loading || !isValid}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
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