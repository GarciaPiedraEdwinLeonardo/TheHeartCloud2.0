import { FaExclamationTriangle, FaClock, FaUser, FaTrash } from 'react-icons/fa';

export const UserStrikeCard = ({ strike, onRemoveStrike }) => {
  const getSeverityColor = () => {
    switch (strike.severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No expira';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('es-ES');
      }
      return new Date(timestamp).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  const isExpired = strike.expiresAt && new Date(strike.expiresAt) < new Date();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-4 h-4 text-orange-500" />
            <span className="font-medium text-gray-900">
              {strike.points} punto{strike.points !== 1 ? 's' : ''}
            </span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor()}`}>
            {strike.severity === 'high' ? 'Alto' : 
             strike.severity === 'medium' ? 'Medio' : 'Bajo'}
          </span>
          {!strike.isActive && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200">
              Expirado
            </span>
          )}
          {isExpired && strike.isActive && (
            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-600 rounded-full border border-yellow-200">
              Por expirar
            </span>
          )}
        </div>

        {strike.isActive && onRemoveStrike && (
          <button
            onClick={() => onRemoveStrike(strike.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Remover strike"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-700">{strike.reason}</p>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <FaUser className="w-3 h-3" />
            <span>Por: {strike.givenBy.slice(0, 8)}...</span>
          </div>
          <div className="flex items-center gap-1">
            <FaClock className="w-3 h-3" />
            <span>Expira: {formatDate(strike.expiresAt)}</span>
          </div>
        </div>

        {strike.relatedContent && (
          <span className="text-gray-400">
            {strike.relatedContent.type}: {strike.relatedContent.id.slice(-6)}
          </span>
        )}
      </div>
    </div>
  );
};