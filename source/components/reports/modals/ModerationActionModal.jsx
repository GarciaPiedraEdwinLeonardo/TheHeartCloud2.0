import { useState } from 'react';
import { 
  FaTimes, 
  FaSpinner, 
  FaExclamationTriangle, 
  FaUserShield,
  FaTrash,
  FaBan,
  FaUserSlash,
  FaCommentSlash,
  FaFileExport
} from 'react-icons/fa';

export const ModerationActionModal = ({ 
  isOpen, 
  onClose, 
  report, 
  onActionTaken, 
  onDismiss 
}) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const actions = {
    post: [
      { id: 'remove_post', label: 'Eliminar Publicación', icon: FaTrash, severity: 'medium' },
      { id: 'warn_author', label: 'Advertir Autor', icon: FaExclamationTriangle, severity: 'low' },
      { id: 'suspend_author', label: 'Suspender Autor', icon: FaUserSlash, severity: 'high' }
    ],
    comment: [
      { id: 'remove_comment', label: 'Eliminar Comentario', icon: FaCommentSlash, severity: 'medium' },
      { id: 'warn_author', label: 'Advertir Autor', icon: FaExclamationTriangle, severity: 'low' },
      { id: 'suspend_author', label: 'Suspender Autor', icon: FaUserSlash, severity: 'high' }
    ],
    user: [
      { id: 'warn_user', label: 'Advertir Usuario', icon: FaExclamationTriangle, severity: 'low' },
      { id: 'suspend_user', label: 'Suspender Usuario', icon: FaUserSlash, severity: 'high' },
      { id: 'ban_user', label: 'Banear Permanentemente', icon: FaBan, severity: 'critical' }
    ],
    profile: [
      { id: 'verify_profile', label: 'Solicitar Verificación', icon: FaUserShield, severity: 'low' },
      { id: 'warn_user', label: 'Advertir Usuario', icon: FaExclamationTriangle, severity: 'medium' },
      { id: 'suspend_user', label: 'Suspender Usuario', icon: FaUserSlash, severity: 'high' }
    ],
    forum: [
      { id: 'warn_owner', label: 'Advertir Dueño', icon: FaExclamationTriangle, severity: 'low' },
      { id: 'suspend_forum', label: 'Suspender Comunidad', icon: FaBan, severity: 'high' }
    ]
  };

  const getAvailableActions = () => {
    return actions[report.targetType] || [];
  };

  const getActionConfig = (actionId) => {
    const configs = {
      remove_post: { 
        label: 'Eliminar Publicación', 
        description: 'La publicación será eliminada y el autor notificado.',
        requiresReason: true 
      },
      remove_comment: { 
        label: 'Eliminar Comentario', 
        description: 'El comentario será eliminado y el autor notificado.',
        requiresReason: true 
      },
      warn_author: { 
        label: 'Advertir Autor', 
        description: 'El autor recibirá una advertencia formal.',
        requiresReason: true 
      },
      suspend_author: { 
        label: 'Suspender Autor', 
        description: 'El autor será suspendido temporalmente.',
        requiresReason: true,
        requiresDuration: true 
      },
      warn_user: { 
        label: 'Advertir Usuario', 
        description: 'El usuario recibirá una advertencia formal.',
        requiresReason: true 
      },
      suspend_user: { 
        label: 'Suspender Usuario', 
        description: 'El usuario será suspendido temporalmente.',
        requiresReason: true,
        requiresDuration: true 
      },
      ban_user: { 
        label: 'Banear Permanentemente', 
        description: 'El usuario será baneado permanentemente de la plataforma.',
        requiresReason: true 
      },
      verify_profile: { 
        label: 'Solicitar Verificación', 
        description: 'Se solicitará verificación adicional del perfil.',
        requiresReason: false 
      },
      suspend_forum: { 
        label: 'Suspender Comunidad', 
        description: 'La comunidad será suspendida temporalmente.',
        requiresReason: true,
        requiresDuration: true 
      }
    };
    return configs[actionId] || { label: actionId, requiresReason: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAction) {
      setError('Selecciona una acción');
      return;
    }

    const actionConfig = getActionConfig(selectedAction);
    if (actionConfig.requiresReason && !reason.trim()) {
      setError('Proporciona un motivo para esta acción');
      return;
    }

    if (reason.length < 10) {
      setError('El motivo debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      
      if (selectedAction === 'dismiss') {
        result = await onDismiss(report.id, reason);
      } else {
        result = await onActionTaken(report.id, selectedAction, reason, notes);
      }

      if (result.success) {
        onClose();
        // Reset form
        setSelectedAction('');
        setReason('');
        setNotes('');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error procesando la acción');
      console.error('Error en acción de moderación:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (!reason.trim()) {
      setError('Proporciona un motivo para desestimar');
      return;
    }

    setLoading(true);
    try {
      const result = await onDismiss(report.id, reason);
      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error desestimando reporte');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const availableActions = getAvailableActions();
  const selectedActionConfig = selectedAction ? getActionConfig(selectedAction) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUserShield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Acción de Moderación</h2>
              <p className="text-sm text-gray-600">Reporte de {report.targetType}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(90vh-80px)]">
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Información del Reporte */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Reporte a procesar</h3>
              <p className="text-sm text-gray-600"><strong>Motivo:</strong> {report.reason}</p>
              {report.description && (
                <p className="text-sm text-gray-600 mt-1"><strong>Descripción:</strong> {report.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                ID: {report.id} • Urgencia: {report.urgency}
              </p>
            </div>

            {/* Selección de Acción */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Seleccionar acción *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {availableActions.map((action) => (
                  <label
                    key={action.id}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition duration-200 ${
                      selectedAction === action.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="action"
                      value={action.id}
                      checked={selectedAction === action.id}
                      onChange={(e) => setSelectedAction(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <action.icon className={`w-5 h-5 ${
                      action.severity === 'high' ? 'text-red-600' :
                      action.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{action.label}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {getActionConfig(action.id).description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Motivo */}
            {selectedActionConfig?.requiresReason && (
              <div className="mb-6">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de la acción *
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none disabled:opacity-50"
                  placeholder="Explica detalladamente el motivo de esta acción..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reason.length} caracteres (mínimo 10)
                </p>
              </div>
            )}

            {/* Notas adicionales */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notas adicionales (opcional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none disabled:opacity-50"
                placeholder="Notas internas para otros moderadores..."
              />
            </div>

            {/* Advertencia */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">Acción registrada</h4>
                  <p className="text-xs text-yellow-700">
                    Esta acción quedará registrada en el historial de moderación y será visible para otros administradores.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDismiss}
                disabled={loading || !reason.trim()}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium disabled:opacity-50 order-2 sm:order-1"
              >
                Desestimar Reporte
              </button>
              <div className="flex gap-3 order-1 sm:order-2 sm:ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedAction || (selectedActionConfig?.requiresReason && reason.length < 10)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
                  Aplicar Acción
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};