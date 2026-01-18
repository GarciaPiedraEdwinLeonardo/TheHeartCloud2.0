import { useState, useEffect } from 'react';
import { FaUsers, FaExclamationTriangle, FaClock} from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './../../config/firebase';
import axiosInstance from './../../config/axiosInstance';
import VerificationRequestCard from './VerificationRequestCard';
import { toast } from 'react-hot-toast';

function VerificationRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentAdmin({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName
                });
            } else {
                setCurrentAdmin(null);
            }
            setAuthLoading(false);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (currentAdmin) {
            fetchVerificationRequests();
        }
    }, [currentAdmin]);

    const fetchVerificationRequests = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/verification/verifications/pending');
            
            if (response.success) {
                setRequests(response.data);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            setError(error.response?.data?.error || 'Error al cargar las solicitudes');
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (userId, action) => {
        await fetchVerificationRequests();
        
        if (action === 'approved') {
            toast.success('✅ Verificación aprobada exitosamente');
        } else if (action === 'rejected') {
            toast.success('Solicitud rechazada');
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-4 sm:space-y-6">
                        <div className="h-10 sm:h-12 bg-gray-200 rounded-lg w-full sm:w-96"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 sm:h-32 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-40 sm:h-48 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white border border-red-200 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaExclamationTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-red-800">Acceso Denegado</h3>
                                <p className="text-sm sm:text-base text-red-600">Debes iniciar sesión como administrador para acceder a esta página.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-4 sm:space-y-6">
                        <div className="h-10 sm:h-12 bg-gray-200 rounded-lg w-full sm:w-96"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 sm:h-32 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white border border-red-200 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaExclamationTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg sm:text-xl font-bold text-red-800">Error al Cargar</h3>
                                <p className="text-sm sm:text-base text-red-600 break-words">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchVerificationRequests}
                            className="mt-4 w-full sm:w-auto px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header mejorado y responsive */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <FaUsers className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                                Panel de Verificación
                            </h1>
                            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                                Gestiona las solicitudes de verificación médica
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards - Responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-md border border-gray-200 p-4 sm:p-5 hover:shadow-lg transition duration-200">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs sm:text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
                                <FaClock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{requests.length}</p>
                            <p className="text-xs text-gray-500 mt-1">Total en espera</p>
                        </div>
                    </div>
                </div>

                {/* Lista de solicitudes */}
                <div className="space-y-4 sm:space-y-6">
                    {requests.length === 0 ? (
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-md border border-gray-200 p-6 sm:p-8 lg:p-12 text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaUsers className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                No hay solicitudes pendientes
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                                Todas las solicitudes han sido procesadas. Nuevas solicitudes aparecerán aquí.
                            </p>
                        </div>
                    ) : (
                        requests.map(request => (
                            <VerificationRequestCard 
                                key={request.id} 
                                request={request} 
                                onUpdate={handleUpdate}
                                currentAdmin={currentAdmin}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default VerificationRequests;