import { FaUserCircle, FaChartLine } from "react-icons/fa";

function ProfileHeader({ userData, onShowStats }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start gap-4 sm:gap-6">
        {/* Foto de Perfil */}
        <div className="flex-shrink-0">
          {userData.fotoPerfil ? (
            <img
              src={userData.fotoPerfil}
              alt="Foto de perfil"
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-blue-100"
            />
          ) : (
            <FaUserCircle className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400" />
          )}
        </div>

        {/* Información del Usuario */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 truncate">
            {userData.nombreCompleto}
          </h1>
          <p className="text-base sm:text-lg text-blue-600 font-semibold mb-3 sm:mb-4">
            {userData.especialidad}
          </p>
          <p className="text-gray-500 text-xs sm:text-sm">
            Miembro desde {new Date(userData.fechaRegistro).toLocaleDateString('es-ES')}
          </p>
        </div>

        {/* Botón Ver Estadísticas (Solo móvil) */}
        <button
          onClick={onShowStats}
          className="lg:hidden flex-shrink-0 p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition duration-200"
          title="Ver estadísticas"
        >
          <FaChartLine className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default ProfileHeader;