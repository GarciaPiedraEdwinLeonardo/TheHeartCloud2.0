import { FaChartLine, FaHeart, FaComment, FaCalendarAlt, FaHashtag, FaUsers, FaAward } from "react-icons/fa";
import StatsCard from './StatsCard';

function StatsSidebar({ estadisticas }) {
  // Calcular nivel basado en el aura (ejemplo)
  const calculateLevel = (aura) => {
    if (aura >= 1000) return { level: 'Experto', color: 'text-purple-600', bg: 'bg-purple-50' };
    if (aura >= 500) return { level: 'Avanzado', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (aura >= 100) return { level: 'Intermedio', color: 'text-green-600', bg: 'bg-green-50' };
    return { level: 'Principiante', color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const levelInfo = calculateLevel(estadisticas.aura);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <FaChartLine className="text-blue-600" />
        Estadísticas
      </h3>
      
      {/* Nivel del usuario */}
      <div className={`${levelInfo.bg} border ${levelInfo.color.replace('text', 'border')} rounded-lg p-4 mb-6 text-center`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <FaAward className={`w-5 h-5 ${levelInfo.color}`} />
          <span className={`font-semibold ${levelInfo.color}`}>Nivel {levelInfo.level}</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{estadisticas.aura}</div>
        <div className="text-sm text-gray-600">Puntos de Aura</div>
      </div>
      
      <div className="space-y-4">
        <StatsCard
          icon={<FaHeart className="w-5 h-5 text-red-500" />}
          title="Aura"
          value={estadisticas.aura}
          description="Reputación en la plataforma"
          color="bg-red-50"
          borderColor="border-red-200"
        />
        
        <StatsCard
          icon={<FaComment className="w-5 h-5 text-blue-500" />}
          title="Interacciones"
          value={estadisticas.interacciones}
          description="Publicaciones + comentarios"
          color="bg-blue-50"
          borderColor="border-blue-200"
        />
        
        <StatsCard
          icon={<FaCalendarAlt className="w-5 h-5 text-green-500" />}
          title="Días en Plataforma"
          value={estadisticas.diasPlataforma}
          description="Tiempo como miembro"
          color="bg-green-50"
          borderColor="border-green-200"
        />
        
        <StatsCard
          icon={<FaUsers className="w-5 h-5 text-purple-500" />}
          title="Comunidades Activas"
          value={estadisticas.temasParticipacion}
          description="Comunidades donde participas"
          color="bg-purple-50"
          borderColor="border-purple-200"
        />

        {/* Estadísticas adicionales */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {estadisticas.publicaciones || 0}
              </div>
              <div className="text-xs text-gray-500">Publicaciones</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {estadisticas.comentarios || 0}
              </div>
              <div className="text-xs text-gray-500">Comentarios</div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}

export default StatsSidebar;