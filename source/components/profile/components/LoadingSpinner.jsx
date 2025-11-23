import { FaSpinner } from 'react-icons/fa';

function LoadingSpinner({ message = "Cargando..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mb-4" />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
}

export default LoadingSpinner;