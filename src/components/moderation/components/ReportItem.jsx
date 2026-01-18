import { useState, useEffect } from 'react';
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
  FaTimes,
  FaExternalLinkAlt
} from 'react-icons/fa';
import ModerationActions from './ModerationActions';
import ContentPreview from './ContentPreview';

function ReportItem({ report, activeTab, onNavigateToProfile, onNavigateToForum }) {
  const [showActions, setShowActions] = useState(false);
  const [showContentPreview, setShowContentPreview] = useState(false);

  // Prevenir scroll cuando el modal está abierto
  useEffect(() => {
    if (showContentPreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showContentPreview]);

  const getContentType = () => {
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
        return <FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />;
      case 'post':
        return <FaFileAlt className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />;
      case 'comment':
        return <FaComment className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />;
      case 'forum':
        return <FaUsers className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />;
      default:
        return <FaFlag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />;
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
    const status = report.status;
    
    if (status === 'resolved') {
      return { label: 'Resuelto', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
    }
    if (status === 'pending_review' || status === 'pending') {
      return { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: FaClock };
    }
    if (status === 'dismissed') {
      return { label: 'Desestimado', color: 'bg-gray-100 text-gray-800', icon: FaTimes };
    }
    return { label: 'Revisando', color: 'bg-blue-100 text-blue-800', icon: FaExclamationTriangle };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

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
        return date.toLocaleDateString('es-ES', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
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

  const getReportInfo = () => {
    return {
      title: report.targetName || 'Contenido reportado',
      reporter: report.reporterName || 'Usuario',
      date: report.createdAt,
      reason: report.reason,
      description: report.description
    };
  };

  const reportInfo = getReportInfo();

  const handleNavigateToContent = () => {
    if (contentType.type === 'user' && onNavigateToProfile) {
      const userData = {
        id: report.targetId,
        name: {
          name: report.targetName || 'Usuario',
          apellidopat: '',
          apellidomat: ''
        },
        email: report.targetEmail || ''
      };
      onNavigateToProfile(userData);
    } else if (contentType.type === 'forum' && onNavigateToForum) {
      const forumData = {
        id: report.targetId,
        name: report.targetName || 'Comunidad',
        description: report.targetDescription || ''
      };
      onNavigateToForum(forumData);
    } else if (['post', 'comment'].includes(contentType.type)) {
      setShowContentPreview(true);
    }
  };

  const getActionButton = () => {
    if (contentType.type === 'user') {
      return (
        <button
          onClick={handleNavigateToContent}
          className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-lg transition duration-200 w-full sm:w-auto"
        >
          <FaExternalLinkAlt className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">Ver perfil</span>
        </button>
      );
    } else if (contentType.type === 'forum') {
      return (
        <button
          onClick={handleNavigateToContent}
          className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 rounded-lg transition duration-200 w-full sm:w-auto"
        >
          <FaExternalLinkAlt className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">Ver comunidad</span>
        </button>
      );
    } else if (['post', 'comment'].includes(contentType.type)) {
      return (
        <button
          onClick={() => setShowContentPreview(true)}
          className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition duration-200 w-full sm:w-auto"
        >
          <FaEye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">Ver contenido</span>
        </button>
      );
    }
    return null;
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-start gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gray-100 flex items-center justify-center">
                {getReportIcon()}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Header compacto para móvil */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 md:gap-3 mb-1.5 sm:mb-2">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">
                  {reportInfo.title}
                </h3>
                
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-medium rounded-full border ${getUrgencyColor()}`}>
                    <FaExclamationTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                    <span className="hidden xs:inline capitalize">
                      {report.urgency || 'media'}
                    </span>
                    <span className="xs:hidden capitalize">
                      {report.urgency ? report.urgency.charAt(0).toUpperCase() : 'M'}
                    </span>
                  </span>
                  
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                    <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                    <span className="hidden xs:inline">{statusInfo.label}</span>
                    <span className="xs:hidden">{statusInfo.label.charAt(0)}</span>
                  </span>
                </div>
              </div>
              
              {/* Información del reporte */}
              <div className="flex flex-col xs:flex-row xs:items-center gap-0.5 xs:gap-1.5 sm:gap-2 md:gap-4 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                <span className="font-medium truncate">{contentType.label}</span>
                <span className="hidden xs:inline">•</span>
                <span className="truncate">Por: {reportInfo.reporter}</span>
                <span className="hidden xs:inline">•</span>
                <span className="text-xs truncate">{formatDate(reportInfo.date)}</span>
              </div>

              {/* Información adicional */}
              <div className="space-y-1.5 mb-3 sm:mb-4">
                {reportInfo.reason && (
                  <p className="text-xs sm:text-sm text-gray-700 break-words overflow-wrap-anywhere line-clamp-2">
                    <strong className="text-gray-900">Motivo:</strong> {reportInfo.reason}
                  </p>
                )}

                {reportInfo.description && (
                  <p className="text-xs sm:text-sm text-gray-700 break-words overflow-wrap-anywhere line-clamp-2">
                    <strong className="text-gray-900">Descripción:</strong> {reportInfo.description}
                  </p>
                )}
              </div>

              {/* Botón de acción según tipo de contenido */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="w-full sm:w-auto">
                  {getActionButton()}
                </div>
              </div>
            </div>
          </div>

          {/* Botón de acciones */}
          <div className="flex-shrink-0 ml-2">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition duration-200"
              aria-label="Más acciones"
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

      {/* ContentPreview solo para posts y comentarios */}
      {showContentPreview && ['post', 'comment'].includes(contentType.type) && (
        <ContentPreview 
          report={report}
          contentType={contentType.type}
          onClose={() => setShowContentPreview(false)}
          onContentDeleted={() => {
            setShowContentPreview(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

export default ReportItem;