import { useState } from 'react';
import { FaFilter, FaCalendar, FaSearch, FaTimes } from 'react-icons/fa';

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
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
      {/* Header de filtros - Mejorado para móvil */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <FaFilter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">Filtros</span>
          <span className="text-sm font-medium text-gray-700 sm:hidden">Filtrar</span>
          {getActiveFiltersCount() > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium hidden sm:block"
            >
              Limpiar filtros
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1"
          >
            {showFilters ? (
              <>
                <FaTimes className="w-3 h-3 sm:hidden" />
                <span className="hidden sm:inline">Ocultar</span>
              </>
            ) : (
              <>
                <FaFilter className="w-3 h-3 sm:hidden" />
                <span className="hidden sm:inline">Mostrar</span>
              </>
            )}
            <span className="hidden sm:inline"> filtros</span>
          </button>
        </div>
      </div>

      {/* Búsqueda siempre visible */}
      <div className="mb-3 sm:hidden">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Buscar reportes..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Búsqueda (solo desktop) */}
          <div className="hidden sm:block">
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                Urgencia
              </label>
              <select
                value={filters.urgency}
                onChange={(e) => handleFilterChange('urgency', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                <span>Fecha</span>
              </div>
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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

      {/* Botón limpiar filtros para móvil */}
      {getActiveFiltersCount() > 0 && (
        <div className="sm:hidden mt-3">
          <button
            onClick={clearFilters}
            className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            Limpiar todos los filtros
          </button>
        </div>
      )}
    </div>
  );
}

export default ReportFilters;