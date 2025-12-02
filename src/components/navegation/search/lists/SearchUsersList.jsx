import { FaUser, FaAward, FaComment, FaArrowRight } from 'react-icons/fa';

function SearchUsersList({ users, searchQuery, onUserClick, queryDisplay }) {
  if (users.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8">
        <div className="text-gray-400 mb-3 sm:mb-4">
          <FaUser className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
        </div>
        <p className="text-gray-500 text-base sm:text-lg mb-1 sm:mb-2 px-2">
          No se encontraron usuarios relacionados con "{queryDisplay || searchQuery}"
        </p>
        <p className="text-gray-400 text-xs sm:text-sm px-2">
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

  const handleUserClick = (user) => {
    if (onUserClick) {
      onUserClick(user);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {users.map(user => (
        <div 
          key={user.id} 
          className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition duration-200 cursor-pointer group"
          onClick={() => handleUserClick(user)}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-3">
            {/* Avatar - Mostrar foto si existe */}
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.fullName}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-blue-100 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-xs sm:text-sm">
                    {user.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'US'}
                  </span>
                </div>
              )}
              
              {/* Información del usuario - Versión móvil compacta */}
              <div className="sm:hidden flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <h3 className="font-semibold text-gray-900 text-sm break-words line-clamp-1">
                    {user.fullName || 'Usuario'}
                  </h3>
                  <div className="flex-shrink-0">
                    {getRoleBadge(user.role)}
                  </div>
                </div>
                
                {user.professionalInfo?.specialty && (
                  <p className="text-gray-600 text-xs break-words line-clamp-1 mb-1">
                    {user.professionalInfo.specialty}
                  </p>
                )}
              </div>
            </div>
            
            {/* Información del usuario - Versión desktop */}
            <div className="hidden sm:block flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-gray-900 break-words group-hover:text-blue-600 transition duration-200">
                  {user.fullName || 'Usuario'}
                </h3>
                {getRoleBadge(user.role)}
              </div>
              
              {user.professionalInfo?.specialty && (
                <p className="text-gray-600 text-sm mb-2 break-words">
                  {user.professionalInfo.specialty}
                </p>
              )}
              
              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <FaAward className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                  <span className="truncate">Aura: {user.stats?.aura || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaComment className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  <span className="truncate">Contribuciones: {user.stats?.contributionCount || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUser className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span className="truncate">Comunidades: {user.stats?.joinedForumsCount || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Información de stats*/}
            <div className="sm:hidden flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
              <div className="flex items-center gap-1">
                <FaAward className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                <span>Aura: {user.stats?.aura || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaComment className="w-3 h-3 text-blue-500 flex-shrink-0" />
                <span>Contribuciones: {user.stats?.contributionCount || 0}</span>
              </div>
            </div>
            
            {/* Botón de acción */}
            <div className="flex items-center gap-2 justify-between sm:justify-end mt-2 sm:mt-0">
              <div className="sm:hidden flex items-center gap-1 text-xs text-gray-500">
                <FaUser className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span>Comunidades: {user.stats?.joinedForumsCount || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs sm:text-sm hidden sm:block group-hover:block transition duration-200">
                  Ver perfil
                </span>
                <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-600 transition duration-200 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SearchUsersList;