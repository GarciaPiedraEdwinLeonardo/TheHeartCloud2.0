import { FaExclamationTriangle, FaRedo, FaHome, FaUser } from 'react-icons/fa';

function ErrorMessage({ 
  message, 
  onRetry, 
  showHomeButton = false,
  showProfileButton = false,
  type = 'error',
  onHomeClick,
  onProfileClick
}) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <FaExclamationTriangle className="w-8 h-8 text-yellow-600" />;
      case 'info':
        return <FaUser className="w-8 h-8 text-blue-600" />;
      default:
        return <FaExclamationTriangle className="w-8 h-8 text-red-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-red-800';
    }
  };

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
  };

  return (
    <div className={`rounded-lg shadow-sm border p-6 max-w-md mx-auto ${getBackgroundColor()}`}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
          {getIcon()}
        </div>
        
        <h3 className={`text-lg font-semibold mb-2 ${getTextColor()}`}>
          {type === 'warning' ? 'Advertencia' : type === 'info' ? 'Información' : 'Error'}
        </h3>
        <p className={`mb-4 text-sm ${getTextColor().replace('800', '700')}`}>
          {message}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition duration-200 text-sm font-medium ${
                type === 'warning' 
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                  : type === 'info'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              <FaRedo className="w-4 h-4" />
              Reintentar
            </button>
          )}
          
          {showHomeButton && (
            <button
              onClick={handleHomeClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200 text-sm font-medium"
            >
              <FaHome className="w-4 h-4" />
              Ir al Inicio
            </button>
          )}
          
          {showProfileButton && (
            <button
              onClick={handleProfileClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-medium"
            >
              <FaUser className="w-4 h-4" />
              Mi Perfil
            </button>
          )}
        </div>

        {/* Información adicional para errores específicos */}
        {type === 'error' && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600">
              Si el problema persiste, contacta con soporte técnico.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;