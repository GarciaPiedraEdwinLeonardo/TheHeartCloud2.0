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
    FaClock,
    FaBan,
    FaTrash,
  } from 'react-icons/fa';
  
  function ForumSidebar({ 
    canPost, canPostWithoutApproval, isVerified, canReport, isOwner, isModerator, 
    requiresApproval, requiresPostApproval, pendingRequestsCount, pendingPostsCount,
    userMembership, actionLoading, hasPendingRequest, forumDetails, isUserBanned,
    onCreatePost, onJoinLeave, onLeaveAsOwner, onReport, onManageModerators, 
    onManageMembers, onSettings, onValidatePosts, onDeleteCommunity, userRole,
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

    // Verificar si puede eliminar comunidad (admin o moderadores del sistema)
    const canDeleteCommunity = (userRole === 'admin' || userRole === 'moderator') && !isUserBanned;
    
    return (
      <>
        {/* Sidebar para desktop - oculto en móviles */}
        <div className="hidden lg:block sticky top-24 space-y-4">
          {/* Acciones del Foro */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Acciones</h3>
            <div className="space-y-3">
              
              {/* Mensaje de baneo */}
              {isUserBanned && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                  <div className="flex items-center gap-2 text-red-800 mb-1">
                    <FaBan className="w-4 h-4" />
                    <span className="font-semibold text-sm">Has sido baneado</span>
                  </div>
                  <p className="text-xs text-red-700">
                    No puedes interactuar en esta comunidad.
                  </p>
                </div>
              )}

              {/* Eliminar Comunidad (Solo admin/moderadores) */}
              {canDeleteCommunity && (
                <button
                  onClick={onDeleteCommunity}
                  className="w-full bg-red-600 text-white py-2 lg:py-3 px-3 lg:px-4 rounded-lg hover:bg-red-700 transition duration-200 flex items-center justify-center gap-2 font-medium text-sm lg:text-base"
                >
                  <FaTrash className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="truncate">Eliminar Comunidad</span>
                  <span className="text-xs bg-red-800 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-full">Admin</span>
                </button>
              )}

              {/* Crear Publicación */}
              {canPost && !isUserBanned && (
                <button
                  onClick={onCreatePost}
                  className="w-full bg-blue-600 text-white py-2 lg:py-3 px-3 lg:px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2 font-medium text-sm lg:text-base"
                >
                  <FaEdit className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="truncate">Crear Publicación</span>
                  {requiresPostApproval && !canPostWithoutApproval && (
                    <span className="text-xs bg-blue-800 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-full truncate">Requiere aprobación</span>
                  )}
                </button>
              )}
  
              {/* Validar Publicaciones */}
              {(isOwner || isModerator) && requiresPostApproval && (
                <button
                  onClick={onValidatePosts}
                  className="w-full bg-orange-600 text-white py-2 lg:py-3 px-3 lg:px-4 rounded-lg hover:bg-orange-700 transition duration-200 flex items-center justify-center gap-2 font-medium text-sm lg:text-base"
                >
                  <FaCheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="truncate">Validar Publicaciones</span>
                  {pendingPostsCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center">
                      {pendingPostsCount}
                    </span>
                  )}
                </button>
              )}
  
              {/* Unirse/Solicitar Unirse/Abandonar */}
              {isVerified && !userMembership.isMember && !isUserBanned && (
                hasPendingRequest ? (
                  <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 py-2 lg:py-3 px-3 lg:px-4 rounded-lg flex items-center justify-center gap-2 font-medium text-sm lg:text-base">
                    <FaClock className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="truncate">Solicitud Enviada</span>
                  </div>
                ) : (
                  <button
                    onClick={onJoinLeave}
                    disabled={actionLoading}
                    className="w-full bg-green-600 text-white py-2 lg:py-3 px-3 lg:px-4 rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center gap-2 font-medium text-sm lg:text-base disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <FaSpinner className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                    ) : (
                      <FaUserPlus className="w-3 h-3 lg:w-4 lg:h-4" />
                    )}
                    <span className="truncate">
                      {actionLoading ? 'Procesando...' : (
                        requiresApproval ? 'Solicitar Unirse' : 'Unirse a la Comunidad'
                      )}
                    </span>
                  </button>
                )
              )}
  
              {/* Abandonar Comunidad */}
              {userMembership.isMember && !isUserBanned && (
                <button
                  onClick={isOwner ? onLeaveAsOwner : onJoinLeave}
                  disabled={actionLoading}
                  className="w-full bg-red-100 text-red-700 py-2 lg:py-3 px-3 lg:px-4 rounded-lg hover:bg-red-200 transition duration-200 flex items-center justify-center gap-2 font-medium text-sm lg:text-base disabled:opacity-50"
                >
                  <FaSignOutAlt className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="truncate">
                    {actionLoading ? 'Procesando...' : (
                      isOwner ? 'Transferir y Salir' : 'Abandonar'
                    )}
                  </span>
                </button>
              )}
  
              {/* Reportar Comunidad */}
              {canReport && !isUserBanned && (
                <button
                  onClick={onReport}
                  className="w-full bg-gray-100 text-gray-700 py-2 lg:py-3 px-3 lg:px-4 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center gap-2 font-medium text-sm lg:text-base"
                >
                  <FaFlag className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="truncate">Reportar Comunidad</span>
                </button>
              )}
  
              {/* Gestionar Moderadores */}
              {isOwner && !isUserBanned && (
                <button
                  onClick={onManageModerators}
                  className="w-full bg-purple-600 text-white py-2 lg:py-3 px-3 lg:px-4 rounded-lg hover:bg-purple-700 transition duration-200 flex items-center justify-center gap-2 font-medium text-sm lg:text-base"
                >
                  <FaUserShield className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="truncate">Gestionar Moderadores</span>
                </button>
              )}
  
              {/* Configuración */}
              {isOwner && !isUserBanned && (
                <button
                  onClick={onSettings}
                  className="w-full bg-gray-600 text-white py-2 lg:py-3 px-3 lg:px-4 rounded-lg hover:bg-gray-700 transition duration-200 flex items-center justify-center gap-2 font-medium text-sm lg:text-base"
                >
                  <FaCog className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="truncate">Configuración</span>
                </button>
              )}
  
              {/* Gestionar Solicitudes */}
              {(isOwner || isModerator) && requiresApproval && !isUserBanned && (
                <button
                  onClick={onManageMembers}
                  className="w-full bg-orange-600 text-white py-2 lg:py-3 px-3 lg:px-4 rounded-lg hover:bg-orange-700 transition duration-200 flex items-center justify-center gap-2 font-medium text-sm lg:text-base"
                >
                  <FaUsers className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="truncate">Gestionar Solicitudes</span>
                  {pendingRequestsCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>
              )}
  
              {/* Información para moderadores */}
              {(isOwner || isModerator) && !isUserBanned && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 lg:p-3">
                  <div className="flex items-center gap-2 text-blue-800 mb-1">
                    <FaInfoCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="text-xs lg:text-sm font-medium">Eres moderador</span>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
            <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4">Sobre esta comunidad</h3>
            
            <div className="space-y-2 lg:space-y-3 text-sm text-gray-600 mb-3 lg:mb-4">
              <div className="flex items-center gap-2">
                <FaCalendar className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
                <span className="text-xs lg:text-sm">Creado el {formatDate(forumDetails.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaUsers className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
                <span className="text-xs lg:text-sm">{(forumDetails.memberCount || 0).toLocaleString()} miembros</span>
              </div>
              <div className="flex items-center gap-2">
                <FaEdit className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
                <span className="text-xs lg:text-sm">{(forumDetails.postCount || 0)} publicaciones</span>
              </div>
              {requiresApproval && (
                <div className="flex items-center gap-2">
                  <FaLock className="w-3 h-3 lg:w-4 lg:h-4 text-orange-400" />
                  <span className="text-xs lg:text-sm">Requiere aprobación para unirse</span>
                </div>
              )}
              {requiresPostApproval && (
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-blue-400" />
                  <span className="text-xs lg:text-sm">Validación de posts activa</span>
                </div>
              )}
              {forumDetails.isPublic === false && (
                <div className="flex items-center gap-2">
                  <FaLock className="w-3 h-3 lg:w-4 lg:h-4 text-red-400" />
                  <span className="text-xs lg:text-sm">Comunidad privada</span>
                </div>
              )}
              {isUserBanned && (
                <div className="flex items-center gap-2">
                  <FaBan className="w-3 h-3 lg:w-4 lg:h-4 text-red-400" />
                  <span className="text-xs lg:text-sm text-red-600 font-medium">Estás baneado</span>
                </div>
              )}
            </div>
  
            <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2 lg:mb-3 text-sm lg:text-base">Reglas de la comunidad</h4>
              <div className="text-xs lg:text-sm text-gray-600 bg-gray-50 rounded-lg p-2 lg:p-3 border border-gray-200 break-words whitespace-pre-line max-h-40 overflow-y-auto">
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
      </>
    );
  }
  
  export default ForumSidebar;
