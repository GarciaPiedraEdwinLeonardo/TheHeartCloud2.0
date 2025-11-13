import { useState } from 'react';
import { usePendingUsers } from '../../hooks/usePendingUsers';
import LicenseModal from './LicenseModal';
import { FaEye, FaUserClock, FaSpinner } from 'react-icons/fa';

function VerificationPanel() {
  const { pendingUsers, loading, error, approveUser, rejectUser } = usePendingUsers();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewLicense = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleApprove = async (userId) => {
    const result = await approveUser(userId);
    if (result.success) {
      alert('Usuario aprobado exitosamente');
    } else {
      alert('Error al aprobar usuario: ' + result.error);
    }
  };

  const handleReject = async (userId, reason) => {
    const result = await rejectUser(userId, reason);
    if (result.success) {
      alert('Usuario rechazado exitosamente');
    } else {
      alert('Error al rechazar usuario: ' + result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin h-8 w-8 text-blue-600 mr-3" />
        <span className="text-gray-600">Cargando solicitudes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaUserClock className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Verificación de Médicos
              </h2>
              <p className="text-gray-600 text-sm">
                {pendingUsers.length} solicitudes pendientes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de solicitudes */}
      <div className="divide-y divide-gray-200">
        {pendingUsers.length === 0 ? (
          <div className="text-center py-12">
            <FaUserClock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No hay solicitudes pendientes
            </h3>
            <p className="mt-2 text-gray-500">
              Todas las solicitudes han sido revisadas.
            </p>
          </div>
        ) : (
          pendingUsers.map((user) => (
            <div key={user.id} className="p-6 hover:bg-gray-50 transition duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dr. {user.name.name} {user.name.apellidopat} {user.name.apellidomat}
                  </h3>
                  <p className="text-gray-600">{user.email}</p>
                  
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Cédula:</span>
                      <p className="text-gray-700">{user.professionalInfo.licenseNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium">Especialidad:</span>
                      <p className="text-gray-700">{user.professionalInfo.specialty}</p>
                    </div>
                    <div>
                      <span className="font-medium">Universidad:</span>
                      <p className="text-gray-700">{user.professionalInfo.university}</p>
                    </div>
                    <div>
                      <span className="font-medium">Año:</span>
                      <p className="text-gray-700">{user.professionalInfo.titulationYear}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleViewLicense(user)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition duration-200"
                  >
                    <FaEye className="w-4 h-4" />
                    Ver Cédula
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para ver cédula */}
      {selectedUser && (
        <LicenseModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}

export default VerificationPanel;