import { useState } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaGlobe, FaUsers, FaHistory, FaFilter } from 'react-icons/fa';
import { useModerationDashboard } from '../hooks/useModerationDashboard';
import ReportsPanel from '../components/ReportsPanel';
import ReportFilters from '../components/ReportFilters';
import LoadingSpinner from '../../components/LoadingSpinner';

function ModerationDashboard() {
  const { reports, loading, error, activeTab, setActiveTab, stats } = useModerationDashboard();
  const [filters, setFilters] = useState({
    type: 'all',
    urgency: 'all',
    dateRange: 'all'
  });

  const tabs = [
    { id: 'pending', name: 'Pendientes', icon: FaExclamationTriangle, count: stats.pending, color: 'text-red-600' },
    { id: 'resolved', name: 'Resueltos', icon: FaCheckCircle, count: stats.resolved, color: 'text-green-600' },
    { id: 'global', name: 'Reportes Globales', icon: FaGlobe, count: globalReports.length, color: 'text-blue-600' },
    { id: 'user_reports', name: 'Reportes de Usuarios', icon: FaUsers, count: userReports.length, color: 'text-purple-600' },
    { id: 'audit', name: 'Auditoría', icon: FaHistory, count: deletedContent.length, color: 'text-gray-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Cargando reportes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar reportes</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Moderación</h1>
          <p className="text-gray-600 mt-2">
            Gestiona reportes de usuarios y acciones de moderadores
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reportes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FaExclamationTriangle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
              </div>
              <FaExclamationTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resueltos</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <FaCheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reportes Globales</p>
                <p className="text-2xl font-bold text-purple-600">{globalReports.length}</p>
              </div>
              <FaGlobe className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${tab.color}`} />
                    <span>{tab.name}</span>
                    {tab.count > 0 && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        activeTab === tab.id 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <ReportFilters 
              filters={filters}
              onFiltersChange={setFilters}
              activeTab={activeTab}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <ReportsPanel 
              reports={reports}
              activeTab={activeTab}
              filters={filters}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModerationDashboard;