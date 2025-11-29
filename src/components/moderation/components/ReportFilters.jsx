import { useState } from 'react';
import { FaFilter, FaCalendar, FaSearch } from 'react-icons/fa';

function ReportFilters({ filters, onFiltersChange, activeTab }) {
  const [showFilters, setShowFilters] = useState(false);

  const reportTypes = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'post', label: 'Publicaciones' },
    { value: 'comment', label: 'Comentarios' },
    { value: 'user', label: 'Usuarios' },
    { value: 'profile', label: 'Perfiles' },
    { value: 'forum', label: 'Comunidades' }
  ];

  const urgencyLevels = [
    { value: 'all', label: 'Todas las urgencias' },
    { value: 'critical', label: 'Crítica' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Media' },
    { value: 'low', label: 'Baja' }
  ];

  const dateRanges = [
    { value: 'all', label: 'Todo el tiempo' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'year', label: 'Este año' }
  ];

  const actionTypes = [
    { value: 'all', label: 'Todas las acciones' },
    { value: 'post_rejected', label: 'Posts Rechazados' },
    { value: 'comment_rejected', label: 'Comentarios Rechazados' },
    { value: 'community_ban', label: 'Usuarios Baneados' },
    { value: 'post_deleted_by_moderator', label: 'Posts Eliminados' }
  ];

  const handleFilterChange = (filterName, value) => {
    onFiltersChange({
      ...filters,
      [filterName]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      type: 'all',
      urgency: 'all',
      dateRange: 'all',
      actionType: 'all',
      search: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.urgency !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.actionType !== 'all') count++;
    if (filters.search) count++;
    return count;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      {/* Header de filtros */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaFilter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filtros</span>
          {getActiveFiltersCount() > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getActiveFiltersCount()} activo(s)
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            {showFilters ? 'Ocultar' : 'Mostrar'} filtros
          </button>
        </div>
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Buscar en reportes..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Tipo de contenido (no aplica para auditoría) */}
          {activeTab !== 'audit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de contenido
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tipo de acción (solo para reportes globales y auditoría) */}
          {(activeTab === 'global' || activeTab === 'audit') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de acción
              </label>
              <select
                value={filters.actionType}
                onChange={(e) => handleFilterChange('actionType', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {actionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nivel de urgencia (no aplica para auditoría) */}
          {activeTab !== 'audit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel de urgencia
              </label>
              <select
                value={filters.urgency}
                onChange={(e) => handleFilterChange('urgency', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {urgencyLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rango de fechas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <FaCalendar className="w-3 h-3" />
                <span>Rango de fechas</span>
              </div>
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportFilters;