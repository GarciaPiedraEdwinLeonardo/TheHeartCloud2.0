import { FaHeart, FaCalendar, FaUser, FaComment } from 'react-icons/fa';

function CommentsList({ comentarios }) {
  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    
    try {
      if (date.toDate) {
        return date.toDate().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const truncateContent = (content, maxLength = 120) => {
    if (!content) return 'Sin contenido';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-4">
      {comentarios.map((comentario) => (
        <div key={comentario.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition duration-200 overflow-hidden">
          {/* Información del comentario en la publicación */}
          <div className="mb-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <FaComment className="w-3 h-3 text-blue-500 flex-shrink-0" />
              <span className="font-medium">Comentó en:</span>
            </div>
            <h4 className="text-base font-semibold text-gray-900 break-words line-clamp-1">
              "{comentario.publicacionTitulo}"
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <FaUser className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Publicación de {comentario.usuarioPost}</span>
            </div>
          </div>

          {/* Contenido del comentario - ARREGLADO */}
          <div className="mb-4">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap max-w-full overflow-hidden">
                {comentario.content || comentario.contenido}
              </p>
            </div>
          </div>

          {/* Metadata del comentario */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-1 flex-shrink-0">
                <FaCalendar className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">
                  {formatDate(comentario.fecha)}
                </span>
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                <FaHeart className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{comentario.likes?.length || comentario.stats?.likeCount || 0}</span>
              </div>

              {/* Estado del comentario */}
              {comentario.status === 'pending' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex-shrink-0">
                  <span className="hidden sm:inline">En revisión</span>
                  <span className="sm:hidden">Pendiente</span>
                </span>
              )}
              {comentario.status === 'rejected' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex-shrink-0">
                  <span className="hidden sm:inline">Rechazado</span>
                  <span className="sm:hidden">Rech.</span>
                </span>
              )}
            </div>

            {/* Información del comentarista */}
            <div className="flex items-center gap-2 text-xs bg-blue-50 px-2 py-1 rounded-full flex-shrink-0 max-w-full">
              <FaUser className="w-3 h-3 text-blue-600 flex-shrink-0" />
              <span className="text-blue-700 font-medium truncate">
                {comentario.usuarioComentarista}
              </span>
              {comentario.rolComentarista && (
                <span className="text-blue-600 hidden sm:inline">• {comentario.rolComentarista}</span>
              )}
            </div>
          </div>

          {/* Respuestas si existen */}
          {comentario.replies && comentario.replies.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FaComment className="w-3 h-3 flex-shrink-0" />
                <span>{comentario.replies.length} respuesta(s)</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default CommentsList;