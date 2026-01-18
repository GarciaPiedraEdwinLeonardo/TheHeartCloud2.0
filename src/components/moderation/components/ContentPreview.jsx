import { useState, useEffect } from 'react';
import { FaSpinner, FaExclamationTriangle, FaTrash, FaTimes, FaExpand } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useModerationActions } from '../hooks/useModerationActions';
import { toast } from 'react-hot-toast';

function ContentPreview({ report, contentType, onClose, onContentDeleted }) {
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  
  const { deleteContent, loading: actionLoading } = useModerationActions();

  useEffect(() => {
    const loadContentData = async () => {
      setLoading(true);
      setError(null);

      try {
        let contentDoc;
        
        if (contentType === 'post') {
          contentDoc = await getDoc(doc(db, 'posts', report.targetId));
        } else if (contentType === 'comment') {
          contentDoc = await getDoc(doc(db, 'comments', report.targetId));
        }

        if (contentDoc && contentDoc.exists()) {
          const data = contentDoc.data();
          
          let authorData = null;
          if (data.authorId) {
            const authorDoc = await getDoc(doc(db, 'users', data.authorId));
            if (authorDoc.exists()) {
              authorData = authorDoc.data();
            }
          }

          setContentData({
            ...data,
            id: contentDoc.id,
            authorData: authorData
          });
        } else {
          setError('El contenido no existe o ha sido eliminado');
        }
      } catch (err) {
        console.error('Error cargando contenido:', err);
        setError('No se pudo cargar el contenido');
      } finally {
        setLoading(false);
      }
    };

    loadContentData();
  }, [contentType, report.targetId]);

  const handleDeleteContent = async () => {
    try {
      const result = await deleteContent(contentType, report.id);
      
      if (result.success) {
        toast.success('Contenido eliminado correctamente');
        setShowDeleteConfirm(false);
        
        if (onContentDeleted) {
          onContentDeleted();
        }
      } else {
        toast.error(result.error || "Error al eliminar el contenido");
      }
    } catch (err) {
      console.error('Error eliminando contenido:', err);
      toast.error("Error eliminando el contenido");
    }
  };

  const getAuthorName = () => {
    if (!contentData?.authorData) return 'Usuario';
    const { name } = contentData.authorData;
    if (name && (name.name || name.apellidopat || name.apellidomat)) {
      return `${name.name || ''} ${name.apellidopat || ''} ${name.apellidomat || ''}`.trim();
    }
    return contentData.authorData.email || 'Usuario';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    
    try {
      let date;
      
      // Si es un objeto Timestamp de Firebase
      if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } 
      // Si es un objeto con _seconds (Timestamp serializado con guión bajo)
      else if (timestamp && timestamp._seconds) {
        date = new Date(timestamp._seconds * 1000);
      }
      // Si es un objeto con seconds (Timestamp serializado sin guión bajo)
      else if (timestamp && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      }
      // Si es una cadena de fecha ISO
      else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      }
      // Si es un número (milisegundos)
      else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
      }
      // Si ya es un objeto Date
      else if (timestamp instanceof Date) {
        date = timestamp;
      }
      else {
        return 'Fecha no disponible';
      }
      
      // Validar que la fecha sea válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Hoy ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Ayer ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays < 7) {
        return date.toLocaleDateString('es-ES', { 
          weekday: 'short', 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else {
        return date.toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
    } catch (error) {
      console.error('Error formateando fecha:', error, timestamp);
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center justify-center">
            <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <span className="text-gray-600">Cargando contenido...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FaExclamationTriangle className="w-6 h-6" />
                <span className="font-medium text-lg">Error</span>
              </div>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!contentData) {
    return null;
  }

  return (
    <>
      {/* Modal principal de preview */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl my-8 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Vista previa - {contentType === 'post' ? 'Publicación' : 'Comentario'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Header de acciones */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-blue-900">Acciones de Moderación</h3>
                  <p className="text-sm text-blue-700">
                    Revisa el contenido y toma la acción apropiada
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium w-full sm:w-auto"
                  >
                    <FaTrash className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Información del reporte */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Información del Reporte</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="break-words">
                  <strong>Motivo del reporte:</strong> {report.reason}
                </div>
                {report.description && (
                  <div className="break-words">
                    <strong>Descripción:</strong> {report.description}
                  </div>
                )}
                <div>
                  <strong>Reportado por:</strong> {report.reporterName || 'Usuario'}
                </div>
                <div>
                  <strong>Fecha del reporte:</strong> {formatDate(report.createdAt)}
                </div>
              </div>
            </div>

            {/* Contenido real */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Header del contenido */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b border-gray-200 gap-3">
                <div className="flex items-center gap-3">
                  {contentData.authorData?.photoURL ? (
                    <img 
                      src={contentData.authorData.photoURL} 
                      alt={`Foto de ${getAuthorName()}`}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaExclamationTriangle className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{getAuthorName()}</h3>
                    <p className="text-sm text-gray-600 truncate">
                      {contentData.authorData?.professionalInfo?.specialty || 'Usuario'}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(contentData.createdAt)}
                </div>
              </div>

              {/* Contenido */}
              <div className="prose max-w-none">
                {contentType === 'post' && (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 break-words">
                      {contentData.title}
                    </h2>
                    <div className="text-gray-700 whitespace-pre-line break-words mb-4">
                      {contentData.content}
                    </div>

                    {/* Imágenes del post */}
                    {contentData.images && contentData.images.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700">
                          Imágenes adjuntas ({contentData.images.length})
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {contentData.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image.url}
                                alt={`Imagen ${index + 1} del post`}
                                className="w-full max-h-96 object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setExpandedImage(image)}
                              />
                              <button
                                onClick={() => setExpandedImage(image)}
                                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <FaExpand className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {contentType === 'comment' && (
                  <div className="text-gray-700 whitespace-pre-line break-words">
                    {contentData.content}
                  </div>
                )}
              </div>

              {/* Estadísticas */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {contentType === 'post' && (
                    <>
                      <span>Likes: {contentData.likes?.length || 0}</span>
                      <span>Dislikes: {contentData.dislikes?.length || 0}</span>
                      <span>Comentarios: {contentData.stats?.commentCount || 0}</span>
                    </>
                  )}
                  {contentType === 'comment' && (
                    <span>Likes: {contentData.likes?.length || 0}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirmar Eliminación
                  </h3>
                  <p className="text-sm text-gray-600">
                    Esta acción es permanente
                  </p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-orange-800 mb-1">
                      Advertencia
                    </h4>
                    <ul className="text-xs text-orange-700 space-y-1">
                      <li>• El contenido será eliminado permanentemente</li>
                      <li>• No podrás recuperar este contenido</li>
                      <li>• Las estadísticas del usuario se actualizarán</li>
                      <li>• Esta acción no se puede deshacer</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400 transition duration-200 disabled:opacity-50 font-medium order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteContent}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 font-medium order-1 sm:order-2"
                >
                  {actionLoading && <FaSpinner className="w-4 h-4 animate-spin" />}
                  <FaTrash className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para imagen expandida */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-[70] flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <img
              src={expandedImage.url}
              alt="Imagen expandida"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 bg-white text-gray-800 p-3 rounded-full hover:bg-gray-200 transition duration-200 shadow-lg"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ContentPreview;