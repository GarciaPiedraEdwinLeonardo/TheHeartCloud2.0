import { useState } from 'react';
import { 
  FaUserShield, 
  FaChartBar, 
  FaHistory,
  FaExclamationTriangle,
  FaSpinner 
} from 'react-icons/fa';
import { useModerationPanel } from '../hooks/useModerationPanel';
import { ReportsList } from '../components/ReportsList';
import { ModerationStats } from '../components/ModerationStats';

export const ReportsPanel = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [filters, setFilters] = useState({ status: 'pending' });

  const {
    reports,
    reportsLoading,
    reportsError,
    reportsStats,
    refreshReports,
    updateReportStatus,
    resolveReport,
    dismissReport,
    moderationStats,
    statsLoading,
    takeAction,
    removePost,
    removeComment,
    suspendUser,
    warnUser,
    actionLoading,
    actionError
  } = useModerationPanel(filters);

  const tabs = [
    { id: 'pending', label: 'Pendientes', count: reportsStats?.pending || 0, icon: FaExclamationTriangle },
    { id: 'reviewed', label: 'En Revisión', count: reportsStats?.reviewed || 0, icon: FaSpinner },
    { id: 'resolved', label: 'Resueltos', count: reportsStats?.resolved || 0, icon: FaChartBar },
    { id: 'all', label: 'Todos', count: reportsStats?.total || 0, icon: FaHistory }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const newFilters = tabId === 'all' ? {} : { status: tabId };
    setFilters(newFilters);
  };

  const handleActionTaken = async (reportId, action, reason, notes = '', report) => {
    let result;
    
    // Verificar que report existe
    if (!report) {
      console.error('Report no definido en handleActionTaken');
      return { success: false, error: 'Reporte no encontrado' };
    }

    // Mapear acciones a funciones específicas
    switch (action) {
      case 'remove_post':
        result = await removePost(report.targetId, reason, [reportId]);
        break;
      case 'remove_comment':
        result = await removeComment(report.targetId, reason, [reportId]);
        break;
      case 'suspend_author':
      case 'suspend_user':
        result = await suspendUser(report.targetData?.authorId || report.targetId, '7d', reason, 2, report);
        break;
      case 'warn_author':
      case 'warn_user':
        result = await warnUser(report.targetData?.authorId || report.targetId, reason, report);
        break;
      default:
        result = await takeAction({
          action,
          targetType: report.targetType,
          targetId: report.targetId,
          reason,
          details: notes,
          relatedReports: [reportId]
        });
    }

    if (result.success) {
      await resolveReport(reportId, action, notes);
    }

    return result;
  };

  const handleDismiss = async (reportId, reason) => {
    return dismissReport(reportId, reason);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FaUserShield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Moderación</h1>
              <p className="text-gray-600">Gestiona reportes y acciones de moderación</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mb-8">
          <ModerationStats stats={moderationStats} loading={statsLoading} />
        </div>

        {/* Pestañas */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`ml-2 py-0.5 px-2 text-xs rounded-full ${
                        isActive 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Lista de Reportes */}
        <div className="bg-white rounded-lg border border-gray-200">
          <ReportsList
            reports={reports}
            loading={reportsLoading}
            error={reportsError}
            onActionTaken={handleActionTaken}
            onDismiss={handleDismiss}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Loading de Acción Global */}
        {actionLoading && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <FaSpinner className="w-4 h-4 animate-spin" />
            <span>Procesando acción...</span>
          </div>
        )}

        {/* Error de Acción Global */}
        {actionError && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="w-4 h-4" />
              <span>Error: {actionError}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};