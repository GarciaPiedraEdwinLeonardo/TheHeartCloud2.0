import { useState, useEffect } from 'react';
import { FaSpinner, FaExclamationTriangle, FaTrash, FaCheck, FaTimes, FaExclamationCircle } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useModerationActions } from '../hooks/useModerationActions';
import { toast } from 'react-hot-toast';

function ContentPreview({ report, contentType, isGlobalReport, onContentDeleted }) {
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteTouched, setDeleteTouched] = useState(false);
  
  const { deleteContent, loading: actionLoading, error: actionError } = useModerationActions();

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

  const validateDeleteReason = (reason) => {
    const trimmedReason = reason.trim();
    
    if (!trimmedReason) {
      return 'Debes proporcionar un motivo para la eliminación';
    }
    
    if (trimmedReason.length < 10) {
      return 'El motivo debe tener al menos 10 caracteres';
    }
    
    if (trimmedReason.length > 100) {
      return 'El motivo no puede exceder 100 caracteres';
    }
    
    return '';
  };

  const handleDeleteReasonChange = (e) => {
    const value = e.target.value;
    setDeleteReason(value);
    
    if (deleteTouched) {
      const error = validateDeleteReason(value);
      setDeleteError(error);
    }
  };

  const handleDeleteReasonBlur = () => {
    setDeleteTouched(true);
    const error = validateDeleteReason(deleteReason);
    setDeleteError(error);
  };

  const handleDeleteContent = async () => {
    setDeleteTouched(true);
    
    const error = validateDeleteReason(deleteReason);
    if (error) {
      setDeleteError(error);
      toast.error(error);
      return;
    }

    try {
      const result = await deleteContent(contentType, report.targetId, deleteReason, report.forumId);
      
      if (result.success) {
        toast.success('Contenido Eliminado Correctamente');
        setShowDeleteModal(false);
        setDeleteReason('');
        setDeleteError('');
        setDeleteTouched(false);
        
        if (onContentDeleted) {
          onContentDeleted();
        }
      } else {
        toast.error("Error al eliminar el contenido");
        console.error(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error('Error eliminando contenido:', err);
      toast.error("Error eliminando el contenido");
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteReason('');
    setDeleteError('');
    setDeleteTouched(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <FaSpinner className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 animate-spin mb-3" />
        <span className="text-gray-600 text-sm sm:text-base">Cargando contenido...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 px-4">
        <div className="text-red-500 text-sm bg-red-50 p-3 sm:p-4 rounded-lg max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaExclamationTriangle className="w-5 h-5" />
            <span className="font-medium">Error</span>
          </div>
          {error}
        </div>
      </div>
    );
  }

  if (!contentData) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
        No se pudo cargar el contenido
      </div>
    );
  }

  const getAuthorName = () => {
    if (!contentData.authorData) return 'Usuario';
    const { name } = contentData.authorData;
    if (name && (name.name || name.apellidopat || name.apellidomat)) {
      return `${name.name || ''} ${name.apellidopat || ''} ${name.apellidomat || ''}`.trim();
    }
    return contentData.authorData.email || 'Usuario';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      if (timestamp.toDate) {
        const date = timestamp.toDate();
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
      }
      return new Date(timestamp).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  const isDeleteDisabled = actionLoading || deleteError || !deleteReason.trim();

  return (
    <div className="content-preview">
      {/* Header de acciones */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-blue-900 text-sm sm:text-base">Acciones de Moderación</h3>
            <p className="text-xs sm:text-sm text-blue-700 truncate">
              Revisa el contenido y toma la acción apropiada
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium text-xs sm:text-sm w-full sm:w-auto"
            >
              <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Información del reporte */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">Información del Reporte</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="break-words">
            <strong>Motivo del reporte:</strong> {report.reason}
          </div>
          {report.description && (
            <div className="break-words">
              <strong>Descripción:</strong> {report.description}
            </div>
          )}
          <div className="truncate">
            <strong>Reportado por:</strong> {report.reporterName || 'Usuario'}
          </div>
          <div>
            <strong>Fecha del reporte:</strong> {formatDate(report.createdAt)}
          </div>
        </div>
      </div>

      {/* Contenido real */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        {/* Header del contenido */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200 gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {contentData.authorData?.photoURL ? (
              <img 
                src={contentData.authorData.photoURL} 
                alt={`Foto de ${getAuthorName()}`}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{getAuthorName()}</h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {contentData.authorData?.professionalInfo?.specialty || 'Usuario'}
              </p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 text-right sm:text-left">
            {formatDate(contentData.createdAt)}
          </div>
        </div>

        {/* Contenido */}
        <div className="prose max-w-none">
          {contentType === 'post' && (
            <>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 break-words">
                {contentData.title}
              </h2>
              <div className="text-gray-700 whitespace-pre-line text-sm sm:text-base break-words">
                {contentData.content}
              </div>
            </>
          )}
          
          {contentType === 'comment' && (
            <div className="text-gray-700 whitespace-pre-line text-sm sm:text-base break-words">
              {contentData.content}
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-600">
            {contentType === 'post' && (
              <>
                <span className="whitespace-nowrap">Likes: {contentData.likes?.length || 0}</span>
                <span className="whitespace-nowrap">Dislikes: {contentData.dislikes?.length || 0}</span>
                <span className="whitespace-nowrap">Comentarios: {contentData.stats?.commentCount || 0}</span>
              </>
            )}
            {contentType === 'comment' && (
              <span className="whitespace-nowrap">Likes: {contentData.likes?.length || 0}</span>
            )}
          </div>
        </div>
      </div>

      {/* Modal de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Eliminar {contentType === 'post' ? 'Publicación' : 'Comentario'}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de la eliminación *
                </label>
                <textarea
                  value={deleteReason}
                  onChange={handleDeleteReasonChange}
                  onBlur={handleDeleteReasonBlur}
                  rows={4}
                  maxLength={100}
                  className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 transition duration-200 text-sm ${
                    deleteError && deleteTouched
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-red-500'
                  }`}
                  placeholder="Explica por qué eliminas este contenido (mínimo 10 caracteres, máximo 100)..."
                  required
                />
                
                {/* Mensaje de error */}
                {deleteError && deleteTouched && (
                  <div className="flex items-start gap-1 mt-1">
                    <FaExclamationCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 text-xs break-words">{deleteError}</p>
                  </div>
                )}
                
                {/* Contador de caracteres */}
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center gap-1">
                    {deleteReason.length > 0 && deleteReason.length < 10 && (
                      <span className="text-xs text-orange-500">
                        Mínimo 10 caracteres requeridos
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${
                    deleteReason.length < 10 ? 'text-red-500' : 
                    deleteReason.length > 80 ? 'text-orange-500' : 'text-gray-500'
                  }`}>
                    {deleteReason.length}/100 caracteres
                  </p>
                </div>
              </div>
              
              {actionError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 break-words">
                  {actionError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                <button
                  onClick={closeDeleteModal}
                  disabled={actionLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200 disabled:opacity-50 text-sm order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteContent}
                  disabled={isDeleteDisabled}
                  className={`px-4 py-2 text-white rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm order-1 sm:order-2 ${
                    isDeleteDisabled
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionLoading && <FaSpinner className="w-4 h-4 animate-spin" />}
                  <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentPreview;