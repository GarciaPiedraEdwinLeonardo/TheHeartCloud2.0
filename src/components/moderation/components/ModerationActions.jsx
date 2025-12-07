import { useState, useRef, useEffect } from 'react';
import { 
  FaCheck, FaTimes, FaTrash, FaSpinner, FaExclamationTriangle 
} from 'react-icons/fa';
import { useModerationActions } from './../hooks/useModerationActions';
import { toast } from 'react-hot-toast';

function ModerationActions({ report, onClose }) {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ reason: '' });
  const [selectedAction, setSelectedAction] = useState('');
  const [validationError, setValidationError] = useState('');
  
  const reasonTextareaRef = useRef(null);
  
  const { 
    resolveReport, 
    dismissReport,
    deleteContent,
    loading,
    error 
  } = useModerationActions();

  // Validar el campo de razón en tiempo real
  const validateReason = (value) => {
    const trimmedValue = value.trim();
    
    if (trimmedValue.length === 0 && value.length > 0) {
      return 'La razón no puede contener solo espacios en blanco';
    }
    
    if (trimmedValue.length < 10) {
      return `Mínimo 10 caracteres (actual: ${trimmedValue.length})`;
    }
    
    if (value.length > 100) {
      return `Máximo 100 caracteres (actual: ${value.length})`;
    }
    
    return '';
  };

  const handleReasonChange = (value) => {
    setModalData(prev => ({ ...prev, reason: value }));
    
    // Validación en tiempo real
    const error = validateReason(value);
    setValidationError(error);
  };

  // Enfocar el textarea cuando se abre el modal
  useEffect(() => {
    if (showModal && reasonTextareaRef.current) {
      setTimeout(() => {
        reasonTextareaRef.current.focus();
      }, 100);
    }
  }, [showModal]);

  // Obtener acciones disponibles - SOLO para reportes pendientes de usuarios
  const getAvailableActions = () => {
    const actions = [];

    // Solo para reportes pendientes
    if (report.status === 'pending') {
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
    setSelectedAction(action);
    setModalData({ reason: '' });
    setValidationError('');
    setShowModal(true);
  };

  const confirmAction = async () => {
    const trimmedReason = modalData.reason.trim();
    
    // Validación final antes de enviar
    const error = validateReason(modalData.reason);
    
    if (error) {
      setValidationError(error);
      
      // Hacer focus en el textarea si hay error
      if (reasonTextareaRef.current) {
        reasonTextareaRef.current.focus();
      }
      
      toast.error("Por favor corrige los errores antes de continuar");
      return;
    }

    try {
      let result;

      switch (selectedAction) {
        case 'resolve':
          result = await resolveReport(report.id, trimmedReason);
          break;
        case 'dismiss':
          result = await dismissReport(report.id, trimmedReason);
          break;
        case 'delete_content':
          result = await deleteContent(report.type, report.targetId, trimmedReason, report.forumId);
          break;
        default:
          break;
      }

      if (result?.success) {
        toast.success('Acción ejecutada correctamente');
        onClose();
        setShowModal(false);
        window.location.reload();
      } else {
        toast.error("Error, acción fallida");
        console.error("Error acción fallida " + error);        
      }
    } catch (error) {
      console.error('Error ejecutando acción:', error);
      toast.error('Error ejecutando la acción');
    } finally {
      setSelectedAction('');
    }
  };

  const getModalTitle = () => {
    switch (selectedAction) {
      case 'resolve': return 'Resolver Reporte';
      case 'dismiss': return 'Desestimar Reporte';
      case 'delete_content': return `Eliminar ${report.type === 'post' ? 'Publicación' : 'Comentario'}`;
      default: return 'Confirmar Acción';
    }
  };

  // Calcular si el botón debe estar deshabilitado
  const isConfirmDisabled = () => {
    const trimmedReason = modalData.reason.trim();
    return trimmedReason.length < 10 || trimmedReason.length > 100 || loading;
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
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Razón de la acción
                </label>
                <span className={`text-xs ${modalData.reason.length > 100 ? 'text-red-600' : 'text-gray-500'}`}>
                  {modalData.reason.length}/100
                </span>
              </div>
              <textarea
                ref={reasonTextareaRef}
                value={modalData.reason}
                onChange={(e) => handleReasonChange(e.target.value)}
                rows={4}
                maxLength={100}
                className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500 ${
                  validationError 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Describe la razón de esta acción (mínimo 10 caracteres)..."
                required
              />
              
              {validationError && (
                <div className="mt-2 flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                  <FaExclamationTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
              
              {modalData.reason.trim().length >= 10 && modalData.reason.trim().length <= 100 && (
                <div className="mt-2 text-xs text-green-600">
                  ✓ La razón tiene la longitud adecuada
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setModalData({ reason: '' });
                  setValidationError('');
                }}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAction}
                disabled={isConfirmDisabled()}
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