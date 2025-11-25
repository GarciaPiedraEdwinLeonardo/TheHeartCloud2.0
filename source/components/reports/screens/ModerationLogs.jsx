import { useState } from 'react';
import { 
  FaHistory, 
  FaSearch, 
  FaFilter, 
  FaUserShield,
  FaCalendar,
  FaUser,
  FaSpinner
} from 'react-icons/fa';
import { useModerationStats } from '../hooks/useModerationStats';

export const ModerationLogs = () => {
  const [filters, setFilters] = useState({
    days: 30,
    action: '',
    moderator: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  const { stats, loading, error, refresh } = useModerationStats(filters.days);

  const actions = [
    { id: 'user_suspended', label: 'Usuario Suspendido', color: 'bg-red-100 text-red-800' },
    { id: 'post_removed', label: 'Publicación Eliminada', color: 'bg-orange-100 text-orange-800' },
    { id: 'comment_removed', label: 'Comentario Eliminado', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'user_warned', label: 'Usuario Advertido', color: 'bg-blue-100 text-blue-800' },
    { id: 'user_verified', label: 'Usuario Verificado', color: 'bg-green-100 text-green-800' }
  ];

  const getActionLabel = (actionId) => {
    const action = actions.find(a => a.id === actionId);
    return action ? action.label : actionId;
  };

  const getActionColor = (actionId) => {
    const action = actions.find(a => a.id === actionId);
    return action ? action.color : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FaHistory className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Historial de Moderación</h1>
              <p className="text-gray-600">Registro completo de acciones de moderación</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar en acciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.days}
                onChange={(e) => setFilters(prev => ({ ...prev, days: parseInt(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value={7}>Últimos 7 días</option>
                <option value={30}>Últimos 30 días</option>
                <option value={90}>Últimos 3 meses</option>
                <option value={365}>Último año</option>
              </select>

              <select
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Todas las acciones</option>
                {actions.map(action => (
                  <option key={action.id} value={action.id}>{action.label}</option>
                ))}
              </select>

              <button
                onClick={refresh}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm"
              >
                <FaFilter className="w-3 h-3" />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Resumen */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalActions}</div>
              <div className="text-sm text-gray-600">Acciones Totales</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">{Object.keys(stats.actionsByModerator || {}).length}</div>
              <div className="text-sm text-gray-600">Moderadores Activos</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">{Object.keys(stats.actionsByType || {}).length}</div>
              <div className="text-sm text-gray-600">Tipos de Acción</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.severityBreakdown?.high || 0}</div>
              <div className="text-sm text-gray-600">Acciones Críticas</div>
            </div>
          </div>
        )}

        {/* Lista de Acciones */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Acciones Recientes</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {stats?.actionsByType && Object.entries(stats.actionsByType)
              .sort(([,a], [,b]) => b - a)
              .map(([action, count]) => (
                <div key={action} className="p-4 hover:bg-gray-50 transition duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(action)}`}>
                        {getActionLabel(action)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {count} vez{count !== 1 ? 'es' : ''}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {((count / stats.totalActions) * 100).toFixed(1)}% del total
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {(!stats || Object.keys(stats.actionsByType || {}).length === 0) && (
            <div className="p-8 text-center">
              <FaHistory className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay acciones registradas</h3>
              <p className="text-gray-600">No se encontraron acciones de moderación en el período seleccionado</p>
            </div>
          )}
        </div>

        {/* Moderadores Activos */}
        {stats?.actionsByModerator && Object.keys(stats.actionsByModerator).length > 0 && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaUserShield className="w-5 h-5 text-blue-600" />
                Moderadores Más Activos
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {Object.entries(stats.actionsByModerator)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([moderatorId, count], index) => (
                  <div key={moderatorId} className="p-4 hover:bg-gray-50 transition duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-medium text-gray-900">{moderatorId.slice(0, 8)}...</span>
                          <span className="text-sm text-gray-600 ml-2">{count} acciones</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {((count / stats.totalActions) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};