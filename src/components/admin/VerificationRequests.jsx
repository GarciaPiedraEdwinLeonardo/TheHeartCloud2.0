import { useState, useEffect } from 'react';
import { useVerificationRequests } from './hooks/useVerificationRequests';
import VerificationRequestCard from './VerificationRequestCard';
import { FaUsers, FaExclamationTriangle } from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './../../config/firebase';

function VerificationRequests() {
    const { requests, loading, error } = useVerificationRequests();
    const [searchTerm, setSearchTerm] = useState('');
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

    const handleUpdate = (userId, action) => {
        if (currentAdmin) {
            console.log(`Usuario ${userId} ${action} por: ${currentAdmin.email}`);
        }
        // Aquí podrías agregar notificaciones toast
    };

    // Mostrar loading mientras verifica autenticación
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
                        <div className="grid gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Verificar que el usuario sea admin
    if (!currentAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-center gap-3">
                            <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                            <div>
                                <h3 className="text-lg font-semibold text-red-800">Acceso Denegado</h3>
                                <p className="text-red-700">Debes iniciar sesión para acceder a esta página.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
                        <div className="grid gap-6">
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
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-center gap-3">
                            <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                            <div>
                                <h3 className="text-lg font-semibold text-red-800">Error</h3>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <FaUsers className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Solicitudes de Verificación
                            </h1>
                            <p className="text-gray-600">
                                Revisa y gestiona las solicitudes de verificación de médicos
                            </p>
                            <p className="text-sm text-gray-500">
                                Conectado como: {currentAdmin.email}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <p className="text-sm font-medium text-gray-600">Total Solicitudes</p>
                            <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <p className="text-sm font-medium text-gray-600">Pendientes</p>
                            <p className="text-2xl font-bold text-amber-600">{requests.length}</p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <p className="text-sm font-medium text-gray-600">Administrador</p>
                            <p className="text-sm font-bold text-gray-900 truncate">{currentAdmin.email}</p>
                        </div>
                    </div>
                </div>

                {/* Lista de solicitudes */}
                <div className="space-y-6">
                    {requests.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No hay solicitudes pendientes
                            </h3>
                            <p className="text-gray-600">
                                Todas las solicitudes han sido procesadas
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