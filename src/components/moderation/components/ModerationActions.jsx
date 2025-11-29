import { useState } from 'react';
import { 
  FaCheck, 
  FaTimes, 
  FaBan, 
  FaTrash, 
  FaUserSlash, 
  FaEye,
  FaUsers,
  FaSpinner
} from 'react-icons/fa';
import { useModerationActions } from './../hooks/useModerationActions';

function ModerationActions({ report, onClose }) {
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
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

  // Determinar tipo de contenido
  const getContentType = () => {
    if (report.actionType) {
      return { type: 'global', label: 'Reporte Global' };
    }
    return { type: report.type, label: `Reporte de ${report.type}` };
  };

  const contentType = getContentType();
  const isGlobalReport = contentType.type === 'global';
  const isUserReport = report.type === 'user' || report.type === 'profile';

  // Función para manejar acciones
  const handleAction = async (action, customData = null) => {
    setSelectedAction(action);
    
    try {
      let result;
      const reason = customData?.reason || modalData.reason;
      
      switch (action) {
        case 'resolve':
          result = await resolveReport(report.id, reason);
          break;
          
        case 'dismiss':
          result = await dismissReport(report.id, reason || 'Reporte desestimado sin acción');
          break;
          
        case 'suspend_user':
          // Obtener userId de diferentes fuentes según el tipo de reporte
          let userId;
          if (isUserReport) {
            userId = report.targetId; // Para reportes de perfil, targetId es el usuario
          } else if (isGlobalReport) {
            userId = report.userId; // Para global reports
          } else {
            userId = report.targetAuthorId; // Para otros reportes
          }
          
          if (userId) {
            result = await suspendUser(userId, reason, modalData.duration);
          } else {
            alert('No se pudo identificar el usuario a suspender');
            return;
          }
          break;
          
        case 'delete_content':
          // NO permitir eliminar contenido en reportes globales (ya está eliminado)
          if (isGlobalReport) {
            alert('Este contenido ya ha sido procesado por un moderador');
            return;
          }
          
          if (report.type === 'post') {
            result = await deleteContent('post', report.targetId, reason);
          } else if (report.type === 'comment') {
            result = await deleteContent('comment', report.targetId, reason);
          } else {
            alert('Tipo de contenido no soportado para eliminación');
            return;
          }
          break;

        case 'delete_community':
          if (report.type === 'forum') {
            result = await deleteCommunity(report.targetId, reason);
          } else {
            alert('No se pudo identificar la comunidad a eliminar');
            return;
          }
          break;
          
        case 'ban_community':
          const banUserId = report.targetAuthorId || report.userId;
          const forumId = report.forumId;
          if (forumId && banUserId) {
            result = await banFromCommunity(forumId, banUserId, reason);
          } else {
            alert('Falta información para banear de la comunidad');
            return;
          }
          break;
          
        default:
          break;
      }
      
      if (result?.success) {
        alert('✅ Acción ejecutada correctamente');
        onClose();
        setShowResolutionModal(false);
        setShowDeleteModal(false);
        setShowSuspendModal(false);
        // Recargar la página o datos
        window.location.reload();
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

  // Obtener acciones disponibles según el tipo de reporte - CORREGIDO
  const getAvailableActions = () => {
    const baseActions = [];

    const isPending = report.status === 'pending' || report.status === 'pending_review';
    const isUserReport = report.type === 'user' || report.type === 'profile';
    const isContentReport = report.type === 'post' || report.type === 'comment';
    const isForumReport = report.type === 'forum';

    // Acciones para reportes pendientes (NO globales)
    if (isPending && !isGlobalReport) {
      baseActions.push(
        {
          id: 'resolve',
          label: 'Marcar como resuelto',
          icon: FaCheck,
          color: 'text-green-600',
          bgColor: 'bg-green-50 hover:bg-green-100',
          onClick: () => setShowResolutionModal(true)
        },
        {
          id: 'dismiss',
          label: 'Desestimar reporte',
          icon: FaTimes,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 hover:bg-gray-100',
          onClick: () => setShowResolutionModal(true)
        }
      );
    }

    // Acciones de eliminación SOLO para contenido activo (NO globales)
    if (isContentReport && !isGlobalReport) {
      baseActions.push({
        id: 'delete_content',
        label: `Eliminar ${report.type === 'post' ? 'publicación' : 'comentario'}`,
        icon: FaTrash,
        color: 'text-red-600',
        bgColor: 'bg-red-50 hover:bg-red-100',
        onClick: () => setShowDeleteModal(true)
      });
    }

    // Eliminar comunidad SOLO si no es global
    if (isForumReport && !isGlobalReport) {
      baseActions.push({
        id: 'delete_community',
        label: 'Eliminar comunidad',
        icon: FaUsers,
        color: 'text-red-600',
        bgColor: 'bg-red-50 hover:bg-red-100',
        onClick: () => setShowDeleteModal(true)
      });
    }

    // Suspender usuario - ESPECIALMENTE para reportes de perfil/usuario
    const userId = report.targetAuthorId || report.userId || 
                  (isUserReport ? report.targetId : null);
    if (userId && !isGlobalReport) {
      baseActions.push({
        id: 'suspend_user',
        label: 'Suspender usuario',
        icon: FaUserSlash,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 hover:bg-orange-100',
        onClick: () => setShowSuspendModal(true)
      });
    }

    // Banear de comunidad si hay contexto y no es global
    if (report.forumId && userId && !isGlobalReport) {
      baseActions.push({
        id: 'ban_community',
        label: 'Banear de comunidad',
        icon: FaBan,
        color: 'text-red-600',
        bgColor: 'bg-red-50 hover:bg-red-100',
        onClick: () => setShowDeleteModal(true)
      });
    }

    return baseActions;
  };

  const actions = getAvailableActions();

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
                  onClick={action.onClick}
                  disabled={loading && selectedAction === action.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 transition duration-200 ${action.bgColor} ${
                    loading && selectedAction === action.id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading && selectedAction === action.id ? (
                    <FaSpinner className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <Icon className={`w-4 h-4 ${action.color}`} />
                  )}
                  <span className={`text-sm font-medium ${action.color}`}>
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para resolución/desestimación */}
      {(showResolutionModal || showDeleteModal || showSuspendModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showResolutionModal && (selectedAction === 'resolve' ? 'Resolver reporte' : 'Desestimar reporte')}
              {showDeleteModal && 'Eliminar contenido'}
              {showSuspendModal && 'Suspender usuario'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {showSuspendModal ? 'Razón de la suspensión' : 'Justificación'}
              </label>
              <textarea
                value={modalData.reason}
                onChange={(e) => setModalData(prev => ({ ...prev, reason: e.target.value }))}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={
                  showResolutionModal ? "Describe por qué estás resolviendo este reporte..." :
                  showDeleteModal ? "Describe por qué estás eliminando este contenido..." :
                  "Describe por qué estás suspendiendo a este usuario..."
                }
              />
            </div>

            {showSuspendModal && (
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
                  setShowResolutionModal(false);
                  setShowDeleteModal(false);
                  setShowSuspendModal(false);
                  setModalData({ reason: '', duration: '7 days' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const action = showResolutionModal ? 
                    (selectedAction === 'resolve' ? 'resolve' : 'dismiss') :
                    showDeleteModal ? 
                    (report.type === 'forum' ? 'delete_community' : 'delete_content') :
                    'suspend_user';
                  
                  handleAction(action);
                }}
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