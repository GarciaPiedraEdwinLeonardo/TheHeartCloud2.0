// src/components/suspension/SuspendedScreen.jsx
import { useEffect, useState } from 'react';
import { FaBan, FaClock, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';

function SuspendedScreen({ userData, onLogout }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!userData.suspension.endDate) {
        return 'Permanente';
      }

      const endDate = userData.suspension.endDate.toDate();
      const now = new Date();
      const diff = endDate - now;

      if (diff <= 0) {
        return 'La suspensión ha expirado';
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        return `${days} día${days > 1 ? 's' : ''}, ${hours} hora${hours > 1 ? 's' : ''}`;
      } else if (hours > 0) {
        return `${hours} hora${hours > 1 ? 's' : ''}, ${minutes} minuto${minutes > 1 ? 's' : ''}`;
      } else {
        return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
      }
    };

    setTimeLeft(calculateTimeLeft());
    
    // Actualizar cada minuto si no es permanente
    if (userData.suspension.endDate) {
      const interval = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [userData.suspension.endDate]);

  const isPermanent = !userData.suspension.endDate;
  const startDate = userData.suspension.startDate?.toDate().toLocaleDateString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaBan className="w-10 h-10 text-red-600" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Cuenta Suspendida
        </h1>

        {/* Mensaje */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-red-800 text-sm">
                Tu cuenta ha sido suspendida por violar nuestros términos de servicio.
              </p>
            </div>
          </div>
        </div>

        {/* Información de la suspensión */}
        <div className="space-y-4 mb-6">
          {/* Razón */}
          <div className="text-left">
            <label className="text-sm font-medium text-gray-700">Motivo:</label>
            <p className="text-gray-900 mt-1">{userData.suspension.reason}</p>
          </div>

          {/* Fecha de inicio */}
          <div className="text-left">
            <label className="text-sm font-medium text-gray-700">Fecha de suspensión:</label>
            <p className="text-gray-900 mt-1 flex items-center gap-2">
              <FaCalendarAlt className="w-4 h-4 text-gray-500" />
              {startDate}
            </p>
          </div>

          {/* Tiempo restante */}
          <div className="text-left">
            <label className="text-sm font-medium text-gray-700">
              {isPermanent ? 'Duración:' : 'Tiempo restante:'}
            </label>
            <p className="text-gray-900 mt-1 flex items-center gap-2">
              <FaClock className="w-4 h-4 text-gray-500" />
              {isPermanent ? 'Suspensión permanente' : timeLeft}
            </p>
          </div>

          {/* Suspended by */}
          <div className="text-left">
            <label className="text-sm font-medium text-gray-700">Suspendido por:</label>
            <p className="text-gray-900 mt-1">{userData.suspension.suspendedBy}</p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            {isPermanent 
              ? 'Esta suspensión es permanente. Puedes contactar al soporte para apelar esta decisión.'
              : 'Tu acceso será restaurado automáticamente cuando la suspensión expire.'
            }
          </p>
        </div>

        {/* Botón de logout */}
        <button
          onClick={onLogout}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition duration-200 font-medium"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default SuspendedScreen;