import { 
    FaEdit, 
    FaCheckCircle, 
    FaUserPlus, 
    FaSignOutAlt, 
    FaFlag, 
    FaUserShield, 
    FaCog, 
    FaUsers, 
    FaInfoCircle, 
    FaCalendar, 
    FaLock,
    FaSpinner,
    FaClock 
  } from 'react-icons/fa';
  
  function ForumSidebar({ 
    canPost, canPostWithoutApproval, isVerified, canReport, isOwner, isModerator, 
    requiresApproval, requiresPostApproval, pendingRequestsCount, pendingPostsCount,
    userMembership, actionLoading, hasPendingRequest, forumDetails,
    onCreatePost, onJoinLeave, onLeaveAsOwner, onReport, onManageModerators, 
    onManageMembers, onSettings, onValidatePosts 
  }) {
    
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
      <div className="sticky top-24 space-y-4">
        {/* Acciones del Foro */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Acciones</h3>
          <div className="space-y-3">
            
            {/* Crear Publicación */}
            {canPost && (
              <button
                onClick={onCreatePost}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <FaEdit className="w-4 h-4" />
                Crear Publicación
                {requiresPostApproval && !canPostWithoutApproval && (
                  <span className="text-xs bg-blue-800 px-2 py-1 rounded-full">Requiere aprobación</span>
                )}
              </button>
            )}
  
            {/* Validar Publicaciones */}
            {(isOwner || isModerator) && requiresPostApproval && (
              <button
                onClick={onValidatePosts}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <FaCheckCircle className="w-4 h-4" />
                Validar Publicaciones
                {pendingPostsCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {pendingPostsCount}
                  </span>
                )}
              </button>
            )}
  
            {/* Unirse/Solicitar Unirse/Abandonar */}
            {isVerified && !userMembership.isMember && (
              hasPendingRequest ? (
                <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium">
                  <FaClock className="w-4 h-4" />
                  Solicitud Enviada
                </div>
              ) : (
                <button
                  onClick={onJoinLeave}
                  disabled={actionLoading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
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
              )
            )}
  
            {/* Abandonar Comunidad */}
            {userMembership.isMember && (
              <button
                onClick={isOwner ? onLeaveAsOwner : onJoinLeave}
                disabled={actionLoading}
                className="w-full bg-red-100 text-red-700 py-3 px-4 rounded-lg hover:bg-red-200 transition duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
              >
                <FaSignOutAlt className="w-4 h-4" />
                {actionLoading ? 'Procesando...' : (
                  isOwner ? 'Transferir y Salir' : 'Abandonar Comunidad'
                )}
              </button>
            )}
  
            {/* Reportar Comunidad */}
            {canReport && (
              <button
                onClick={onReport}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <FaFlag className="w-4 h-4" />
                Reportar Comunidad
              </button>
            )}
  
            {/* Gestionar Moderadores */}
            {isOwner && (
              <button
                onClick={onManageModerators}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <FaUserShield className="w-4 h-4" />
                Gestionar Moderadores
              </button>
            )}
  
            {/* Configuración */}
            {isOwner && (
              <button
                onClick={onSettings}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <FaCog className="w-4 h-4" />
                Configuración
              </button>
            )}
  
            {/* Gestionar Solicitudes */}
            {(isOwner || isModerator) && requiresApproval && (
              <button
                onClick={onManageMembers}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <FaUsers className="w-4 h-4" />
                Gestionar Solicitudes
                {pendingRequestsCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            )}
  
            {/* Información para moderadores */}
            {(isOwner || isModerator) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800 mb-1">
                  <FaInfoCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Eres moderador</span>
                </div>
                <p className="text-xs text-blue-700">
                  Tienes acceso a herramientas de moderación avanzadas.
                  {requiresPostApproval && ' Puedes publicar sin validación.'}
                </p>
              </div>
            )}
          </div>
        </div>
  
        {/* Información del Foro */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Sobre esta comunidad</h3>
          
          <div className="space-y-3 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <FaCalendar className="w-4 h-4 text-gray-400" />
              <span>Creado el {formatDate(forumDetails.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUsers className="w-4 h-4 text-gray-400" />
              <span>{(forumDetails.memberCount || 0).toLocaleString()} miembros</span>
            </div>
            <div className="flex items-center gap-2">
              <FaEdit className="w-4 h-4 text-gray-400" />
              <span>{(forumDetails.postCount || 0)} publicaciones</span>
            </div>
            {requiresApproval && (
              <div className="flex items-center gap-2">
                <FaLock className="w-4 h-4 text-orange-400" />
                <span>Requiere aprobación para unirse</span>
              </div>
            )}
            {requiresPostApproval && (
              <div className="flex items-center gap-2">
                <FaCheckCircle className="w-4 h-4 text-blue-400" />
                <span>Validación de posts activa</span>
              </div>
            )}
            {forumDetails.isPublic === false && (
              <div className="flex items-center gap-2">
                <FaLock className="w-4 h-4 text-red-400" />
                <span>Comunidad privada</span>
              </div>
            )}
          </div>
  
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Reglas de la comunidad</h4>
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200 break-words whitespace-pre-line">
              {forumDetails.rules ? (
                <div className="break-words whitespace-pre-line">
                  {forumDetails.rules}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  • Respeto hacia todos los miembros<br/>
                  • Contenido médico verificado<br/>
                  • No spam ni autopromoción<br/>
                  • Confidencialidad de pacientes<br/>
                  • Lenguaje profesional
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default ForumSidebar;