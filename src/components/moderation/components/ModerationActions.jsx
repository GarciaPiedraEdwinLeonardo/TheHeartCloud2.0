import { useState } from 'react';
import { 
  FaCheck, 
  FaTimes, 
  FaBan, 
  FaTrash, 
  FaUserSlash, 
  FaEye,
  FaSpinner
} from 'react-icons/fa';
import { useModerationActions } from './../hooks/useModerationActions';

function ModerationActions({ report, onClose }) {
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolutionReason, setResolutionReason] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  
  const { 
    resolveReport, 
    suspendUser, 
    deleteContent, 
    banFromCommunity,
    loading,
    error 
  } = useModerationActions();

  const handleAction = async (action) => {
    setSelectedAction(action);
    
    try {
      let result;
      
      switch (action) {
        case 'resolve':
          result = await resolveReport(report.id, resolutionReason);
          break;
          
        case 'suspend_user':
          result = await suspendUser(report.targetAuthorId, 'Violación de normas', '7 days');
          break;
          
        case 'delete_content':
          if (report.type === 'post') {
            result = await deleteContent('post', report.targetId, 'Contenido inapropiado');
          } else if (report.type === 'comment') {
            result = await deleteContent('comment', report.targetId, 'Comentario inapropiado');
          }
          break;
          
        case 'ban_community':
          if (report.forumId) {
            result = await banFromCommunity(report.forumId, report.targetAuthorId, 'Comportamiento inapropiado');
          }
          break;
          
        default:
          break;
      }
      
      if (result?.success) {
        onClose();
        setShowResolutionModal(false);
        // Podríamos mostrar un toast de éxito aquí
      }
    } catch (error) {
      console.error('Error ejecutando acción:', error);
    } finally {
      setSelectedAction('');
    }
  };

  const getAvailableActions = () => {
    const baseActions = [
      {
        id: 'view_details',
        label: 'Ver detalles',
        icon: FaEye,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 hover:bg-blue-100',
        onClick: () => console.log('Ver detalles:', report)
      }
    ];

    // Acciones para reportes pendientes
    if (report.status === 'pending' || report.status === 'pending_review') {
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
          onClick: () => handleAction('dismiss')
        }
      );
    }

    // Acciones específicas por tipo de contenido
    if (report.type === 'post' || report.type === 'comment') {
      baseActions.push({
        id: 'delete_content',
        label: 'Eliminar contenido',
        icon: FaTrash,
        color: 'text-red-600',
        bgColor: 'bg-red-50 hover:bg-red-100',
        onClick: () => handleAction('delete_content')
      });
    }

    // Acciones para usuarios
    if (report.type === 'user' || report.type === 'profile' || report.targetAuthorId) {
      baseActions.push(
        {
          id: 'suspend_user',
          label: 'Suspender usuario',
          icon: FaUserSlash,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 hover:bg-orange-100',
          onClick: () => handleAction('suspend_user')
        }
      );

      // Banear de comunidad si hay contexto de foro
      if (report.forumId) {
        baseActions.push({
          id: 'ban_community',
          label: 'Banear de comunidad',
          icon: FaBan,
          color: 'text-red-600',
          bgColor: 'bg-red-50 hover:bg-red-100',
          onClick: () => handleAction('ban_community')
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

      {/* Modal para resolución de reportes */}
      {showResolutionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resolver reporte
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justificación de la resolución
              </label>
              <textarea
                value={resolutionReason}
                onChange={(e) => setResolutionReason(e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe por qué estás resolviendo este reporte..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResolutionModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAction('resolve')}
                disabled={!resolutionReason.trim() || loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && selectedAction === 'resolve' && (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                )}
                Confirmar resolución
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModerationActions;