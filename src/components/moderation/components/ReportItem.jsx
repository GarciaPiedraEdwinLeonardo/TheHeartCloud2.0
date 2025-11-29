import { useState } from 'react';
import { 
  FaExclamationTriangle, 
  FaUser, 
  FaUsers, 
  FaComment, 
  FaFileAlt,
  FaFlag,
  FaClock,
  FaCheckCircle,
  FaEllipsisH,
  FaEye,
  FaTimes
} from 'react-icons/fa';
import ModerationActions from './ModerationActions';
import ContentPreview from './ContentPreview';

function ReportItem({ report, activeTab }) {
  const [showActions, setShowActions] = useState(false);
  const [showContentPreview, setShowContentPreview] = useState(false);

  // Determinar tipo de contenido
  const getContentType = () => {
    if (report.type === 'post' && report.moderatorAction) {
      return { type: 'deleted_post', label: 'Post Eliminado' };
    }
    if (report.type === 'comment' && report.moderatorAction) {
      return { type: 'deleted_comment', label: 'Comentario Eliminado' };
    }
    
    if (report.actionType) {
      // Es un reporte global de moderador
      switch (report.actionType) {
        case 'post_rejected':
          return { type: 'post', label: 'Post Rechazado' };
        case 'comment_rejected':
          return { type: 'comment', label: 'Comentario Rechazado' };
        case 'community_ban':
          return { type: 'user', label: 'Usuario Baneado' };
        case 'post_deleted_by_moderator':
          return { type: 'deleted_post', label: 'Post Eliminado' };
        default:
          return { type: 'moderator_action', label: 'Acción de Moderador' };
      }
    }
    
    // Es un reporte de usuario
    switch (report.type) {
      case 'user':
      case 'profile':
        return { type: 'user', label: 'Reporte de Usuario' };
      case 'post':
        return { type: 'post', label: 'Reporte de Publicación' };
      case 'comment':
        return { type: 'comment', label: 'Reporte de Comentario' };
      case 'forum':
        return { type: 'forum', label: 'Reporte de Comunidad' };
      default:
        return { type: 'unknown', label: 'Reporte' };
    }
  };

  const contentType = getContentType();
  
  const getReportIcon = () => {
    switch (contentType.type) {
      case 'user':
        return <FaUser className="w-5 h-5 text-purple-600" />;
      case 'post':
      case 'deleted_post':
        return <FaFileAlt className="w-5 h-5 text-blue-600" />;
      case 'comment':
      case 'deleted_comment':
        return <FaComment className="w-5 h-5 text-green-600" />;
      case 'forum':
        return <FaUsers className="w-5 h-5 text-orange-600" />;
      default:
        return <FaFlag className="w-5 h-5 text-gray-600" />;
    }
  };

  const getUrgencyColor = () => {
    switch (report.urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusInfo = () => {
    if (report.status === 'resolved') {
      return { label: 'Resuelto', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
    }
    if (report.status === 'pending_review' || report.status === 'pending') {
      return { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: FaClock };
    }
    if (report.status === 'dismissed') {
      return { label: 'Desestimado', color: 'bg-gray-100 text-gray-800', icon: FaTimes };
    }
    return { label: 'Revisando', color: 'bg-blue-100 text-blue-800', icon: FaExclamationTriangle };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
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

  // Determinar si mostrar preview del contenido
  const canShowPreview = ['post', 'comment', 'user', 'forum'].includes(contentType.type) && 
                        !contentType.type.startsWith('deleted');

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center">
                {getReportIcon()}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Header móvil compacto */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {report.targetName || 'Contenido reportado'}
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor()}`}>
                    <FaExclamationTriangle className="w-3 h-3" />
                    <span className="hidden sm:inline">{report.urgency || 'media'}</span>
                    <span className="sm:hidden">{report.urgency ? report.urgency.charAt(0).toUpperCase() : 'M'}</span>
                  </span>
                  
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span className="hidden sm:inline">{statusInfo.label}</span>
                    <span className="sm:hidden">{statusInfo.label.charAt(0)}</span>
                  </span>
                </div>
              </div>
              
              {/* Información del reporte */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600">
                <span className="font-medium">{contentType.label}</span>
                <span className="hidden sm:inline">•</span>
                <span>Por: {report.reporterName || 'Moderador'}</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-xs sm:text-sm">{formatDate(report.createdAt || report.reportedAt)}</span>
              </div>

              {/* Información adicional */}
              <div className="mt-3 space-y-1">
                {report.reason && (
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Motivo:</strong> {report.reason}
                  </p>
                )}

                {report.description && (
                  <p className="text-sm text-gray-700 line-clamp-2">
                    <strong className="text-gray-900">Descripción:</strong> {report.description}
                  </p>
                )}

                {report.targetAuthorName && (
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Autor:</strong> {report.targetAuthorName}
                  </p>
                )}
              </div>

              {/* Botón para ver contenido */}
              {canShowPreview && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowContentPreview(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition duration-200"
                  >
                    <FaEye className="w-4 h-4" />
                    Ver contenido reportado
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Botón de acciones */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <FaEllipsisH className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Acciones de moderación */}
        {showActions && (
          <ModerationActions 
            report={report}
            onClose={() => setShowActions(false)}
          />
        )}
      </div>

      {/* Modal de preview del contenido */}
      {showContentPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Vista previa del contenido
              </h3>
              <button
                onClick={() => setShowContentPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
              <ContentPreview 
                report={report}
                contentType={contentType.type}
              />
            </div>
            
            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowContentPreview(false)}
                className="w-full sm:w-auto px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReportItem;