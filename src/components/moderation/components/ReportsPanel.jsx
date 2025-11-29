import { FaInfoCircle } from 'react-icons/fa';
import ReportItem from './ReportItem'

function ReportsPanel({ reports, activeTab, filters }) {
  // Función mejorada de filtrado
  const filteredReports = reports.filter(report => {
    // Filtro de búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        (report.targetName && report.targetName.toLowerCase().includes(searchTerm)) ||
        (report.reporterName && report.reporterName.toLowerCase().includes(searchTerm)) ||
        (report.targetAuthorName && report.targetAuthorName.toLowerCase().includes(searchTerm)) ||
        (report.reason && report.reason.toLowerCase().includes(searchTerm)) ||
        (report.description && report.description.toLowerCase().includes(searchTerm));
      
      if (!matchesSearch) return false;
    }

    // Filtro por tipo - manejar tanto reports como global_moderation_reports
    if (filters.type !== 'all') {
      const reportType = report.type || 
                        (report.actionType && report.actionType.includes('post') ? 'post' : 
                        report.actionType && report.actionType.includes('comment') ? 'comment' : 
                        report.actionType && report.actionType.includes('user') ? 'user' : 
                        report.actionType && report.actionType.includes('community') ? 'forum' : null);
      
      if (reportType !== filters.type) return false;
    }

    // Filtro por urgencia (solo para reports normales)
    if (filters.urgency !== 'all' && report.urgency !== filters.urgency) {
      return false;
    }

    // Filtro por tipo de acción (para global reports)
    if (filters.actionType !== 'all' && report.actionType !== filters.actionType) {
      return false;
    }

    return true;
  });

  if (filteredReports.length === 0) {
    return (
      <div className="text-center py-12">
        <FaInfoCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {activeTab === 'pending' ? 'No hay reportes pendientes' : 
          activeTab === 'resolved' ? 'No hay reportes resueltos' : 
          'No hay reportes'}
        </h3>
        <p className="text-gray-500">
          {activeTab === 'pending' 
            ? 'Todos los reportes han sido revisados.' 
            : 'No se encontraron reportes con los filtros aplicados.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredReports.map((report) => (
        <ReportItem 
          key={report.id} 
          report={report} 
          activeTab={activeTab}
        />
      ))}
    </div>
  );
}

export default ReportsPanel;