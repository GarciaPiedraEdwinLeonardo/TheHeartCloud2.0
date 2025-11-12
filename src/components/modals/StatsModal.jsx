import { FaChartLine, FaHeart, FaTimes, FaComment, FaCalendarAlt, FaHashtag } from "react-icons/fa";
import StatsCard from "./../cards/StatsCard";

function StatsModal({ isOpen, onClose, estadisticas }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            Estadísticas
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
      </div>
    </div>
  );
}

export default StatsModal;