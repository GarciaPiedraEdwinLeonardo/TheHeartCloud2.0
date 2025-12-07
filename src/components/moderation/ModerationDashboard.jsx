import { useState } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaUsers, FaHistory, FaBars, FaTimes } from 'react-icons/fa';
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
    { id: 'user_reports', name: 'Auditoría', icon: FaHistory, count: stats.user_reports, color: 'text-purple-600' },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <LoadingSpinner message="Cargando reportes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar reportes</h2>
          <p className="text-gray-600 mb-4 break-words">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-4 md:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header Mejorado para Responsive */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
              <div className="max-w-[calc(100%-60px)] sm:max-w-none">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                  Panel de Moderación
                </h1>
                <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base truncate">
                  Gestiona reportes de usuarios y acciones de moderadores
                </p>
              </div>
              
              {/* Botón móvil del menú */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition duration-200 ml-2"
                aria-label={showMobileMenu ? "Cerrar menú" : "Abrir menú"}
              >
                {showMobileMenu ? (
                  <FaTimes className="w-5 h-5 text-gray-600" />
                ) : (
                  <FaBars className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
            
            <div className="flex gap-2 mt-3 sm:mt-0">
              <button
                onClick={onShowMain}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200 text-sm sm:text-base w-full sm:w-auto"
              >
                <FaTimes className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Volver al Inicio</span>
                <span className="xs:hidden">Inicio</span>
              </button>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
              >
                <IoIosRefresh className="w-3 h-3 sm:w-4 sm:h-4" />
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards Responsive */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FaExclamationTriangle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{stats.pending}</p>
              </div>
              <FaExclamationTriangle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Resueltos</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <FaCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Contenedor Principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6 overflow-hidden">
          {/* Tabs - Versión Desktop */}
          <div className="hidden sm:block border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1 sm:gap-2 py-3 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap min-w-fit ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${tab.color}`} />
                    <span>{tab.name}</span>
                    {tab.count > 0 && (
                      <span className={`inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium ${
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
              className="flex items-center justify-between w-full p-3 text-left"
              aria-expanded={showMobileMenu}
            >
              <div className="flex items-center gap-2">
                {activeTabData && (
                  <>
                    <activeTabData.icon className={`w-4 h-4 ${activeTabData.color}`} />
                    <span className="font-medium text-sm">
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
              <div className="border-t border-gray-200 bg-white animate-slideDown">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setShowMobileMenu(false);
                      }}
                      className={`flex items-center justify-between w-full p-4 text-left border-b border-gray-100 text-sm ${
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
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <ReportFilters 
              filters={filters}
              onFiltersChange={setFilters}
              activeTab={activeTab}
            />
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 md:p-6">
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