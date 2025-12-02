import { FaUsers, FaEdit, FaCalendar } from 'react-icons/fa';

function SearchForumsList({ forums, searchQuery, onForumClick, queryDisplay }) {
  if (forums.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8">
        <div className="text-gray-400 mb-3 sm:mb-4">
          <FaUsers className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
        </div>
        <p className="text-gray-500 text-base sm:text-lg mb-1 sm:mb-2 px-2">
          No se encontraron comunidades relacionadas con "{queryDisplay || searchQuery}"
        </p>
        <p className="text-gray-400 text-xs sm:text-sm px-2">
          Intenta con otros términos o crea una nueva comunidad
        </p>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('es-ES');
      }
      return new Date(timestamp).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {forums.map(forum => (
        <div 
          key={forum.id} 
          className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-blue-300 transition duration-200 cursor-pointer group"
          onClick={() => onForumClick(forum)}
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0 mt-0.5">
                  <FaUsers className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 break-words line-clamp-1">
                    {forum.name}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm break-words line-clamp-2 mt-1">
                    {forum.description}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-3 sm:gap-4 text-xs text-gray-500 mt-2 sm:mt-3 pl-0 sm:pl-9">
                <div className="flex items-center gap-1 flex-shrink-0">
                  <FaUsers className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{forum.memberCount || 0} miembros</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <FaEdit className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{forum.postCount || 0} publicaciones</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <FaCalendar className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">Creado el {formatDate(forum.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <button className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-xs sm:text-sm opacity-100 sm:opacity-0 group-hover:opacity-100 w-full sm:w-auto mt-3 sm:mt-0 flex justify-center items-center gap-1">
              <span>Ver Comunidad</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SearchForumsList;