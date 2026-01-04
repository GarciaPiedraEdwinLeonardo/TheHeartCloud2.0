import { useState } from 'react';
import { FaFilter, FaCalendar, FaSearch, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

function ReportFilters({ filters, onFiltersChange, activeTab }) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchError, setSearchError] = useState('');

  const reportTypes = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'post', label: 'Publicaciones' },
    { value: 'comment', label: 'Comentarios' },
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

  const validateSearch = (value) => {
    const trimmedValue = value.trim();
    
    if (trimmedValue.length === 0 && value.length > 0) {
      return 'La búsqueda no puede contener solo espacios en blanco';
    }
    
    if (trimmedValue.length < 1 && value.length > 0) {
      return 'Mínimo 1 carácter válido';
    }
    
    if (value.length > 50) {
      return 'Máximo 50 caracteres';
    }
    
    return '';
  };

  const handleSearchChange = (value) => {
    const error = validateSearch(value);
    setSearchError(error);
    
    if (!error || value.length < filters.search?.length) {
      handleFilterChange('search', value);
    }
  };

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
      search: ''
    });
    setSearchError('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.urgency !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.search && filters.search.trim().length >= 1) count++;
    return count;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
      {/* Header de filtros */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaFilter className="w-4 h-4 text-gray-600 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700 hidden xs:inline">Filtros</span>
          <span className="text-sm font-medium text-gray-700 xs:hidden">Filtrar</span>
          {getActiveFiltersCount() > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium hidden sm:block whitespace-nowrap"
            >
              Limpiar filtros
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1 whitespace-nowrap"
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

      {/* Búsqueda siempre visible - Móvil */}
      <div className="mb-3 sm:hidden">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            onBlur={() => {
              if (filters.search) {
                const trimmed = filters.search.trim();
                if (trimmed !== filters.search) {
                  handleFilterChange('search', trimmed);
                }
              }
            }}
            placeholder="Buscar reportes..."
            maxLength={50}
            className={`block w-full pl-9 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-1 text-sm ${
              searchError 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          {filters.search && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              {filters.search.length}/50
            </div>
          )}
        </div>
        {searchError && (
          <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
            <FaExclamationTriangle className="w-3 h-3 flex-shrink-0" />
            <span className="break-words">{searchError}</span>
          </div>
        )}
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 animate-slideDown">
          {/* Búsqueda (solo desktop) */}
          <div className="hidden sm:block md:col-span-1">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Buscar
              </label>
              {filters.search && (
                <span className="text-xs text-gray-500">
                  {filters.search.length}/50
                </span>
              )}
            </div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                onBlur={() => {
                  if (filters.search) {
                    const trimmed = filters.search.trim();
                    if (trimmed !== filters.search) {
                      handleFilterChange('search', trimmed);
                    }
                  }
                }}
                placeholder="Buscar en reportes..."
                maxLength={50}
                className={`block w-full pl-9 sm:pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-1 text-sm ${
                  searchError 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
            </div>
            {searchError && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <FaExclamationTriangle className="w-3 h-3 flex-shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
          </div>

          {/* Tipo de contenido */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Tipo de contenido
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="block w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nivel de urgencia */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Urgencia
            </label>
            <select
              value={filters.urgency}
              onChange={(e) => handleFilterChange('urgency', e.target.value)}
              className="block w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
            >
              {urgencyLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rango de fechas */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-1 sm:gap-2">
                <FaCalendar className="w-3 h-3" />
                <span>Fecha</span>
              </div>
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="block w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
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
            className="w-full text-center py-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            Limpiar todos los filtros
          </button>
        </div>
      )}
    </div>
  );
}

export default ReportFilters;