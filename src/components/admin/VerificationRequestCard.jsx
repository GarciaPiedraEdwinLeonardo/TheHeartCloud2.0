import { FaUser, FaIdCard, FaUniversity, FaCalendarAlt, FaExternalLinkAlt, FaClock, FaGraduationCap, FaMapMarkerAlt } from 'react-icons/fa';
import VerificationActions from './VerificationActions';

function VerificationRequestCard({ request, onUpdate, currentAdmin }) {
    const { name, email, professionalInfo, joinDate } = request;
    
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        
        try {
            let date;
            
            if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
                date = timestamp.toDate();
            } else if (timestamp?.seconds) {
                date = new Date(timestamp.seconds * 1000);
            } else if (timestamp?._seconds) {
                date = new Date(timestamp._seconds * 1000);
            } else if (timestamp instanceof Date) {
                date = timestamp;
            } else {
                date = new Date(timestamp);
            }
            
            if (isNaN(date.getTime())) {
                return 'Fecha no disponible';
            }
            
            return date.toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return 'Fecha no disponible';
        }
    };

    const formatDateTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        
        try {
            let date;
            
            if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
                date = timestamp.toDate();
            } else if (timestamp?.seconds) {
                date = new Date(timestamp.seconds * 1000);
            } else if (timestamp?._seconds) {
                date = new Date(timestamp._seconds * 1000);
            } else if (timestamp instanceof Date) {
                date = timestamp;
            } else {
                date = new Date(timestamp);
            }
            
            if (isNaN(date.getTime())) {
                return 'Fecha no disponible';
            }
            
            return date.toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formateando fecha y hora:', error);
            return 'Fecha no disponible';
        }
    };

    const openDocument = () => {
        if (professionalInfo?.licenseDocument) {
            window.open(professionalInfo.licenseDocument, '_blank');
        }
    };

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Header - Información personal - Responsive */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <FaUser className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 break-words">
                                {name?.name} {name?.apellidopat} {name?.apellidomat}
                            </h2>
                            <p className="text-sm sm:text-base lg:text-lg text-blue-100 mb-1 break-all">{email}</p>
                            <div className="flex items-center gap-2 text-blue-100 text-xs sm:text-sm">
                                <FaClock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="break-words">Se registró el {formatDate(joinDate)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-full lg:w-auto lg:flex-shrink-0">
                        <VerificationActions 
                            request={request} 
                            onUpdate={onUpdate}
                            currentAdmin={currentAdmin} 
                        />
                    </div>
                </div>
            </div>

            {/* Cuerpo - Información profesional - Responsive */}
            <div className="p-4 sm:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                    <FaGraduationCap className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <span>Información Profesional</span>
                </h3>

                <div className="space-y-4 sm:space-y-6">
                    {/* Cédula Profesional - Responsive */}
                    <div className="bg-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-blue-500">
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                <FaIdCard className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                                    Cédula Profesional
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-all">
                                    {professionalInfo?.licenseNumber}
                                </p>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <p className="text-sm sm:text-base font-medium break-words">
                                        {professionalInfo?.licenseCountry || 'México'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Especialidad - Responsive */}
                    <div className="bg-green-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-green-500">
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                <FaUniversity className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-green-600 uppercase tracking-wide mb-2">
                                    Especialidad Médica
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                                    {professionalInfo?.specialty}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Universidad y Año - Responsive Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-purple-500">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FaUniversity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">
                                        Universidad
                                    </p>
                                    <p className="text-base sm:text-lg font-bold text-gray-900 leading-tight break-words">
                                        {professionalInfo?.university}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-orange-500">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FaCalendarAlt className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">
                                        Año de Titulación
                                    </p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        {professionalInfo?.titulationYear}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documento de cédula - Responsive */}
                    {professionalInfo?.licenseDocument && (
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-gray-200">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                <div className="flex items-start gap-3 sm:gap-4 flex-1">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                        <FaIdCard className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base sm:text-lg font-bold text-gray-900 mb-1 break-words">
                                            Documento de Cédula Profesional
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-600 break-words">
                                            Archivo PDF oficial para verificación
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 break-words">
                                            Subido el {formatDateTime(professionalInfo?.submittedAt)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={openDocument}
                                    className="w-full lg:w-auto flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition duration-200 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
                                >
                                    <FaExternalLinkAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>Abrir Documento PDF</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Información adicional - Responsive */}
                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wide">
                            Detalles de la Solicitud
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div>
                                <p className="text-gray-600 mb-1 font-medium">Fecha de solicitud:</p>
                                <p className="text-gray-900 font-semibold break-words">
                                    {formatDateTime(professionalInfo?.submittedAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerificationRequestCard;