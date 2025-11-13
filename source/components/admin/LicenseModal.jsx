import { FaTimes, FaDownload, FaCheck, FaTimes as FaClose } from 'react-icons/fa';
import { useState } from 'react';

function LicenseModal({ user, isOpen, onClose, onApprove, onReject }) {
  const [rejectionReason, setRejectionReason] = useState('');

  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = user.professionalInfo.licenseDocument + '?fl_attachment';
    link.download = `cedula_${user.name.apellidopat}_${user.name.name}.pdf`;
    link.click();
  };

  const handleApprove = () => {
    onApprove(user.id);
    onClose();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Por favor ingresa un motivo de rechazo');
      return;
    }
    onReject(user.id, rejectionReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Verificación de Cédula</h2>
            <p className="text-gray-600 mt-1">
              {user.name.name} {user.name.apellidopat} {user.name.apellidomat}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <FaClose className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Información del usuario */}
          <div className="md:w-1/3 border-r border-gray-200 p-6 bg-gray-50">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Datos Personales</h3>
                <p className="text-gray-700">
                  {user.name.name} {user.name.apellidopat} {user.name.apellidomat}
                </p>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Datos Profesionales</h3>
                <p className="text-gray-700">
                  <strong>Cédula:</strong> {user.professionalInfo.licenseNumber}
                </p>
                <p className="text-gray-700">
                  <strong>Especialidad:</strong> {user.professionalInfo.specialty}
                </p>
                <p className="text-gray-700">
                  <strong>Universidad:</strong> {user.professionalInfo.university}
                </p>
                <p className="text-gray-700">
                  <strong>Año:</strong> {user.professionalInfo.titulationYear}
                </p>
              </div>

              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition duration-200"
              >
                <FaDownload className="w-4 h-4" />
                Descargar Cédula
              </button>
            </div>
          </div>

          {/* Vista del documento */}
          <div className="md:w-2/3 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h3 className="font-semibold text-gray-900">Documento de Cédula Profesional</h3>
            </div>
            
            <div className="flex-1 p-4 bg-gray-100 overflow-auto">
              {user.professionalInfo.licenseDocument ? (
                <iframe
                  src={user.professionalInfo.licenseDocument}
                  className="w-full h-full min-h-[500px] border rounded-lg bg-white"
                  title="Cédula profesional"
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No hay documento disponible
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex-1 mr-4">
            <input
              type="text"
              placeholder="Motivo de rechazo (opcional)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg font-semibold transition duration-200"
            >
              <FaTimes className="w-4 h-4" />
              Rechazar
            </button>
            
            <button
              onClick={handleApprove}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-semibold transition duration-200"
            >
              <FaCheck className="w-4 h-4" />
              Aprobar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LicenseModal;