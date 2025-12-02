import { FaUser, FaAward, FaComment, FaArrowRight } from 'react-icons/fa';

function SearchUsersList({ users, searchQuery, onUserClick, queryDisplay }) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <FaUser className="w-16 h-16 mx-auto" />
        </div>
        <p className="text-gray-500 text-lg mb-2">
          No se encontraron usuarios relacionados con "{queryDisplay || searchQuery}"
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

  const handleUserClick = (user) => {
    if (onUserClick) {
      onUserClick(user);
    }
  };

  return (
    <div className="space-y-4">
      {users.map(user => (
        <div 
          key={user.id} 
          className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition duration-200 cursor-pointer group"
          onClick={() => handleUserClick(user)}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-4">
            {/* Avatar - Mostrar foto si existe */}
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.fullName}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">
                  {user.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'US'}
                </span>
              </div>
            )}
            
            {/* Información del usuario */}
            <div className="flex-1 min-w-0">
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
              
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <FaAward className="w-3 h-3 text-yellow-500" />
                  <span>Aura: {user.stats?.aura || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaComment className="w-3 h-3 text-blue-500" />
                  <span>Contribuciones: {user.stats?.contributionCount || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUser className="w-3 h-3 text-green-500" />
                  <span>Comunidades: {user.stats?.joinedForumsCount || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Botón de acción */}
            <div className="flex items-center gap-2 mt-2 sm:mt-0 justify-end">
              <span className="text-gray-400 text-sm hidden group-hover:block transition duration-200">
                Ver perfil
              </span>
              <FaArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition duration-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SearchUsersList;