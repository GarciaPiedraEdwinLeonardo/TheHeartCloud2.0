import { FaUsers, FaUserPlus, FaSpinner, FaClock } from 'react-icons/fa';

function WelcomeMessage({ requiresApproval, hasPendingRequest, actionLoading, onJoinLeave }) {
  if (hasPendingRequest) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 text-center">
        <div className="text-gray-400 mb-4">
          <FaUsers className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Solicitud Enviada
        </h3>
        <p className="text-gray-600 mb-4">
          Tu solicitud para unirte a esta comunidad está en revisión. 
          Un moderador la aprobará pronto.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 inline-flex items-center gap-2">
          <FaClock className="w-4 h-4 text-blue-600" />
          <span className="text-blue-700 text-sm">Esperando aprobación</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 text-center">
      <div className="text-gray-400 mb-4">
        <FaUsers className="w-12 h-12 mx-auto" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {requiresApproval ? 'Solicitar Unirse a la Comunidad' : 'Unirse a la Comunidad'}
      </h3>
      <p className="text-gray-600 mb-4">
        {requiresApproval 
          ? 'Envía una solicitud para unirte a esta comunidad. Un moderador la revisará pronto.'
          : 'Únete para poder interactuar y publicar contenido.'
        }
      </p>
      <button
        onClick={onJoinLeave}
        disabled={actionLoading}
        className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition duration-200 font-medium flex items-center gap-2 mx-auto disabled:opacity-50"
      >
        {actionLoading ? (
          <FaSpinner className="w-4 h-4 animate-spin" />
        ) : (
          <FaUserPlus className="w-4 h-4" />
        )}
        {actionLoading ? 'Procesando...' : (
          requiresApproval ? 'Solicitar Unirse' : 'Unirse a la Comunidad'
        )}
      </button>
    </div>
  );
}

export default WelcomeMessage;