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

  // Función para ver detalles
  const handleViewDetails = () => {
    console.log('🔍 Ver detalles del reporte:', report);
    // Aquí podrías abrir un modal con más información
    alert(`Detalles del reporte:\n\nTipo: ${report.type || report.actionType}\nID: ${report.id}\nTarget: ${report.targetName}\nAutor: ${report.targetAuthorName || 'N/A'}\nMotivo: ${report.reason || 'N/A'}`);
  };

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
          const userId = report.targetAuthorId || report.userId;
          if (userId) {
            result = await suspendUser(userId, reason, modalData.duration);
          } else {
            alert('No se pudo identificar el usuario a suspender');
            return;
          }
          break;
          
        case 'delete_content':
          if (report.type === 'post' || report.actionType?.includes('post')) {
            result = await deleteContent('post', report.targetId || report.postId, reason);
          } else if (report.type === 'comment' || report.actionType?.includes('comment')) {
            result = await deleteContent('comment', report.targetId || report.commentId, reason);
          } else {
            alert('Tipo de contenido no soportado para eliminación');
            return;
          }
          break;

        case 'delete_community':
          if (report.type === 'forum' || report.targetId) {
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

  // Obtener acciones disponibles según el tipo de reporte
  const getAvailableActions = () => {
    const baseActions = [
      {
        id: 'view_details',
        label: 'Ver detalles',
        icon: FaEye,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 hover:bg-blue-100',
        onClick: handleViewDetails
      }
    ];

    const isPending = report.status === 'pending' || report.status === 'pending_review';
    const isGlobalReport = report.actionType; // Tiene actionType = es de global_moderation_reports

    // Acciones para reportes pendientes
    if (isPending) {
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

    // Acciones de eliminación según tipo de contenido
    const contentType = report.type || 
                      (report.actionType?.includes('post') ? 'post' : 
                       report.actionType?.includes('comment') ? 'comment' : null);

    if (contentType === 'post' || contentType === 'comment') {
      baseActions.push({
        id: 'delete_content',
        label: `Eliminar ${contentType === 'post' ? 'publicación' : 'comentario'}`,
        icon: FaTrash,
        color: 'text-red-600',
        bgColor: 'bg-red-50 hover:bg-red-100',
        onClick: () => setShowDeleteModal(true)
      });
    }

    // Eliminar comunidad
    if (report.type === 'forum') {
      baseActions.push({
        id: 'delete_community',
        label: 'Eliminar comunidad',
        icon: FaUsers,
        color: 'text-red-600',
        bgColor: 'bg-red-50 hover:bg-red-100',
        onClick: () => setShowDeleteModal(true)
      });
    }

    // Acciones para usuarios (disponible en ambos tipos de reportes)
    const userId = report.targetAuthorId || report.userId;
    if (userId) {
      baseActions.push(
        {
          id: 'suspend_user',
          label: 'Suspender usuario',
          icon: FaUserSlash,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 hover:bg-orange-100',
          onClick: () => setShowSuspendModal(true)
        }
      );

      // Banear de comunidad si hay contexto
      if (report.forumId) {
        baseActions.push({
          id: 'ban_community',
          label: 'Banear de comunidad',
          icon: FaBan,
          color: 'text-red-600',
          bgColor: 'bg-red-50 hover:bg-red-100',
          onClick: () => setShowDeleteModal(true)
        });
      }
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