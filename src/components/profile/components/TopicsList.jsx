import { FaUsers, FaComment, FaCalendar, FaEdit, FaArrowRight } from 'react-icons/fa';

function TopicsList({ temas, onTopicClick }) {
  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    
    try {
      if (date.toDate) {
        return date.toDate().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const handleTopicClick = (topic) => {
    if (onTopicClick) {
      onTopicClick(topic);
    }
  };

  return (
    <div className="space-y-4">
      {temas.map((tema) => (
        <div 
          key={tema.id} 
          className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition duration-200 cursor-pointer group"
          onClick={() => handleTopicClick(tema)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition duration-200 break-words">
                {tema.nombre}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <FaCalendar className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="truncate">Se unió el {formatDate(tema.fechaUnion)}</span>
              </div>
            </div>
            
            <FaArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition duration-200 flex-shrink-0 mt-1 ml-3" />
          </div>

          {/* Estadísticas de participación */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
              <FaEdit className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="font-medium text-blue-700">{tema.publicaciones}</span>
              <span className="text-blue-600 whitespace-nowrap">publicaciones</span>
            </div>
            
            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
              <FaComment className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="font-medium text-green-700">{tema.comentarios}</span>
              <span className="text-green-600 whitespace-nowrap">comentarios</span>
            </div>

            {/* Miembros del foro (si está disponible) */}
            {tema.memberCount && (
              <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                <FaUsers className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="font-medium text-purple-700">{tema.memberCount}</span>
                <span className="text-purple-600 whitespace-nowrap">miembros</span>
              </div>
            )}
          </div>

          {/* Descripción del foro (si está disponible) */}
          {tema.description && (
            <p className="mt-3 text-gray-600 text-sm leading-relaxed break-words overflow-hidden">
              {truncateText(tema.description, 150)}
            </p>
          )}

          {/* Última actividad (si está disponible) */}
          {tema.lastActivity && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="truncate">Última actividad: {formatDate(tema.lastActivity)}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default TopicsList;