// components/SearchUsersList.jsx
import { FaUser, FaAward, FaComment } from 'react-icons/fa';

function SearchUsersList({ users, searchQuery, onUserClick }) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <FaUser className="w-16 h-16 mx-auto" />
        </div>
        <p className="text-gray-500 text-lg mb-2">
          No se encontraron usuarios relacionados con "{searchQuery}"
        </p>
        <p className="text-gray-400 text-sm">
          Intenta con otros términos de búsqueda
        </p>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    const baseClasses = "text-xs font-medium px-2 py-1 rounded-full";
    
    switch (role) {
      case 'doctor':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Doctor</span>;
      case 'admin':
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>Administrador</span>;
      case 'moderator':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Moderador</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>No Verificado</span>;
    }
  };

  return (
    <div className="space-y-4">
      {users.map(user => (
        <div 
          key={user.id} 
          className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition duration-200 cursor-pointer group"
          onClick={() => onUserClick(user)}
        >
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-semibold text-sm">
                {user.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'US'}
              </span>
            </div>
            
            {/* Información del usuario */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-gray-900 break-words">
                  {user.fullName || 'Usuario'}
                </h3>
                {getRoleBadge(user.role)}
              </div>
              
              {user.professionalInfo?.specialty && (
                <p className="text-gray-600 text-sm mb-2 break-words">
                  {user.professionalInfo.specialty}
                </p>
              )}
              
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <FaAward className="w-3 h-3" />
                  <span>Aura: {user.stats?.aura || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaComment className="w-3 h-3" />
                  <span>Contribuciones: {user.stats?.contributionCount || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUser className="w-3 h-3" />
                  <span>Comunidades: {user.stats?.joinedForumsCount || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Botón de acción */}
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm opacity-0 group-hover:opacity-100">
              Ver Perfil
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SearchUsersList;