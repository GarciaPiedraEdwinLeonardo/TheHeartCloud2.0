import { FaUsers, FaCalendar, FaEdit, FaArrowLeft, FaCheckCircle, FaCrown, FaUserShield } from 'react-icons/fa';

function ForumHeader({ forumDetails, userMembership, onBack }) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            <FaCrown className="w-3 h-3" />
            Dueño
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            <FaUserShield className="w-3 h-3" />
            Moderador
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('es-ES');
      }
      return new Date(timestamp).toLocaleDateString('es-ES');
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-green-100">
            <FaUsers className="w-6 h-6 text-green-600" />
          </div>
          <div className='min-w-0 flex-1'>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">
              {forumDetails.name}
            </h1>
            <p className="text-gray-600 text-lg break-words whitespace-normal">
              {forumDetails.description}
            </p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition duration-200"
        >
          <FaArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </button>
      </div>

      {/* Estadísticas del Foro */}
      <div className="flex flex-wrap gap-6 text-sm text-gray-500 border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2">
          <FaCalendar className="w-4 h-4" />
          <span>Creado el {formatDate(forumDetails.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaUsers className="w-4 h-4" />
          <span>{(forumDetails.memberCount || 0).toLocaleString()} miembros</span>
        </div>
        <div className="flex items-center gap-2">
          <FaEdit className="w-4 h-4" />
          <span>{(forumDetails.postCount || 0)} publicaciones</span>
        </div>
        {userMembership.role && (
          <div className="flex items-center gap-2">
            {getRoleBadge(userMembership.role)}
          </div>
        )}
        {forumDetails.requiresPostApproval && (
          <div className="flex items-center gap-2">
            <FaCheckCircle className="w-4 h-4 text-blue-500" />
            <span>Validación de posts activa</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForumHeader;