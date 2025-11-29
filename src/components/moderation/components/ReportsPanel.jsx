import { FaInfoCircle } from 'react-icons/fa';
import ReportItem from './ReportItem';

function ReportsPanel({ reports, activeTab, filters }) {
  // Aplicar filtros
  const filteredReports = reports.filter(report => {
    if (filters.type !== 'all' && report.type !== filters.type) return false;
    if (filters.urgency !== 'all' && report.urgency !== filters.urgency) return false;
    // Aquí podríamos aplicar más filtros por fecha, etc.
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