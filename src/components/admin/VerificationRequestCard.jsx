import { FaUser, FaIdCard, FaUniversity, FaCalendarAlt, FaExternalLinkAlt } from 'react-icons/fa';
import VerificationActions from './VerificationActions';

function VerificationRequestCard({ request, onUpdate, currentAdmin }) {
    const { name, email, professionalInfo, joinDate } = request;
    
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
    };

    const openDocument = () => {
        if (professionalInfo?.licenseDocument) {
            window.open(professionalInfo.licenseDocument, '_blank');
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <FaUser className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                            {name?.name} {name?.apellidopat} {name?.apellidomat}
                        </h3>
                        <p className="text-gray-600 text-sm">{email}</p>
                        <p className="text-xs text-gray-500">
                            Se unió: {formatDate(joinDate)}
                        </p>
                    </div>
                </div>
                
                <VerificationActions 
                    request={request} 
                    onUpdate={onUpdate}
                    currentAdmin={currentAdmin} 
                />
            </div>

            {/* Información Profesional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <FaIdCard className="w-5 h-5 text-blue-600" />
                    <div>
                        <p className="text-sm font-medium text-gray-700">Cédula</p>
                        <p className="text-gray-900">{professionalInfo?.licenseNumber}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <FaUniversity className="w-5 h-5 text-green-600" />
                    <div>
                        <p className="text-sm font-medium text-gray-700">Especialidad</p>
                        <p className="text-gray-900">{professionalInfo?.specialty}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <FaUniversity className="w-5 h-5 text-purple-600" />
                    <div>
                        <p className="text-sm font-medium text-gray-700">Universidad</p>
                        <p className="text-gray-900">{professionalInfo?.university}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <FaCalendarAlt className="w-5 h-5 text-orange-600" />
                    <div>
                        <p className="text-sm font-medium text-gray-700">Año Titulación</p>
                        <p className="text-gray-900">{professionalInfo?.titulationYear}</p>
                    </div>
                </div>
            </div>

            {/* Documento */}
            {professionalInfo?.licenseDocument && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <FaIdCard className="w-5 h-5 text-gray-600" />
                        <div>
                            <p className="text-sm font-medium text-gray-700">Documento de Cédula</p>
                            <p className="text-xs text-gray-500">Haz clic para ver el documento</p>
                        </div>
                    </div>
                    <button
                        onClick={openDocument}
                        className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                    >
                        <FaExternalLinkAlt className="w-4 h-4" />
                        <span className="text-sm">Ver</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default VerificationRequestCard;