import { useState } from 'react';
import { FaFilter, FaSearch, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { ReportItem } from './ReportItem';

export const ReportsList = ({ 
  reports, 
  loading, 
  error, 
  onActionTaken, 
  onDismiss,
  onFilterChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  const filteredReports = reports.filter(report => {
    // Filtro de búsqueda
    const matchesSearch = searchTerm === '' || 
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.targetType.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro de estado
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    // Filtro de tipo
    const matchesType = typeFilter === 'all' || report.targetType === typeFilter;
    
    // Filtro de urgencia
    const matchesUrgency = urgencyFilter === 'all' || report.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesType && matchesUrgency;
  });

  const handleFilterChange = () => {
    onFilterChange?.({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      targetType: typeFilter !== 'all' ? typeFilter : undefined,
      urgency: urgencyFilter !== 'all' ? urgencyFilter : undefined
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mr-3" />
        <span className="text-gray-600">Cargando reportes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar reportes</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay reportes pendientes</h3>
        <p className="text-gray-600">Todos los reportes han sido procesados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar en reportes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="reviewed">Revisados</option>
              <option value="resolved">Resueltos</option>
              <option value="dismissed">Desestimados</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">Todos los tipos</option>
              <option value="post">Publicaciones</option>
              <option value="comment">Comentarios</option>
              <option value="user">Usuarios</option>
              <option value="forum">Comunidades</option>
              <option value="profile">Perfiles</option>
            </select>

            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">Toda urgencia</option>
              <option value="critical">Crítico</option>
              <option value="high">Alto</option>
              <option value="medium">Medio</option>
              <option value="low">Bajo</option>
            </select>

            <button
              onClick={handleFilterChange}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm"
            >
              <FaFilter className="w-3 h-3" />
              Aplicar
            </button>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-3 text-sm text-gray-600">
          Mostrando {filteredReports.length} de {reports.length} reportes
        </div>
      </div>

      {/* Lista de Reportes */}
      <div className="space-y-3">
        {filteredReports.map((report) => (
          <ReportItem
            key={report.id}
            report={report}
            onActionTaken={onActionTaken}
            onDismiss={onDismiss}
          />
        ))}
      </div>

      {/* Sin resultados */}
      {filteredReports.length === 0 && reports.length > 0 && (
        <div className="text-center py-8">
          <FaSearch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron reportes</h4>
          <p className="text-gray-600">Intenta con otros filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
};