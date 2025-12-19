import { useState, useEffect } from 'react';
import { FaAngleDown, FaAngleUp, FaTimes, FaCrown, FaUserShield, FaUser, FaUsers, FaFlag, FaCheck, FaClock, FaTimes as FaTimesIcon } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import Logo from './../../buttons/Logo';
import CreateForumModal from './../../forums/modals/CreateForumModal';
import { useForums } from './../../forums/hooks/useForums';
import { useUserForums } from './../../forums/hooks/useUserForums';

function SidebarModal({ isOpen, onClose, onInicioClick, onThemeClick, userData, onVerificationClick, onReportsClick, showReportsButton }) {
  const [isForumsOpen, setIsForumsOpen] = useState(true);
  const [isMyForumsOpen, setIsMyForumsOpen] = useState(false);
  const [showCreateForumModal, setShowCreateForumModal] = useState(false);
  const [forumMemberships, setForumMemberships] = useState({});
  
  const { forums, loading: forumsLoading } = useForums();
  const { userForums, loading: userForumsLoading } = useUserForums();
  const userRole = userData?.role || 'unverified';
  
  const showCreateForum = userRole === 'doctor' || userRole === 'moderator' || userRole === 'admin';
  const showMyForums = userRole === 'doctor' || userRole === 'moderator' || userRole === 'admin';
  const showReviewVerifications = userRole === 'admin';

  // Determinar estado de membresía para cada foro
  useEffect(() => {
    if (forums.length > 0 && userForums.length > 0) {
      const memberships = {};
      
      forums.forEach(forum => {
        const userForum = userForums.find(uf => uf.id === forum.id);
        
        if (userForum) {
          memberships[forum.id] = {
            status: 'member',
            role: userForum.userRole
          };
        } else {
          memberships[forum.id] = {
            status: 'not_member',
            role: null
          };
        }
      });
      
      setForumMemberships(memberships);
    }
  }, [forums, userForums]);

  const handleCreateForum = () => {
    setShowCreateForumModal(true);
  };

  const handleInicio = () => {
    onInicioClick();
    onClose();
  };

  const handleForumClick = (forum) => {
    if (onThemeClick) {
      onThemeClick({
        id: forum.id,
        name: forum.name,
        description: forum.description,
        createdAt: forum.createdAt,
        memberCount: forum.memberCount || 0,
        ownerId: forum.ownerId
      });
    }
    onClose();
  };

  const handleReports = () => {
    if (onReportsClick) {
      onReportsClick();
      onClose();
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <FaCrown className="w-3 h-3 text-yellow-500" />;
      case 'moderator':
        return <FaUserShield className="w-3 h-3 text-blue-500" />;
      default:
        return <FaUser className="w-3 h-3 text-gray-500" />;
    }
  };

  const getMembershipIcon = (forumId) => {
    const membership = forumMemberships[forumId];
    
    if (!membership) return null;

    switch (membership.status) {
      case 'member':
        return <FaCheck className="w-3 h-3 text-green-500" title="Ya estás unido" />;
      case 'pending':
        return <FaClock className="w-3 h-3 text-yellow-500" title="Solicitud pendiente" />;
      case 'rejected':
        return <FaTimesIcon className="w-3 h-3 text-red-500" title="Solicitud rechazada" />;
      default:
        return null;
    }
  };

  const getForumTextColor = (forumId) => {
    const membership = forumMemberships[forumId];
    
    if (!membership) return 'text-gray-600';
    
    switch (membership.status) {
      case 'member':
        return 'text-green-700 font-medium';
      case 'pending':
        return 'text-yellow-700';
      case 'rejected':
        return 'text-red-700';
      default:
        return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div 
        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal del Sidebar */}
      <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl">
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <Logo />
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <FaTimes className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Contenido del Sidebar */}
        <div className="h-full overflow-y-auto pb-20">
          <nav className="p-4">
            {/* Inicio */}
            <button 
              onClick={handleInicio}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition duration-200 mb-2 w-full text-left"
            >
              <span className="font-medium">Inicio</span>
            </button>

            {/* Todas las Comunidades - Acordeón */}
            <div className="mb-4">
              <button
                onClick={() => setIsForumsOpen(!isForumsOpen)}
                className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition duration-200"
              >
                <span className="font-medium">Comunidades Relevantes</span>
                {isForumsOpen ? 
                  <FaAngleDown className="w-4 h-4" /> : 
                  <FaAngleUp className="w-4 h-4" />
                }
              </button>

              {isForumsOpen && (
                <div className="mt-2 ml-4 space-y-1 max-h-64 overflow-y-auto">
                  {forumsLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex items-center gap-3 p-2">
                          <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                          <div className="h-3 bg-gray-200 rounded flex-1"></div>
                        </div>
                      ))}
                    </div>
                  ) : forums.length === 0 ? (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 text-center">
                        No hay comunidades creadas aún
                      </p>
                      {showCreateForum && (
                        <p className="text-xs text-gray-400 text-center mt-1">
                          Sé el primero en crear una comunidad
                        </p>
                      )}
                    </div>
                  ) : (
                    forums.map((forum) => {
                      const membership = forumMemberships[forum.id];
                      const isMember = membership && membership.status === 'member';
                      
                      return (
                        <button
                          key={forum.id}
                          onClick={() => handleForumClick(forum)}
                          className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition duration-200 group w-full text-left ${
                            isMember ? 'hover:bg-green-50' : ''
                          }`}
                          title={forum.description}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FaUsers className={`w-3 h-3 ${
                              isMember ? 'text-green-500' : 'text-gray-400'
                            }`} />
                            <span className={`text-sm flex-1 truncate ${getForumTextColor(forum.id)}`}>
                              {forum.name}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Ícono de estado de membresía */}
                            {getMembershipIcon(forum.id)}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Crear Comunidad */}
            {showCreateForum && (
              <div className="mb-4">
                <button 
                  onClick={handleCreateForum}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-600 transition duration-200 w-full text-left"
                >
                  <IoIosAddCircleOutline className='w-5 h-5' />
                  <span className="font-medium">Crear Comunidad</span>
                </button>
              </div>
            )}

            {/* Mis Comunidades - Acordeón */}
            {showMyForums && (
              <div className="mb-4">
                <button
                  onClick={() => setIsMyForumsOpen(!isMyForumsOpen)}
                  className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition duration-200"
                >
                  <span className="font-medium">Mis Comunidades</span>
                  {isMyForumsOpen ? 
                    <FaAngleDown className="w-4 h-4" /> : 
                    <FaAngleUp className="w-4 h-4" />
                  }
                </button>

                {isMyForumsOpen && (
                  <div className="mt-2 ml-4 space-y-1 max-h-64 overflow-y-auto">
                    {userForumsLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse flex items-center gap-3 p-2">
                            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                            <div className="h-3 bg-gray-200 rounded flex-1"></div>
                          </div>
                        ))}
                      </div>
                    ) : userForums.length === 0 ? (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-500 text-center">
                          No estás unido a ninguna comunidad
                        </p>
                        <p className="text-xs text-gray-400 text-center mt-1">
                          Únete a comunidades para verlas aquí
                        </p>
                      </div>
                    ) : (
                      userForums.map((forum) => (
                        <button
                          key={forum.id}
                          onClick={() => handleForumClick(forum)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition duration-200 group w-full text-left"
                          title={`${forum.name} - ${forum.userRole === 'owner' ? 'Dueño' : forum.userRole === 'moderator' ? 'Moderador' : 'Miembro'}`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FaUsers className="w-3 h-3 text-green-500" />
                            <span className="text-sm flex-1 truncate text-green-700 font-medium">{forum.name}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            {getRoleIcon(forum.userRole)}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Panel de Moderación - Para moderador y admin */}
            {showReportsButton && (
              <div className="mb-4">
                <button 
                  onClick={handleReports}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition duration-200 w-full text-left"
                >
                  <FaFlag className="w-5 h-5 text-red-500" />
                  <span className="font-medium">Panel de Moderación</span>
                </button>
              </div>
            )}

            {/* Revisar Solicitudes - Solo para admin */}
            {showReviewVerifications && (
              <div className="mb-4">
                <button 
                  onClick={() => {
                    onVerificationClick();
                    onClose();
                  }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition duration-200 w-full text-left"
                >
                  <span className="font-medium">Revisar Solicitudes de Verificación</span>
                </button>
              </div>
            )}

            {/* Separador */}
            <div className="border-t border-gray-200 my-4"></div>
          </nav>
        </div>
      </div>

      <CreateForumModal 
        isOpen={showCreateForumModal}
        onClose={() => setShowCreateForumModal(false)}
      />
    </>
  );
}

export default SidebarModal;