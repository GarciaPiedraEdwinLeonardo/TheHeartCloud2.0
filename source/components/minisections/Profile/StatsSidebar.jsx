import { FaChartLine, FaHeart, FaComment, FaCalendarAlt, FaHashtag } from "react-icons/fa";
import StatsCard from "./../../cards/StatsCard";

function StatsSidebar({ estadisticas }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <FaChartLine className="text-blue-600" />
        Estadísticas
      </h3>
      
      <div className="space-y-4">
        <StatsCard
          icon={<FaHeart className="w-6 h-6 text-red-500" />}
          title="Aura"
          value={estadisticas.aura}
          color="bg-red-50"
        />
        
        <StatsCard
          icon={<FaComment className="w-6 h-6 text-blue-500" />}
          title="Interacciones"
          value={estadisticas.interacciones}
          color="bg-blue-50"
        />
        
        <StatsCard
          icon={<FaCalendarAlt className="w-6 h-6 text-green-500" />}
          title="Días en Plataforma"
          value={estadisticas.diasPlataforma}
          color="bg-green-50"
        />
        
        <StatsCard
          icon={<FaHashtag className="w-6 h-6 text-purple-500" />}
          title="Temas Activos"
          value={estadisticas.temasParticipacion}
          color="bg-purple-50"
        />
      </div>
    </div>
  );
}

export default StatsSidebar;