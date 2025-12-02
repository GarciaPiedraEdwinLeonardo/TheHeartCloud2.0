import { FaTimes, FaEdit, FaUserShield, FaCog, FaFlag, FaUsers, FaCheckCircle, FaBan, FaSignOutAlt, FaUserPlus, FaCalendar, FaLock, FaInfoCircle, FaCrown, FaUserFriends, FaBook, FaExclamationTriangle } from 'react-icons/fa';

function MobileCommunityModal({ 
  isOpen, 
  onClose, 
  actions, 
  forumDetails, 
  userMembership,
  isUserBanned 
}) {
  if (!isOpen) return null;

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

  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            <FaCrown className="w-2 h-2" />
            Dueño
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            <FaUserShield className="w-2 h-2" />
            Moderador
          </span>
        );
      default:
        return null;
    }
  };

  const getActionIcon = (iconName) => {
    const icons = {
      createPost: <FaEdit className="w-5 h-5" />,
      manageModerators: <FaUserShield className="w-5 h-5" />,
      settings: <FaCog className="w-5 h-5" />,
      report: <FaFlag className="w-5 h-5" />,
      manageMembers: <FaUsers className="w-5 h-5" />,
      validatePosts: <FaCheckCircle className="w-5 h-5" />,
      banUser: <FaBan className="w-5 h-5" />,
      leave: <FaSignOutAlt className="w-5 h-5" />,
      join: <FaUserPlus className="w-5 h-5" />
    };
    return icons[iconName] || <FaEdit className="w-5 h-5" />;
  };

  const getActionColor = (type) => {
    const colors = {
      primary: 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200',
      secondary: 'border-gray-500 bg-gray-50 text-gray-700 hover:bg-gray-100 active:bg-gray-200',
      danger: 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-200',
      success: 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100 active:bg-green-200',
      warning: 'border-orange-500 bg-orange-50 text-orange-700 hover:bg-orange-100 active:bg-orange-200'
    };
    return colors[type] || colors.secondary;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden flex items-end">
      <div className="w-full bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* Header con información de la comunidad */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
                  <FaUserFriends className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 truncate">{forumDetails.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {(forumDetails.memberCount || 0).toLocaleString()} miembros
                    </span>
                    {userMembership.role && getRoleBadge(userMembership.role)}
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition duration-200"
                aria-label="Cerrar"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-lg font-semibold text-gray-900">
                    {(forumDetails.memberCount || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Miembros</div>
               </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-lg font-semibold text-gray-900">
                  {forumDetails.requiresPostApproval ? 'Con validación' : 'Sin validación'}
                </div>
                <div className="text-xs text-gray-500">Posts</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-lg font-semibold text-gray-900">
                  {forumDetails.isPublic === false ? 'Privada' : 'Pública'}
                </div>
                <div className="text-xs text-gray-500">Comunidad</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-4">
          {/* Información rápida */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaInfoCircle className="w-4 h-4 text-blue-500" />
              Información
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FaCalendar className="w-3 h-3 text-gray-400" />
                <span>Creado el {formatDate(forumDetails.createdAt)}</span>
              </div>
              {forumDetails.requiresApproval && (
                <div className="flex items-center gap-2">
                  <FaLock className="w-3 h-3 text-orange-400" />
                  <span>Requiere aprobación para unirse</span>
                </div>
              )}
              {isUserBanned && (
                <div className="flex items-center gap-2 text-red-600">
                  <FaBan className="w-3 h-3" />
                  <span className="font-medium">Estás baneado de esta comunidad</span>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          {actions.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaCog className="w-4 h-4 text-gray-500" />
                Acciones Disponibles
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick();
                      onClose();
                    }}
                    disabled={action.disabled}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 min-h-[80px] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] ${getActionColor(action.type)}`}
                  >
                    <div className="text-lg">
                      {getActionIcon(action.icon)}
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reglas de la comunidad (acordeón) */}
          <div className="mb-4">
            <details className="group">
              <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer list-none">
                <div className="flex items-center gap-2">
                  <FaBook className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">Reglas de la comunidad</span>
                </div>
                <span className="transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-line">
                {forumDetails.rules ? (
                  forumDetails.rules
                ) : (
                  <div>
                    <p className="mb-1">• Respeto hacia todos los miembros</p>
                    <p className="mb-1">• Contenido médico verificado</p>
                    <p className="mb-1">• No spam ni autopromoción</p>
                    <p className="mb-1">• Confidencialidad de pacientes</p>
                    <p>• Lenguaje profesional</p>
                  </div>
                )}
              </div>
            </details>
          </div>

          {/* Advertencias importantes */}
          {isUserBanned && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-red-800 mb-1">
                <FaExclamationTriangle className="w-4 h-4" />
                <span className="font-semibold text-sm">Acceso Restringido</span>
              </div>
              <p className="text-xs text-red-700">
                Has sido baneado de esta comunidad. No puedes publicar, comentar ni interactuar.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:from-gray-700 hover:to-gray-800 transition duration-200 active:scale-[0.98]"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Estilos de animación */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default MobileCommunityModal;