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
            toast.error('Error al cargar las solicitudes');
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-12 bg-gray-200 rounded-lg w-96"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white border border-red-200 rounded-xl shadow-lg p-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                                <FaExclamationTriangle className="w-7 h-7 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-red-800">Acceso Denegado</h3>
                                <p className="text-red-600">Debes iniciar sesión como administrador para acceder a esta página.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-12 bg-gray-200 rounded-lg w-96"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white border border-red-200 rounded-xl shadow-lg p-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                                <FaExclamationTriangle className="w-7 h-7 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-red-800">Error al Cargar</h3>
                                <p className="text-red-600">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchVerificationRequests}
                            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header mejorado */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FaUsers className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-1">
                                Panel de Verificación
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Gestiona las solicitudes de verificación médica
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition duration-200">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
                                <FaClock className="w-5 h-5 text-amber-500" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
                            <p className="text-xs text-gray-500 mt-1">Total en espera</p>
                        </div>
                    </div>
                </div>

                {/* Lista de solicitudes */}
                <div className="space-y-6">
                    {requests.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaUsers className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                No hay solicitudes pendientes
                            </h3>
                            <p className="text-gray-600 max-w-md mx-auto">
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