import { useState } from 'react';
import { FaAngleDown, FaAngleUp, FaCrown, FaUserShield, FaUser, FaUsers } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useForums } from './../../forums/hooks/useForums';
import { useUserForums } from './../../forums/hooks/useUserForums';
import CreateForumModal from './../../forums/modals/CreateForumModal';

function Sidebar({ onInicioClick, onThemeClick, userData, onVerificationClick }) {
  const [isForumsOpen, setIsForumsOpen] = useState(true);
  const [isMyForumsOpen, setIsMyForumsOpen] = useState(false);
  const [showCreateForumModal, setShowCreateForumModal] = useState(false);
  
  const { forums, loading: forumsLoading } = useForums();
  const { userForums, loading: userForumsLoading } = useUserForums();
  const userRole = userData?.role || 'unverified';
  
  const showCreateForum = userRole === 'doctor' || userRole === 'moderator' || userRole === 'admin';
  const showMyForums = userRole === 'doctor' || userRole === 'moderator' || userRole === 'admin';
  const showReviewVerifications = userRole === 'admin';

  const handleCreateForum = () => {
    setShowCreateForumModal(true);
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

  return (
    <>
      <aside className="hidden lg:block w-64 bg-white shadow-lg h-[calc(100vh-80px)] sticky top-20 overflow-y-auto">
        <nav className="p-4">
          {/* Inicio */}
          <button 
            onClick={onInicioClick}
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
                  forums.map((forum) => (
                    <button
                      key={forum.id}
                      onClick={() => handleForumClick(forum)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition duration-200 group w-full text-left"
                      title={forum.description}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FaUsers className="w-3 h-3 text-green-500" />
                        <span className="text-sm flex-1 truncate">{forum.name}</span>
                      </div>
                      <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-gray-500">
                          {forum.memberCount || 0}
                        </span>
                      </div>
                    </button>
                  ))
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
                          <span className="text-sm flex-1 truncate">{forum.name}</span>
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

          {/* Revisar Reportes - Para moderador y admin */}
          {(userRole === 'moderator' || userRole === 'admin') && (
            <div className="mb-4">
              <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition duration-200 w-full text-left">
                <span className="font-medium">Revisar Reportes</span>
              </button>
            </div>
          )}

          {/* Revisar Solicitudes - Solo para admin */}
          {showReviewVerifications && (
            <div className="mb-4">
              <button 
                onClick={onVerificationClick}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition duration-200 w-full text-left"
              >
                <span className="font-medium">Revisar Solicitudes de Verificación</span>
              </button>
            </div>
          )}

          {/* Separador */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Términos y Condiciones */}
          <div className="mb-4">
            <a 
              href="/terminos-y-condiciones"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition duration-200"
            >
              <span className="text-sm font-medium">Términos y Condiciones</span>
            </a>
          </div>
        </nav>
      </aside>

      <CreateForumModal 
        isOpen={showCreateForumModal}
        onClose={() => setShowCreateForumModal(false)}
      />
    </>
  );
}

export default Sidebar;