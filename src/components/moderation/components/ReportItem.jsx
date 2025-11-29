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
  FaEllipsisH
} from 'react-icons/fa';
import ModerationActions from './ModerationActions';

function ReportItem({ report, activeTab }) {
  const [showActions, setShowActions] = useState(false);

  // Agrego casos para auditoría:
const getReportIcon = () => {
    // Si es contenido eliminado (auditoría)
    if (report.type === 'post' && report.moderatorAction) {
      return <FaFileAlt className="w-5 h-5 text-red-600" />;
    }
    if (report.type === 'comment' && report.moderatorAction) {
      return <FaComment className="w-5 h-5 text-red-600" />;
    }
    
    switch (report.type || report.actionType) {
      case 'user':
      case 'profile':
        return <FaUser className="w-5 h-5 text-purple-600" />;
      case 'post':
        return <FaFileAlt className="w-5 h-5 text-blue-600" />;
      case 'comment':
        return <FaComment className="w-5 h-5 text-green-600" />;
      case 'forum':
        return <FaUsers className="w-5 h-5 text-orange-600" />;
      default:
        return <FaFlag className="w-5 h-5 text-gray-600" />;
    }
  };
  
  // Agrego casos para auditoría:
  const getReportTypeLabel = () => {
    // Contenido eliminado (auditoría)
    if (report.type === 'post' && report.moderatorAction) {
      return 'Post Eliminado';
    }
    if (report.type === 'comment' && report.moderatorAction) {
      return 'Comentario Eliminado';
    }
    
    if (report.actionType) {
      // Es un reporte global de moderador
      switch (report.actionType) {
        case 'post_rejected':
          return 'Post Rechazado';
        case 'comment_rejected':
          return 'Comentario Rechazado';
        case 'community_ban':
          return 'Usuario Baneado';
        case 'post_deleted_by_moderator':
          return 'Post Eliminado';
        default:
          return 'Acción de Moderador';
      }
    }
    
    // Es un reporte de usuario
    switch (report.type) {
      case 'user':
      case 'profile':
        return 'Reporte de Usuario';
      case 'post':
        return 'Reporte de Publicación';
      case 'comment':
        return 'Reporte de Comentario';
      case 'forum':
        return 'Reporte de Comunidad';
      default:
        return 'Reporte';
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
    if (report.status === 'resolved' || report.status === 'resolved') {
      return { label: 'Resuelto', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
    }
    if (report.status === 'pending_review' || report.status === 'pending') {
      return { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: FaClock };
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              {getReportIcon()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {report.targetName || 'Contenido reportado'}
              </h3>
              
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor()}`}>
                <FaExclamationTriangle className="w-3 h-3" />
                {report.urgency || 'media'}
              </span>
              
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                <StatusIcon className="w-3 h-3" />
                {statusInfo.label}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">{getReportTypeLabel()}</span>
              <span>•</span>
              <span>Reportado por: {report.reporterName || 'Moderador'}</span>
              <span>•</span>
              <span>{formatDate(report.createdAt || report.reportedAt)}</span>
            </div>

            {report.reason && (
              <div className="mt-2">
                <p className="text-sm text-gray-700">
                  <strong>Motivo:</strong> {report.reason}
                </p>
              </div>
            )}

            {report.description && (
              <div className="mt-2">
                <p className="text-sm text-gray-700">
                  <strong>Descripción:</strong> {report.description}
                </p>
              </div>
            )}

            {report.targetAuthorName && (
              <div className="mt-2">
                <p className="text-sm text-gray-700">
                  <strong>Autor:</strong> {report.targetAuthorName}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <FaEllipsisH className="w-5 h-5 text-gray-500" />
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
  );
}

export default ReportItem;