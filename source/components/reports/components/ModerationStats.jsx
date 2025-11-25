import { FaChartBar, FaExclamationTriangle, FaCheckCircle, FaClock, FaUserShield } from 'react-icons/fa';

export const ModerationStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Reportes Pendientes',
      value: stats.reports?.pending || 0,
      icon: FaExclamationTriangle,
      color: 'text-red-600 bg-red-100',
      border: 'border-red-200'
    },
    {
      title: 'En Revisión',
      value: stats.reports?.reviewed || 0,
      icon: FaClock,
      color: 'text-yellow-600 bg-yellow-100',
      border: 'border-yellow-200'
    },
    {
      title: 'Resueltos',
      value: stats.reports?.resolved || 0,
      icon: FaCheckCircle,
      color: 'text-green-600 bg-green-100',
      border: 'border-green-200'
    },
    {
      title: 'Acciones Totales',
      value: stats.totalActions || 0,
      icon: FaUserShield,
      color: 'text-blue-600 bg-blue-100',
      border: 'border-blue-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className={`bg-white p-6 rounded-lg border ${stat.border} hover:shadow-md transition-shadow duration-200`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estadísticas Detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Moderadores Más Activos */}
        {stats.actionsByModerator && Object.keys(stats.actionsByModerator).length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaUserShield className="w-5 h-5 text-blue-600" />
              Moderadores Más Activos
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.actionsByModerator)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([moderatorId, count], index) => (
                  <div key={moderatorId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700 truncate">
                        {moderatorId.slice(0, 8)}...
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {count} acciones
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Acciones Más Comunes */}
        {stats.actionsByType && Object.keys(stats.actionsByType).length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaChartBar className="w-5 h-5 text-green-600" />
              Acciones Más Comunes
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.actionsByType)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([action, count]) => (
                  <div key={action} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">
                      {action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Distribución por Severidad */}
      {stats.severityBreakdown && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Severidad</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.severityBreakdown).map(([severity, count]) => {
              const severityConfig = {
                critical: { label: 'Crítico', color: 'bg-red-500' },
                high: { label: 'Alto', color: 'bg-orange-500' },
                medium: { label: 'Medio', color: 'bg-yellow-500' },
                low: { label: 'Bajo', color: 'bg-blue-500' }
              }[severity] || { label: severity, color: 'bg-gray-500' };

              return (
                <div key={severity} className="text-center">
                  <div className={`h-2 ${severityConfig.color} rounded-full mb-2`}></div>
                  <p className="text-sm font-medium text-gray-900">{count}</p>
                  <p className="text-xs text-gray-600">{severityConfig.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};