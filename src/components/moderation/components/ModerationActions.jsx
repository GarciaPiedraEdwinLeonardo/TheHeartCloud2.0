import { useState } from 'react';
import { 
  FaCheck, FaTimes, FaBan, FaTrash, FaUserSlash, FaSpinner 
} from 'react-icons/fa';
import { useModerationActions } from './../hooks/useModerationActions';

function ModerationActions({ report, onClose }) {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ reason: '', duration: '7 days' });
  const [selectedAction, setSelectedAction] = useState('');
  
  const { 
    resolveReport, 
    dismissReport,
    suspendUser, 
    deleteContent,
    deleteCommunity,
    banFromCommunity,
    loading,
    error 
  } = useModerationActions();

  // Determinar tipo de reporte
  const isGlobalReport = report.source === 'global';
  const isAuditReport = report.source === 'audit';
  const isUserReport = !isGlobalReport && !isAuditReport;

  // Obtener acciones disponibles - CORREGIDO: sin eliminar comunidad
  const getAvailableActions = () => {
    const actions = [];

    // Si es reporte de auditoría, no hay acciones
    if (isAuditReport) {
      return actions;
    }

    // Para reportes pendientes de usuarios
    if (isUserReport && report.status === 'pending') {
      actions.push(
        {
          id: 'resolve',
          label: 'Marcar como resuelto',
          icon: FaCheck,
          color: 'text-green-600',
          bgColor: 'bg-green-50 hover:bg-green-100',
        },
        {
          id: 'dismiss',
          label: 'Desestimar reporte',
          icon: FaTimes,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 hover:bg-gray-100',
        }
      );
    }

    // Para contenido que se puede eliminar (solo posts y comentarios)
    if (isUserReport && (report.type === 'post' || report.type === 'comment')) {
      actions.push({
        id: 'delete_content',
        label: `Eliminar ${report.type === 'post' ? 'publicación' : 'comentario'}`,
        icon: FaTrash,
        color: 'text-red-600',
        bgColor: 'bg-red-50 hover:bg-red-100',
      });
    }

    // QUITADO: Eliminar comunidad - no queremos esta opción
    // if (isUserReport && report.type === 'forum') {
    //   actions.push({
    //     id: 'delete_community',
    //     label: 'Eliminar comunidad',
    //     icon: FaTrash,
    //     color: 'text-red-600',
    //     bgColor: 'bg-red-50 hover:bg-red-100',
    //   });
    // }

    // Suspender usuario (para reportes de usuario o cuando hay autor)
    if (isUserReport && (report.type === 'user' || report.type === 'profile' || report.targetAuthorId)) {
      actions.push({
        id: 'suspend_user',
        label: 'Suspender usuario',
        icon: FaUserSlash,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 hover:bg-orange-100',
      });
    }

    return actions;
  };

  const handleAction = async (action) => {
    setSelectedAction(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!modalData.reason.trim()) {
      alert('Debes proporcionar una razón para esta acción');
      return;
    }

    try {
      let result;

      switch (selectedAction) {
        case 'resolve':
          result = await resolveReport(report.id, modalData.reason);
          break;
        case 'dismiss':
          result = await dismissReport(report.id, modalData.reason);
          break;
        case 'delete_content':
          result = await deleteContent(report.type, report.targetId, modalData.reason, report.forumId);
          break;
        // QUITADO: case 'delete_community'
        case 'suspend_user':
          const userId = report.targetAuthorId || report.targetId;
          if (userId) {
            result = await suspendUser(userId, modalData.reason, modalData.duration);
          } else {
            alert('No se pudo identificar el usuario');
            return;
          }
          break;
        default:
          break;
      }

      if (result?.success) {
        alert('✅ Acción ejecutada correctamente');
        onClose();
        setShowModal(false);
        // No recargar la página, mantener el estado actual
      } else {
        alert(`❌ Error: ${result?.error || 'Acción fallida'}`);
      }
    } catch (error) {
      console.error('Error ejecutando acción:', error);
      alert('❌ Error ejecutando la acción');
    } finally {
      setSelectedAction('');
    }
  };

  const actions = getAvailableActions();

  const getModalTitle = () => {
    switch (selectedAction) {
      case 'resolve': return 'Resolver Reporte';
      case 'dismiss': return 'Desestimar Reporte';
      case 'delete_content': return `Eliminar ${report.type === 'post' ? 'Publicación' : 'Comentario'}`;
      // QUITADO: case 'delete_community'
      case 'suspend_user': return 'Suspender Usuario';
      default: return 'Confirmar Acción';
    }
  };

  return (
    <>
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Acciones de moderación</h4>
        
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        {actions.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">
            No hay acciones disponibles para este reporte
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  disabled={loading}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 transition duration-200 ${action.bgColor} ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Icon className={`w-4 h-4 ${action.color}`} />
                  <span className={`text-sm font-medium ${action.color}`}>
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {getModalTitle()}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razón de la acción
              </label>
              <textarea
                value={modalData.reason}
                onChange={(e) => setModalData(prev => ({ ...prev, reason: e.target.value }))}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe la razón de esta acción..."
                required
              />
            </div>

            {selectedAction === 'suspend_user' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración de la suspensión
                </label>
                <select
                  value={modalData.duration}
                  onChange={(e) => setModalData(prev => ({ ...prev, duration: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1 day">1 día</option>
                  <option value="7 days">7 días</option>
                  <option value="30 days">30 días</option>
                  <option value="permanent">Permanente</option>
                </select>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setModalData({ reason: '', duration: '7 days' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAction}
                disabled={!modalData.reason.trim() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                )}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModerationActions;