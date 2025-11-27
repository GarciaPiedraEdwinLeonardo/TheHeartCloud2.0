import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaUserPlus, FaUserMinus, FaSearch, FaCrown, FaUserShield, FaUser } from 'react-icons/fa';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from './../../../config/firebase';

function AddModeratorModal({ isOpen, onClose, forumId }) {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const user = auth.currentUser;

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
      
      // Convertir array de miembros a lista con información de usuario
      if (forumData.members && Array.isArray(forumData.members)) {
        for (const userId of forumData.members) {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.exists() ? userDoc.data() : null;
            
            // Determinar rol del usuario en la comunidad
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

      await loadForumMembers(); // Recargar lista
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

      await loadForumMembers(); // Recargar lista
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

    // Mostrar rol de usuario (doctor, unverified, etc.)
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
      <span className={`${baseClasses} ${roleColors[userRole] || 'bg-gray-100 text-gray-800'}`}>
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Gestionar Moderadores</h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Lista de miembros */}
          <div className="max-h-96 overflow-y-auto">
            {loading && members.length === 0 ? (
              <div className="flex justify-center py-8">
                <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No se encontraron miembros</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMembers.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <p className="font-medium text-gray-900 truncate">{member.userName}</p>
                        {getRoleBadge(member.role, member.userRole)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <p className="truncate">{member.userEmail}</p>
                        <span>•</span>
                        <p>Se unió: {formatDate(member.joinedAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {member.role === 'member' && member.userRole === 'doctor' && (
                        <button
                          onClick={() => handleAddModerator(member.userId)}
                          disabled={loading}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 flex items-center gap-1 text-sm"
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
                          className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-200 disabled:opacity-50 flex items-center gap-1 text-sm"
                          title="Remover como moderador"
                        >
                          <FaUserMinus className="w-4 h-4" />
                          <span>Remover Moderador</span>
                        </button>
                      )}
                      
                      {member.role === 'owner' && (
                        <span className="px-3 py-2 text-sm text-gray-500 italic">
                          Dueño de la comunidad
                        </span>
                      )}

                      {member.role === 'member' && member.userRole !== 'doctor' && (
                        <span className="px-3 py-2 text-sm text-gray-500 italic">
                          Solo doctores pueden ser moderadores
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>Total de miembros: {members.length}</p>
              <p>Moderadores: {members.filter(m => m.role === 'moderator').length}</p>
              <p>Doctores: {members.filter(m => m.userRole === 'doctor').length}</p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Necesitamos import deleteField
import { deleteField } from 'firebase/firestore';

export default AddModeratorModal;