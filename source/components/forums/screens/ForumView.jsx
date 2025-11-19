import { useState, useEffect } from 'react';
import { 
  FaUserPlus, 
  FaFlag, 
  FaCalendar, 
  FaUsers, 
  FaEdit, 
  FaUserShield, 
  FaSpinner, 
  FaCrown,
  FaArrowLeft,
  FaSignOutAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useForumActions } from './../hooks/useForumsActions';
import { auth, db } from './../../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AddModeratorModal from './../modals/AddModeratorModal';
import CreatePostModal from './../posts/modals/CreatePostModal';
import ReportModal from './../modals/ReportModal';
import { usePosts } from './../posts/hooks/usePosts';
import PostList from './../posts/components/PostList';

function ForumView({ forumData, onBack }) {
  const [userMembership, setUserMembership] = useState({ isMember: false, role: null });
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModeratorModal, setShowAddModeratorModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [forumDetails, setForumDetails] = useState(forumData);
  
  const { joinForum, leaveForum, checkUserMembership, getForumData } = useForumActions();
  const { posts, loading: postsLoading, error: postsError } = usePosts(forumDetails.id);
  const user = auth.currentUser;

  // Cargar userData desde Firestore
  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error cargando userData:', error);
        }
      };
      loadUserData();
    }
  }, [user]);

  useEffect(() => {
    const loadForumDetails = async () => {
      if (forumData.id) {
        setLoading(true);
        
        // Cargar datos actualizados del foro
        const forumResult = await getForumData(forumData.id);
        if (forumResult.success) {
          setForumDetails(forumResult.data);
        }
        
        // Cargar membresía del usuario
        const membership = await checkUserMembership(forumData.id);
        setUserMembership(membership);
        setLoading(false);
      }
    };
    
    loadForumDetails();
  }, [forumData.id]);

  const handleJoinLeave = async () => {
    if (!user) {
      alert('Debes iniciar sesión para unirte a comunidades');
      return;
    }

    setActionLoading(true);
    
    try {
      if (userMembership.isMember) {
        const result = await leaveForum(forumData.id);
        if (result.success) {
          setUserMembership({ isMember: false, role: null });
          // Recargar datos del foro para actualizar memberCount
          const forumResult = await getForumData(forumData.id);
          if (forumResult.success) {
            setForumDetails(forumResult.data);
          }
        } else {
          alert(result.error);
        }
      } else {
        const result = await joinForum(forumData.id);
        if (result.success) {
          setUserMembership({ isMember: true, role: 'member' });
          // Recargar datos del foro para actualizar memberCount
          const forumResult = await getForumData(forumData.id);
          if (forumResult.success) {
            setForumDetails(forumResult.data);
          }
        } else {
          alert(result.error);
        }
      }
    } catch (error) {
      alert('Error al procesar la acción');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostUpdate = () => {
    // Recargar posts si es necesario
    console.log('Post actualizado, podrías recargar aquí si necesario');
  };

  const isOwner = userMembership.role === 'owner';
  const isModerator = userMembership.role === 'moderator';
  const canPost = userMembership.isMember && (userData?.role === 'doctor' || userData?.role === 'moderator' || userData?.role === 'admin');
  const canReport = !!user;
  const isVerified = userData?.role !== 'unverified'

  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            <FaCrown className="w-3 h-3" />
            Dueño
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            <FaUserShield className="w-3 h-3" />
            Moderador
          </span>
        );
      default:
        return null;
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando comunidad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Contenido Principal */}
          <main className="lg:w-3/4">
            {/* Header del Foro */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-green-100">
                    <FaUsers className="w-6 h-6 text-green-600" />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words break-all">
                      {forumDetails.name}
                    </h1>
                    <p className="text-gray-600 text-lg break-words break-all whitespace-normal">
                      {forumDetails.description}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onBack}
                  className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <FaArrowLeft className="w-4 h-4" />
                  Volver al Inicio
                </button>
              </div>

              {/* Estadísticas del Foro */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-500 border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2">
                  <FaCalendar className="w-4 h-4" />
                  <span>Creado el {formatDate(forumDetails.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers className="w-4 h-4" />
                  <span>{(forumDetails.memberCount || 0).toLocaleString()} miembros</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaEdit className="w-4 h-4" />
                  <span>{(forumDetails.postCount || 0)} publicaciones</span>
                </div>
                {userMembership.role && (
                  <div className="flex items-center gap-2">
                    {getRoleBadge(userMembership.role)}
                  </div>
                )}
              </div>
            </div>

            {/* Mensaje de bienvenida y acciones */}
            {!userMembership.isMember && isVerified && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 text-center">
              <div className="text-gray-400 mb-4">
                <FaUsers className="w-12 h-12 mx-auto" />
              </div>
              
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 text-center">
                  <div className="text-gray-400 mb-4">
                    <FaUsers className="w-12 h-12 mx-auto" />
                  </div>
    
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Explora esta comunidad
                </h3>
                <p className="text-gray-600 mb-4">
                  Únete para poder interactuar y publicar contenido.
                </p>
                <button
                onClick={handleJoinLeave}
                disabled={actionLoading}
                className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition duration-200 font-medium flex           items-center gap-2 mx-auto disabled:opacity-50"
              >
                {actionLoading ? (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <FaUserPlus className="w-4 h-4" />
                )}
                {actionLoading ? 'Procesando...' : 'Unirse a la Comunidad'}
              </button>
            </div>
            </div>
            )}

            {/* Lista de Posts - SIEMPRE VISIBLE */}
            <PostList
              posts={posts}
              loading={postsLoading}
              error={postsError}
              forumId={forumDetails.id}
              forumName={forumDetails.name}
              userRole={userData?.role}
              onPostUpdate={handlePostUpdate}
            />
          </main>

          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <div className="sticky top-24 space-y-4">
              {/* Acciones del Foro - TODAS JUNTAS */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Acciones</h3>
                <div className="space-y-3">
                  
                  {/* Botón Crear Post (solo para miembros verificados) */}
                  {canPost && (
                    <button
                      onClick={() => setShowCreatePostModal(true)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2 font-medium"
                    >
                      <FaEdit className="w-4 h-4" />
                      Crear Publicación
                    </button>
                  )}

                  {/* Botón Unirse/Abandonar */}
                  {isVerified && (
                    <button
                      onClick={handleJoinLeave}
                      disabled={actionLoading}
                      className={`w-full py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 font-medium border ${
                        userMembership.isMember 
                          ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' 
                          : 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                      } disabled:opacity-50`}
                    >
                      {actionLoading ? (
                        <FaSpinner className="w-4 h-4 animate-spin" />
                      ) : (
                        <FaUserPlus className="w-4 h-4" />
                      )}
                      {actionLoading ? 'Procesando...' : 
                      userMembership.isMember ? 'Abandonar Comunidad' : 'Unirse a la Comunidad'}
                    </button>
                  )}

                  {/* Botón Reportar - disponible para TODOS los usuarios logueados */}
                  {canReport && userMembership.role === 'member' && (
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center gap-2 font-medium"
                    >
                      <FaFlag className="w-4 h-4" />
                      Reportar Comunidad
                    </button>
                  )}

                  {/* Botón Gestionar Moderadores integrado aquí */}
                  {isOwner && (
                    <button
                      onClick={() => setShowAddModeratorModal(true)}
                      className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-200 flex items-center justify-center gap-2 font-medium"
                    >
                      <FaUserShield className="w-4 h-4" />
                      Gestionar Moderadores
                    </button>
                  )}

                  {/* Información para moderadores */}
                  {(isOwner || isModerator) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                      <div className="flex items-center gap-2 text-blue-800 mb-1">
                        <span className="text-sm font-medium">Eres moderador</span>
                      </div>
                      <p className="text-xs text-blue-700">
                        Tienes acceso a herramientas de moderación avanzadas.
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
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Reglas de la comunidad</h4>
                  <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200 break-words whitespace-pre-line overflow-hidden">
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
          </aside>
        </div>
      </div>

      {/* Modales */}
      <AddModeratorModal 
        isOpen={showAddModeratorModal}
        onClose={() => setShowAddModeratorModal(false)}
        forumId={forumDetails.id}
      />

      <CreatePostModal 
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        forumId={forumDetails.id}
        forumName={forumDetails.name}
      />

      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportType="forum"
        targetId={forumDetails.id}
        targetName={forumDetails.name}
      />
    </div>
  );
}

export default ForumView;