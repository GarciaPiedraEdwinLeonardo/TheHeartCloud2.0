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
            <FaCheckCircle className="w-3 h-3" />
            Doctor Verificado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full border border-yellow-200">
            <FaClock className="w-3 h-3" />
            En verificación
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full border border-red-200">
            <FaTimesCircle className="w-3 h-3" />
            Verificación rechazada
          </span>
        );
      default:
        if (userData.role === 'doctor') {
          return (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full border border-green-200">
              <FaCertificate className="w-3 h-3" />
              Doctor
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full border border-gray-200">
            <FaUserCircle className="w-3 h-3" />
            Usuario
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
      doctor: 'Doctor',
      moderator: 'Moderador',
      admin: 'Administrador',
      unverified: 'No Verificado'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
        {roleLabels[role] || 'Usuario'}
      </span>
    );
  };

  // Verificar si el usuario actual puede suspender (admin o moderator)
  const canSuspendUser = !isOwnProfile && (userRole === 'admin' || userRole === 'moderator');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start gap-4 sm:gap-6">
        {/* Foto de Perfil */}
        <div className="flex-shrink-0">
          <ProfilePhotoUpload 
            currentPhoto={userData.fotoPerfil}
            onPhotoUpdate={onPhotoUpdate}
            isOwnProfile={isOwnProfile}
          />
        </div>

        {/* Información del Usuario */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {userData.nombreCompleto}
            </h1>
            {getVerificationBadge()}
            {getRoleBadge()}

            {/* Botón de Suspender (solo para admin/moderadores en perfiles ajenos) */}
            {canSuspendUser && (
              <button
                onClick={onSuspendUser}
                className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full border border-red-200 hover:bg-red-200 transition duration-200"
                title="Suspender usuario"
              >
                <FaBan className="w-3 h-3" />
                Suspender
              </button>
            )}

            {/* Botón de Reportar (solo para perfiles de otros usuarios sin permisos de moderación) */}
            {!isOwnProfile && !canSuspendUser && (
              <button
                onClick={onReportProfile}
                className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full border border-orange-200 hover:bg-orange-200 transition duration-200"
                title="Reportar este perfil"
              >
                <FaFlag className="w-3 h-3" />
                Reportar
              </button>
            )}
          </div>
          
          <p className="text-base sm:text-lg text-blue-600 font-semibold mb-3 sm:mb-4">
            {userData.especialidad}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <p>
              Miembro desde {formatDate(userData.fechaRegistro)}
            </p>
            
            {userData.professionalInfo?.university && (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
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
          <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-200">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {userData.estadisticas?.publicaciones || 0}
              </div>
              <div className="text-xs text-gray-500">Publicaciones</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {userData.estadisticas?.comentarios || 0}
              </div>
              <div className="text-xs text-gray-500">Comentarios</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {userData.estadisticas?.temasParticipacion || 0}
              </div>
              <div className="text-xs text-gray-500">Comunidades</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {userData.estadisticas?.aura || 0}
              </div>
              <div className="text-xs text-gray-500">Aura</div>
            </div>
          </div>
        </div>

        {/* Botón Ver Estadísticas (Solo móvil) */}
        <button
          onClick={onShowStats}
          className="lg:hidden flex-shrink-0 p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition duration-200"
          title="Ver estadísticas completas"
        >
          <FaChartLine className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default ProfileHeader;