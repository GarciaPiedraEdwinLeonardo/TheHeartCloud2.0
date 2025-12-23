import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaUserPlus, FaUserMinus, FaSearch, FaCrown, FaUserShield, FaUser } from 'react-icons/fa';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db, auth } from './../../../config/firebase';

function AddModeratorModal({ isOpen, onClose, forumId }) {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const user = auth.currentUser;

  const MAX_SEARCH_LENGTH = 100;

  useEffect(() => {
    if (isOpen && forumId) {
      loadForumMembers();
    }
  }, [isOpen, forumId]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member =>
        member.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  }, [searchTerm, members]);

  const loadForumMembers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const forumRef = doc(db, 'forums', forumId);
      const forumDoc = await getDoc(forumRef);
      
      if (!forumDoc.exists()) {
        setError('Comunidad no encontrada');
        return;
      }

      const forumData = forumDoc.data();
      const membersList = [];
      
      if (forumData.members && Array.isArray(forumData.members)) {
        for (const userId of forumData.members) {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.exists() ? userDoc.data() : null;
            
            let role = 'member';
            if (forumData.ownerId === userId) {
              role = 'owner';
            } else if (forumData.moderators && forumData.moderators[userId]) {
              role = 'moderator';
            }

            membersList.push({
              userId,
              userEmail: userData?.email || 'Email no disponible',
              userName: userData?.name ? 
                `${userData.name.name || ''} ${userData.name.apellidopat || ''} ${userData.name.apellidomat || ''}`.trim() 
                : 'Usuario',
              userRole: userData?.role || 'unverified',
              role: role,
              joinedAt: forumData.members[userId]?.joinedAt || new Date()
            });
          } catch (userError) {
            console.error(`Error cargando usuario ${userId}:`, userError);
            membersList.push({
              userId,
              userEmail: 'Error al cargar',
              userName: 'Usuario',
              userRole: 'unknown',
              role: 'member',
              joinedAt: new Date()
            });
          }
        }
      }
      
      setMembers(membersList);
      setFilteredMembers(membersList);
    } catch (error) {
      console.error('Error cargando miembros:', error);
      setError('Error cargando los miembros de la comunidad');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_SEARCH_LENGTH) {
      setSearchTerm(value);
    }
  };

  const handleAddModerator = async (userId) => {
    try {
      setLoading(true);
      setError('');

      const forumRef = doc(db, 'forums', forumId);
      
      await updateDoc(forumRef, {
        [`moderators.${userId}`]: {
          addedAt: new Date(),
          addedBy: user.uid
        }
      });

      await loadForumMembers();
    } catch (error) {
      console.error('Error agregando moderador:', error);
      setError('Error agregando moderador: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveModerator = async (userId) => {
    try {
      setLoading(true);
      setError('');

      const forumRef = doc(db, 'forums', forumId);
      
      await updateDoc(forumRef, {
        [`moderators.${userId}`]: deleteField()
      });

      await loadForumMembers();
    } catch (error) {
      console.error('Error removiendo moderador:', error);
      setError('Error removiendo moderador: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role, userRole) => {
    const baseClasses = "text-xs font-medium px-2 py-1 rounded-full";
    
    if (role === 'owner') {
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-800 flex items-center gap-1`}>
          <FaCrown className="w-3 h-3" />
          Dueño
        </span>
      );
    }
    
    if (role === 'moderator') {
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-800 flex items-center gap-1`}>
          <FaUserShield className="w-3 h-3" />
          Moderador
        </span>
      );
    }

    const roleColors = {
      doctor: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800',
      moderator: 'bg-blue-100 text-blue-800',
      unverified: 'bg-gray-100 text-gray-800'
    };

    const roleLabels = {
      doctor: 'Doctor',
      admin: 'Admin',
      moderator: 'Moderador',
      unverified: 'No Verificado'
    };

    return (
      <span className={`${baseClasses} ${roleColors[userRole] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
        <FaUser className="w-3 h-3" />
        {roleLabels[userRole] || 'Usuario'}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    try {
      if (date.toDate) {
        return date.toDate().toLocaleDateString('es-ES');
      }
      return new Date(date).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  // Prevenir scroll del body
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ margin: 0, padding: 0 }}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal container con scroll */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4 overflow-y-auto">
        <div 
          className="bg-white rounded-2xl shadow-xl w-full max-w-4xl my-8 flex flex-col"
          style={{ maxHeight: 'calc(100vh - 4rem)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 truncate">Gestionar Moderadores</h2>
              <p className="text-sm text-gray-600 mt-1">Asigna o remueve moderadores de la comunidad</p>
            </div>
            <button 
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50 flex-shrink-0 ml-4"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Barra de búsqueda */}
            <div className="mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar miembros por nombre o email..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  maxLength={MAX_SEARCH_LENGTH}
                  className="w-full pl-10 pr-16 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  {searchTerm.length}/{MAX_SEARCH_LENGTH}
                </span>
              </div>
            </div>

            {/* Lista de miembros */}
            {loading && members.length === 0 ? (
              <div className="flex justify-center py-8">
                <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No se encontraron miembros</p>
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                {filteredMembers.map((member) => (
                  <div key={member.userId} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <p className="font-medium text-gray-900 truncate">{member.userName}</p>
                        {getRoleBadge(member.role, member.userRole)}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                        <p className="truncate">{member.userEmail}</p>
                        <span className="hidden sm:inline">•</span>
                        <p>Se unió: {formatDate(member.joinedAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 lg:ml-4 flex-shrink-0">
                      {member.role === 'member' && member.userRole === 'doctor' && (
                        <button
                          onClick={() => handleAddModerator(member.userId)}
                          disabled={loading}
                          className="flex-1 lg:flex-none p-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                          title="Hacer moderador"
                        >
                          <FaUserPlus className="w-4 h-4" />
                          <span>Hacer Moderador</span>
                        </button>
                      )}
                      
                      {member.role === 'moderator' && (
                        <button
                          onClick={() => handleRemoveModerator(member.userId)}
                          disabled={loading}
                          className="flex-1 lg:flex-none p-2 px-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                          title="Remover como moderador"
                        >
                          <FaUserMinus className="w-4 h-4" />
                          <span>Remover Moderador</span>
                        </button>
                      )}
                      
                      {member.role === 'owner' && (
                        <span className="px-3 py-2 text-sm text-gray-500 italic text-center lg:text-left">
                          Dueño de la comunidad
                        </span>
                      )}

                      {member.role === 'member' && member.userRole !== 'doctor' && (
                        <span className="px-3 py-2 text-sm text-gray-500 italic text-center lg:text-left">
                          Solo doctores pueden ser moderadores
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="text-sm text-gray-600">
                <p>Total de miembros: {members.length}</p>
                <p>Moderadores: {members.filter(m => m.role === 'moderator').length}</p>
                <p>Doctores: {members.filter(m => m.userRole === 'doctor').length}</p>
              </div>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddModeratorModal;