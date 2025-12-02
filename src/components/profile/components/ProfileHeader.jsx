import { FaUserCircle, FaChartLine, FaCheckCircle, FaClock, FaTimesCircle, FaCertificate, FaFlag, FaBan } from "react-icons/fa";
import ProfilePhotoUpload from "./ProfilePhotoUpload";

function ProfileHeader({ userData, onShowStats, onPhotoUpdate, isOwnProfile = true, onReportProfile, onSuspendUser, userRole }) {
  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    
    try {
      if (date.toDate) {
        return date.toDate().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getVerificationBadge = () => {
    const verificationStatus = userData.verificationStatus || 
                              userData.professionalInfo?.verificationStatus ||
                              (userData.role === 'doctor' ? 'verified' : 'unverified');
    
    switch (verificationStatus) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full border border-green-200">
            <FaCheckCircle className="w-3 h-3 flex-shrink-0" />
            <span className="hidden sm:inline">Doctor Verificado</span>
            <span className="sm:hidden">Verificado</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full border border-yellow-200">
            <FaClock className="w-3 h-3 flex-shrink-0" />
            <span className="hidden sm:inline">En verificación</span>
            <span className="sm:hidden">Pendiente</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full border border-red-200">
            <FaTimesCircle className="w-3 h-3 flex-shrink-0" />
            <span className="hidden sm:inline">Verificación rechazada</span>
            <span className="sm:hidden">Rechazado</span>
          </span>
        );
      default:
        if (userData.role === 'doctor') {
          return (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full border border-green-200">
              <FaCertificate className="w-3 h-3 flex-shrink-0" />
              <span className="hidden sm:inline">Doctor</span>
              <span className="sm:hidden">Doc</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full border border-gray-200">
            <FaUserCircle className="w-3 h-3 flex-shrink-0" />
            <span className="hidden sm:inline">Usuario</span>
            <span className="sm:hidden">User</span>
          </span>
        );
    }
  };

  const getRoleBadge = () => {
    const role = userData.role;
    const roleColors = {
      doctor: 'bg-blue-100 text-blue-800 border-blue-200',
      moderator: 'bg-purple-100 text-purple-800 border-purple-200',
      admin: 'bg-red-100 text-red-800 border-red-200',
      unverified: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const roleLabels = {
      doctor: { full: 'Doctor', short: 'Doc' },
      moderator: { full: 'Moderador', short: 'Mod' },
      admin: { full: 'Administrador', short: 'Admin' },
      unverified: { full: 'No Verificado', short: 'User' }
    };

    const label = roleLabels[role] || { full: 'Usuario', short: 'User' };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
        <span className="hidden sm:inline">{label.full}</span>
        <span className="sm:hidden">{label.short}</span>
      </span>
    );
  };

  // Verificar si el usuario actual puede suspender (admin o moderator)
  const canSuspendUser = !isOwnProfile && (userRole === 'admin' || userRole === 'moderator');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
        {/* Foto de Perfil */}
        <div className="flex-shrink-0 flex justify-center sm:justify-start">
          <ProfilePhotoUpload 
            currentPhoto={userData.fotoPerfil}
            onPhotoUpdate={onPhotoUpdate}
            isOwnProfile={isOwnProfile}
          />
        </div>

        {/* Información del Usuario */}
        <div className="flex-1 min-w-0">
          {/* Título y badges */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate text-center sm:text-left">
              {userData.nombreCompleto}
            </h1>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2">
              {getVerificationBadge()}
              {getRoleBadge()}

              {/* Botón de Suspender */}
              {canSuspendUser && (
                <button
                  onClick={onSuspendUser}
                  className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full border border-red-200 hover:bg-red-200 transition duration-200 flex-shrink-0"
                  title="Suspender usuario"
                >
                  <FaBan className="w-3 h-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Suspender</span>
                  <span className="sm:hidden">Sus</span>
                </button>
              )}

              {/* Botón de Reportar */}
              {!isOwnProfile && !canSuspendUser && (
                <button
                  onClick={onReportProfile}
                  className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full border border-orange-200 hover:bg-orange-200 transition duration-200 flex-shrink-0"
                  title="Reportar este perfil"
                >
                  <FaFlag className="w-3 h-3 flex-shrink-0" />
                  {/* CAMBIO: sm en lugar de xs */}
                  <span className="hidden sm:inline">Reportar</span>
                  <span className="sm:hidden">Rep</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Especialidad */}
          <p className="text-base sm:text-lg text-blue-600 font-semibold mb-3 sm:mb-4 text-center sm:text-left break-words">
            {userData.especialidad}
          </p>
          
          {/* Información adicional */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 justify-center sm:justify-start">
            <span className="flex-shrink-0">
              Miembro desde {formatDate(userData.fechaRegistro)}
            </span>
            
            {userData.professionalInfo?.university && (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs truncate max-w-[150px] sm:max-w-none">
                {userData.professionalInfo.university}
              </span>
            )}

            {userData.professionalInfo?.titulationYear && (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                Graduado {userData.professionalInfo.titulationYear}
              </span>
            )}
          </div>

          {/* Estadísticas rápidas */}
          <div className="mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Estadísticas</h3>
              
              {/* Botón Ver Estadísticas */}
              <button
                onClick={onShowStats}
                className="lg:hidden flex-shrink-0 p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition duration-200"
                title="Ver estadísticas completas"
              >
                <FaChartLine className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {/* Publicaciones */}
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center hover:bg-gray-100 transition duration-200">
                <div className="text-base sm:text-lg font-bold text-gray-900">
                  {userData.estadisticas?.publicaciones || 0}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  <span className="hidden sm:inline">Publicaciones</span>
                  <span className="sm:hidden">Posts</span>
                </div>
              </div>
              
              {/* Comentarios */}
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center hover:bg-gray-100 transition duration-200">
                <div className="text-base sm:text-lg font-bold text-gray-900">
                  {userData.estadisticas?.comentarios || 0}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  <span className="hidden sm:inline">Comentarios</span>
                  <span className="sm:hidden">Coments</span>
                </div>
              </div>
              
              {/* Comunidades */}
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center hover:bg-gray-100 transition duration-200">
                <div className="text-base sm:text-lg font-bold text-gray-900">
                  {userData.estadisticas?.temasParticipacion || 0}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {/* CAMBIO: Aquí ya estaba correcto con sm */}
                  <span className="hidden sm:inline">Comunidades</span>
                  <span className="sm:hidden">Comun.</span>
                </div>
              </div>
              
              {/* Aura */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 sm:p-3 text-center hover:from-blue-100 hover:to-indigo-100 transition duration-200">
                <div className="text-base sm:text-lg font-bold text-blue-700">
                  {userData.estadisticas?.aura || 0}
                </div>
                <div className="text-xs text-blue-600 font-medium truncate">Aura</div>
              </div>
            </div>
            
            {/* Versión compacta para pantallas muy pequeñas */}
            <div className="mt-3 pt-3 border-t border-gray-200 sm:hidden">
              <div className="text-xs text-gray-500 text-center">
                <span className="font-medium text-gray-700">Resumen:</span> {userData.estadisticas?.publicaciones || 0} posts • 
                {userData.estadisticas?.comentarios || 0} coments • 
                {userData.estadisticas?.temasParticipacion || 0} comun • 
                {userData.estadisticas?.aura || 0} aura
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;