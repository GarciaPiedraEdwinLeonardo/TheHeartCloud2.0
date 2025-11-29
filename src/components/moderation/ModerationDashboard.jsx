import { useState } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaGlobe, FaUsers, FaHistory, FaBars, FaTimes } from 'react-icons/fa';
import { IoIosRefresh } from "react-icons/io";
import { useModerationDashboard } from './hooks/useModerationDashboard';
import ReportsPanel from './components/ReportsPanel';
import ReportFilters from './components/ReportFilters';
import LoadingSpinner from './components/LoadingSpinner';

function ModerationDashboard({ onShowUserProfile, onShowForum, onShowMain }) {
  const { reports, loading, error, activeTab, setActiveTab, stats, refreshData } = useModerationDashboard();
  const [filters, setFilters] = useState({
    type: 'all',
    urgency: 'all',
    dateRange: 'all',
    search: ''
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const tabs = [
    { id: 'pending', name: 'Pendientes', icon: FaExclamationTriangle, count: stats.pending, color: 'text-red-600' },
    { id: 'resolved', name: 'Resueltos', icon: FaCheckCircle, count: stats.resolved, color: 'text-green-600' },
    { id: 'global', name: 'Globales', icon: FaGlobe, count: stats.global, color: 'text-blue-600' },
    { id: 'user_reports', name: 'Usuarios', icon: FaUsers, count: stats.user_reports, color: 'text-purple-600' },
    { id: 'audit', name: 'Auditoría', icon: FaHistory, count: stats.audit, color: 'text-gray-600' }
  ];

  // Encontrar la pestaña activa para usar en la versión móvil
  const activeTabData = tabs.find(tab => tab.id === activeTab);

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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header Mejorado para Responsive */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center justify-between sm:justify-start">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panel de Moderación</h1>
                <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                  Gestiona reportes de usuarios y acciones de moderadores
                </p>
              </div>
              
              {/* Botón móvil del menú */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                {showMobileMenu ? (
                  <FaTimes className="w-6 h-6 text-gray-600" />
                ) : (
                  <FaBars className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onShowMain}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
              >
                <FaTimes className="w-4 h-4" />
                Volver al Inicio
              </button>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
              >
                <IoIosRefresh className="w-4 h-4" />
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FaExclamationTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.pending}</p>
              </div>
              <FaExclamationTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Resueltos</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <FaCheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Globales</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.global}</p>
              </div>
              <FaGlobe className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Contenedor Principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          {/* Tabs - Versión Desktop */}
          <div className="hidden sm:block border-b border-gray-200">
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

          {/* Tabs - Versión Móvil */}
          <div className="sm:hidden border-b border-gray-200">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex items-center justify-between w-full p-4 text-left"
            >
              <div className="flex items-center gap-2">
                {activeTabData && (
                  <>
                    <activeTabData.icon className={`w-4 h-4 ${activeTabData.color}`} />
                    <span className="font-medium">
                      {activeTabData.name}
                    </span>
                    {stats[activeTab] > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {stats[activeTab]}
                      </span>
                    )}
                  </>
                )}
              </div>
              <FaBars className="w-4 h-4 text-gray-500" />
            </button>

            {/* Menú móvil desplegable */}
            {showMobileMenu && (
              <div className="border-t border-gray-200 bg-white">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setShowMobileMenu(false);
                      }}
                      className={`flex items-center justify-between w-full p-4 text-left border-b border-gray-100 ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${tab.color}`} />
                        <span>{tab.name}</span>
                      </div>
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
              </div>
            )}
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
          <div className="p-4 sm:p-6">
            <ReportsPanel 
              reports={reports}
              activeTab={activeTab}
              filters={filters}
              onNavigateToProfile={onShowUserProfile}
              onNavigateToForum={onShowForum}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModerationDashboard;