import { FaUsers, FaEdit, FaCalendar } from 'react-icons/fa';

function SearchForumsList({ forums, searchQuery, onForumClick, queryDisplay }) {
  if (forums.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <FaUsers className="w-16 h-16 mx-auto" />
        </div>
        <p className="text-gray-500 text-lg mb-2">
          No se encontraron comunidades relacionadas con "{queryDisplay || searchQuery}"
        </p>
        <p className="text-gray-400 text-sm">
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
    <div className="space-y-4">
      {forums.map(forum => (
        <div 
          key={forum.id} 
          className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition duration-200 cursor-pointer group"
          onClick={() => onForumClick(forum)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaUsers className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 break-words">
                    {forum.name}
                  </h3>
                  <p className="text-gray-600 text-sm break-words">
                    {forum.description}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-3">
                <div className="flex items-center gap-1">
                  <FaUsers className="w-3 h-3" />
                  <span>{forum.memberCount || 0} miembros</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaEdit className="w-3 h-3" />
                  <span>{forum.postCount || 0} publicaciones</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaCalendar className="w-3 h-3" />
                  <span>Creado el {formatDate(forum.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm opacity-0 group-hover:opacity-100">
              Ver Comunidad
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SearchForumsList;