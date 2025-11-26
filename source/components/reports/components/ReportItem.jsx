// reports/components/ReportItem.jsx
import { useState } from 'react';
import { 
  FaExclamationTriangle, 
  FaUser, 
  FaComment, 
  FaFileAlt, 
  FaUsers,
  FaIdCard,
  FaClock,
  FaCheck,
  FaTimes,
  FaEllipsisH,
  FaEye
} from 'react-icons/fa';
import { ModerationActionModal } from '../modals/ModerationActionModal';

export const ReportItem = ({ report, onActionTaken, onDismiss }) => {
  const [showActions, setShowActions] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const getTargetIcon = () => {
    switch (report.targetType) {
      case 'post':
        return <FaFileAlt className="w-4 h-4 text-blue-600" />;
      case 'comment':
        return <FaComment className="w-4 h-4 text-green-600" />;
      case 'user':
        return <FaUser className="w-4 h-4 text-purple-600" />;
      case 'forum':
        return <FaUsers className="w-4 h-4 text-orange-600" />;
      case 'profile':
        return <FaIdCard className="w-4 h-4 text-red-600" />;
      default:
        return <FaExclamationTriangle className="w-4 h-4 text-gray-600" />;
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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTargetTypeLabel = () => {
    switch (report.targetType) {
      case 'post': return 'Publicación';
      case 'comment': return 'Comentario';
      case 'user': return 'Usuario';
      case 'forum': return 'Comunidad';
      case 'profile': return 'Perfil';
      default: return 'Contenido';
    }
  };

  const formatDate = (timestamp) => {
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

  const handleQuickAction = async (action, reason) => {
    setActionLoading(true);
    try {
      if (action === 'dismiss') {
        await onDismiss(report.id, reason);
      } else {
        await onActionTaken(report.id, action, reason);
      }
      setShowActions(false);
    } catch (error) {
      console.error('Error en acción rápida:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewContent = () => {
    // Navegar al contenido reportado (implementar según la lógica de navegación)
    console.log('Ver contenido:', report.targetType, report.targetId);
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getTargetIcon()}
              <span className="text-sm font-medium text-gray-700">
                {getTargetTypeLabel()}
              </span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor()}`}>
              {report.urgency === 'critical' ? 'Crítico' : 
               report.urgency === 'high' ? 'Alto' : 
               report.urgency === 'medium' ? 'Medio' : 'Bajo'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleViewContent}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Ver contenido"
            >
              <FaEye className="w-4 h-4" />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                disabled={actionLoading}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <FaEllipsisH className="w-4 h-4" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                  <button
                    onClick={() => setShowActionModal(true)}
                    className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                  >
                    <FaCheck className="w-3 h-3" />
                    Acción Completa
                  </button>
                  <button
                    onClick={() => handleQuickAction('dismiss', 'Reporte sin fundamento')}
                    disabled={actionLoading}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                  >
                    <FaTimes className="w-3 h-3" />
                    Desestimar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenido del Reporte */}
        <div className="mb-3">
          <h4 className="font-semibold text-gray-900 mb-2">Motivo: {report.reason}</h4>
          {report.description && (
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
              {report.description}
            </p>
          )}
        </div>

        {/* Metadatos */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <FaClock className="w-3 h-3" />
              <span>{formatDate(report.reportedAt)}</span>
            </div>
            {report.reportCount > 1 && (
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                +{report.reportCount - 1} reportes
              </span>
            )}
          </div>
          
          <span className="text-gray-400">
            ID: {report.id.slice(-8)}
          </span>
        </div>

        {/* Preview del contenido reportado */}
        {report.targetData && (
          <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
            <div className="font-medium mb-1">Contenido reportado:</div>
            <div className="text-gray-600 truncate">
              {report.targetData.title || report.targetData.content || report.targetData.email || 'Sin preview disponible'}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Acción Completa */}
      <ModerationActionModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        report={report}
        onActionTaken={onActionTaken}
        onDismiss={onDismiss}
      />
    </>
  );
};