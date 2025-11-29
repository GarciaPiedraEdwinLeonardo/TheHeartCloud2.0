import { FaSpinner } from 'react-icons/fa';

function LoadingSpinner({ message = 'Cargando...', size = 'medium' }) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <FaSpinner 
        className={`${sizeClasses[size]} text-blue-600 animate-spin mb-3`} 
      />
      <p className={`text-gray-600 ${textSizes[size]} font-medium`}>
        {message}
      </p>
    </div>
  );
}

export default LoadingSpinner;