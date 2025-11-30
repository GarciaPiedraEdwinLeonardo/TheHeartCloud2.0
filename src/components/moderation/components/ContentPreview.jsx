import { useState, useEffect } from 'react';
import { FaSpinner, FaExclamationTriangle, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
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
  
  const { deleteContent, loading: actionLoading, error: actionError } = useModerationActions();

  // Cargar datos reales del contenido
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
          
          // Cargar datos del autor
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
    if (!deleteReason.trim()) {
      toast.error('Debes proporcionar un motivo para la eliminación');
      return;
    }

    try {
      const result = await deleteContent(contentType, report.targetId, deleteReason, report.forumId);
      
      if (result.success) {
        toast.success('Contenido Eliminado Correcatamente')
        setShowDeleteModal(false);
        if (onContentDeleted) {
          onContentDeleted();
        }
      } else {
        toast.error("Error")
        console.error(` Error: ${result.error}`);
      }
    } catch (err) {
      console.error('Error eliminando contenido:', err);
      toast.error("Error eliminand el contenido");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="w-6 h-6 text-blue-500 animate-spin mr-3" />
        <span className="text-gray-600">Cargando contenido...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-sm bg-red-50 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!contentData) {
    return (
      <div className="text-center py-8 text-gray-500">
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
        return timestamp.toDate().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
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

  return (
    <div className="content-preview">
      {/* Header de acciones */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-blue-900">Acciones de Moderación</h3>
            <p className="text-sm text-blue-700">
              Revisa el contenido y toma la acción apropiada
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium text-sm"
            >
              <FaTrash className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Información del reporte */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Información del Reporte</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Motivo del reporte:</strong> {report.reason}
          </div>
          {report.description && (
            <div>
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
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {contentData.authorData?.photoURL ? (
              <img 
                src={contentData.authorData.photoURL} 
                alt={`Foto de ${getAuthorName()}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{getAuthorName()}</h3>
              <p className="text-sm text-gray-600">
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {contentData.title}
              </h2>
              <div className="text-gray-700 whitespace-pre-line">
                {contentData.content}
              </div>
            </>
          )}
          
          {contentType === 'comment' && (
            <div className="text-gray-700 whitespace-pre-line">
              {contentData.content}
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex gap-4 text-sm text-gray-600">
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

      {/* Modal de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Eliminar {contentType === 'post' ? 'Publicación' : 'Comentario'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de la eliminación *
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Explica por qué eliminas este contenido..."
                required
              />
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">Advertencia</h4>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li>• Esta acción no se puede deshacer</li>
                    <li>• El autor será notificado</li>
                    <li>• Quedará registrado en auditoría</li>
                  </ul>
                </div>
              </div>
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {actionError}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteContent}
                disabled={!deleteReason.trim() || actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading && <FaSpinner className="w-4 h-4 animate-spin" />}
                <FaTrash className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentPreview;