import { FaChartLine, FaHeart, FaTimes, FaComment, FaCalendarAlt, FaHashtag, FaUsers, FaAward } from "react-icons/fa";
import StatsCard from "./StatsCard";

function StatsModal({ isOpen, onClose, estadisticas }) {
  if (!isOpen) return null;

  const calculateLevel = (aura) => {
    if (aura >= 1000) return { level: 'Experto', color: 'text-purple-600', bg: 'bg-purple-50' };
    if (aura >= 500) return { level: 'Avanzado', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (aura >= 100) return { level: 'Intermedio', color: 'text-green-600', bg: 'bg-green-50' };
    return { level: 'Principiante', color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const levelInfo = calculateLevel(estadisticas.aura);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            Estadísticas Detalladas
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Nivel del usuario */}
          <div className={`${levelInfo.bg} border ${levelInfo.color.replace('text', 'border')} rounded-lg p-4 mb-6 text-center`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaAward className={`w-6 h-6 ${levelInfo.color}`} />
              <span className={`font-semibold text-lg ${levelInfo.color}`}>Nivel {levelInfo.level}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{estadisticas.aura}</div>
            <div className="text-sm text-gray-600">Puntos de Aura Total</div>
          </div>

          <div className="space-y-4">
            <StatsCard
              icon={<FaHeart className="w-6 h-6 text-red-500" />}
              title="Aura"
              value={estadisticas.aura}
              description="Tu reputación en la comunidad médica"
              color="bg-red-50"
              borderColor="border-red-200"
              size="large"
            />
            
            <StatsCard
              icon={<FaComment className="w-6 h-6 text-blue-500" />}
              title="Interacciones Totales"
              value={estadisticas.interacciones}
              description="Suma de publicaciones y comentarios"
              color="bg-blue-50"
              borderColor="border-blue-200"
              size="large"
            />
            
            <StatsCard
              icon={<FaCalendarAlt className="w-6 h-6 text-green-500" />}
              title="Días en Plataforma"
              value={estadisticas.diasPlataforma}
              description="Tiempo como miembro activo"
              color="bg-green-50"
              borderColor="border-green-200"
              size="large"
            />
            
            <StatsCard
              icon={<FaUsers className="w-6 h-6 text-purple-500" />}
              title="Comunidades Activas"
              value={estadisticas.temasParticipacion}
              description="Comunidades donde participas"
              color="bg-purple-50"
              borderColor="border-purple-200"
              size="large"
            />
          </div>

          {/* Desglose detallado */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Desglose de Actividad</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900">{estadisticas.publicaciones || 0}</div>
                <div className="text-gray-600">Publicaciones</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900">{estadisticas.comentarios || 0}</div>
                <div className="text-gray-600">Comentarios</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsModal;