import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaUserCheck, FaUserTimes, FaUsers, FaClock } from 'react-icons/fa';
import { useForumActions } from './../hooks/useForumsActions';

function ManageMembersModal({ isOpen, onClose, forumId }) {
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');
  
  const { approveMember, rejectMember, getForumData } = useForumActions();

  useEffect(() => {
    if (isOpen && forumId) {
      loadPendingMembers();
    }
  }, [isOpen, forumId]);

  const loadPendingMembers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await getForumData(forumId);
      if (!result.success) {
        setError(result.error);
        return;
      }

      const forumData = result.data;
      const pendingList = [];

      // Convertir objeto de pendingMembers a array
      if (forumData.pendingMembers) {
        Object.entries(forumData.pendingMembers).forEach(([userId, userData]) => {
          pendingList.push({
            userId,
            ...userData
          });
        });
      }

      // Ordenar por fecha de solicitud (más reciente primero)
      pendingList.sort((a, b) => {
        const dateA = a.requestedAt?.toDate?.() || new Date(a.requestedAt);
        const dateB = b.requestedAt?.toDate?.() || new Date(b.requestedAt);
        return dateB - dateA;
      });

      setPendingMembers(pendingList);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      setError('Error cargando las solicitudes pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: 'approving' }));
      setError('');

      const result = await approveMember(forumId, userId);
      if (result.success) {
        // Remover de la lista local
        setPendingMembers(prev => prev.filter(member => member.userId !== userId));
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error aprobando la solicitud');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }));
    }
  };

  const handleReject = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: 'rejecting' }));
      setError('');

      const result = await rejectMember(forumId, userId);
      if (result.success) {
        // Remover de la lista local
        setPendingMembers(prev => prev.filter(member => member.userId !== userId));
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error rechazando la solicitud');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }));
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return new Date(timestamp).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  const getRoleBadge = (userRole) => {
    const baseClasses = "text-xs font-medium px-2 py-1 rounded-full";
    
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
        {roleLabels[userRole] || 'Usuario'}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <FaUsers className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestionar Solicitudes</h2>
              <p className="text-sm text-gray-600 mt-1">Aprobar o rechazar solicitudes de membresía</p>
            </div>
          </div>
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

          {/* Estadísticas */}
          <div className="mb-6">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FaClock className="w-4 h-4 text-orange-500" />
                <span>{pendingMembers.length} solicitudes pendientes</span>
              </div>
            </div>
          </div>

          {/* Lista de solicitudes pendientes */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : pendingMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FaUsers className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay solicitudes pendientes</h3>
                <p className="text-gray-600">Todas las solicitudes han sido procesadas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingMembers.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <p className="font-medium text-gray-900 truncate">{member.userName}</p>
                        {getRoleBadge(member.userRole)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <p className="truncate">{member.userEmail}</p>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <FaClock className="w-3 h-3 text-orange-500" />
                          <span>Solicitó: {formatDate(member.requestedAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(member.userId)}
                        disabled={actionLoading[member.userId]}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 flex items-center gap-1 text-sm"
                        title="Aprobar solicitud"
                      >
                        {actionLoading[member.userId] === 'approving' ? (
                          <FaSpinner className="w-4 h-4 animate-spin" />
                        ) : (
                          <FaUserCheck className="w-4 h-4" />
                        )}
                        <span>Aprobar</span>
                      </button>
                      
                      <button
                        onClick={() => handleReject(member.userId)}
                        disabled={actionLoading[member.userId]}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 flex items-center gap-1 text-sm"
                        title="Rechazar solicitud"
                      >
                        {actionLoading[member.userId] === 'rejecting' ? (
                          <FaSpinner className="w-4 h-4 animate-spin" />
                        ) : (
                          <FaUserTimes className="w-4 h-4" />
                        )}
                        <span>Rechazar</span>
                      </button>
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
              <p>Total de solicitudes: {pendingMembers.length}</p>
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

export default ManageMembersModal;