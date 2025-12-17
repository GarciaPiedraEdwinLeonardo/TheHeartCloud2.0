import { useState } from 'react';
import { 
  FaCheck, FaTimes, FaSpinner
} from 'react-icons/fa';
import { useModerationActions } from './../hooks/useModerationActions';
import { toast } from 'react-hot-toast';

function ModerationActions({ report, onClose }) {
  const [actionLoading, setActionLoading] = useState('');
  
  const { 
    resolveReport, 
    dismissReport,
    error 
  } = useModerationActions();

  // Obtener acciones disponibles - SOLO para reportes pendientes
  const getAvailableActions = () => {
    const actions = [];

    // Solo para reportes pendientes
    if (report.status === 'pending' || report.status === 'pending_review') {
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
    return actions;
  };

  const handleAction = async (action) => {
    setActionLoading(action);
    
    try {
      let result;

      switch (action) {
        case 'resolve':
          result = await resolveReport(report.id, 'Reporte resuelto');
          break;
        case 'dismiss':
          result = await dismissReport(report.id, 'Reporte desestimado');
          break;
        default:
          break;
      }

      if (result?.success) {
        toast.success('Acción ejecutada correctamente');
        onClose();
        
        // Recargar después de un breve delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const errorMsg = result?.error || 'Error desconocido';
        toast.error(`Error: ${errorMsg}`);
        console.error("Error acción fallida:", errorMsg);        
      }
    } catch (error) {
      console.error('Error ejecutando acción:', error);
      toast.error('Error ejecutando la acción: ' + error.message);
    } finally {
      setActionLoading('');
    }
  };

  const actions = getAvailableActions();

  return (
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
            const isLoading = actionLoading === action.id;
            
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                disabled={actionLoading !== ''}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 transition duration-200 ${action.bgColor} ${
                  actionLoading !== '' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <FaSpinner className="w-4 h-4 animate-spin text-gray-600" />
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
  );
}

export default ModerationActions;