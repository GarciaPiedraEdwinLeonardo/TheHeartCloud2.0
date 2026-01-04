import { FaUser, FaIdCard, FaUniversity, FaCalendarAlt, FaExternalLinkAlt, FaClock, FaGraduationCap, FaMapMarkerAlt } from 'react-icons/fa';
import VerificationActions from './VerificationActions';

function VerificationRequestCard({ request, onUpdate, currentAdmin }) {
    const { name, email, professionalInfo, joinDate } = request;
    
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        
        try {
            let date;
            
            // Si tiene el método toDate (Firestore Timestamp)
            if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
                date = timestamp.toDate();
            }
            // Si tiene seconds (formato Firestore serializado)
            else if (timestamp?.seconds) {
                date = new Date(timestamp.seconds * 1000);
            }
            // Si tiene _seconds (otro formato posible)
            else if (timestamp?._seconds) {
                date = new Date(timestamp._seconds * 1000);
            }
            // Si ya es un objeto Date
            else if (timestamp instanceof Date) {
                date = timestamp;
            }
            // Si es un string o número
            else {
                date = new Date(timestamp);
            }
            
            // Verificar si la fecha es válida
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
            
            // Si tiene el método toDate (Firestore Timestamp)
            if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
                date = timestamp.toDate();
            }
            // Si tiene seconds (formato Firestore serializado)
            else if (timestamp?.seconds) {
                date = new Date(timestamp.seconds * 1000);
            }
            // Si tiene _seconds (otro formato posible)
            else if (timestamp?._seconds) {
                date = new Date(timestamp._seconds * 1000);
            }
            // Si ya es un objeto Date
            else if (timestamp instanceof Date) {
                date = timestamp;
            }
            // Si es un string o número
            else {
                date = new Date(timestamp);
            }
            
            // Verificar si la fecha es válida
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Header - Información personal */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                            <FaUser className="w-10 h-10 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {name?.name} {name?.apellidopat} {name?.apellidomat}
                            </h2>
                            <p className="text-blue-100 text-lg mb-1">{email}</p>
                            <div className="flex items-center gap-2 text-blue-100 text-sm">
                                <FaClock className="w-4 h-4" />
                                <span>Se registró el {formatDate(joinDate)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <VerificationActions 
                        request={request} 
                        onUpdate={onUpdate}
                        currentAdmin={currentAdmin} 
                    />
                </div>
            </div>

            {/* Cuerpo - Información profesional */}
            <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FaGraduationCap className="text-blue-600" />
                    Información Profesional
                </h3>

                <div className="space-y-6">
                    {/* Cédula Profesional */}
                    <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FaIdCard className="w-7 h-7 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                                    Cédula Profesional
                                </p>
                                <p className="text-3xl font-bold text-gray-900 mb-2">
                                    {professionalInfo?.licenseNumber}
                                </p>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaMapMarkerAlt className="w-4 h-4" />
                                    <p className="font-medium">
                                        {professionalInfo?.licenseCountry || 'México'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Especialidad */}
                    <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FaUniversity className="w-7 h-7 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-2">
                                    Especialidad Médica
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {professionalInfo?.specialty}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Universidad y Año */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FaUniversity className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">
                                        Universidad
                                    </p>
                                    <p className="text-lg font-bold text-gray-900 leading-tight">
                                        {professionalInfo?.university}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 rounded-xl p-6 border-l-4 border-orange-500">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FaCalendarAlt className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">
                                        Año de Titulación
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {professionalInfo?.titulationYear}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documento de cédula */}
                    {professionalInfo?.licenseDocument && (
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-gray-200">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                        <FaIdCard className="w-7 h-7 text-gray-700" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900 mb-1">
                                            Documento de Cédula Profesional
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Archivo PDF oficial para verificación
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Subido el {formatDateTime(professionalInfo?.submittedAt)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={openDocument}
                                    className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-200 shadow-lg hover:shadow-xl font-semibold"
                                >
                                    <FaExternalLinkAlt className="w-5 h-5" />
                                    <span>Abrir Documento PDF</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Información adicional */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                            Detalles de la Solicitud
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600 mb-1 font-medium">Fecha de solicitud:</p>
                                <p className="text-gray-900 font-semibold">
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