import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './../../../config/firebase'; // ← CONFIRMA ESTA RUTA
import { FaTimes, FaCog, FaSignOutAlt, FaUser } from 'react-icons/fa';
import Login from './../../buttons/Login';

function MenuModal({ isOpen, onClose, onProfileClick }) {
    const [user, setUser] = useState(null);
    const [logoutLoading, setLogoutLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return unsubscribe;
    }, []);

    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            await signOut(auth);
            onClose();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            setLogoutLoading(false);
        }
    };

    const handleProfileClick = () => {
        onProfileClick(); 
        onClose(); 
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            ></div>
            
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
                <div className="p-4 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6 border-b pb-4">
                        <h2 className="text-xl font-bold text-blue-600">Menú</h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 p-2"
                        >
                            <FaTimes className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="space-y-6">
                            
                            {/* Sección de Usuario o Login */}
                            {user ? (
                                // Usuario autenticado
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <span className="text-white font-semibold">
                                                {user.email ? user.email[0].toUpperCase() : 'U'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-blue-800">
                                                {user.displayName || 'Usuario'}
                                            </p>
                                            <p className="text-blue-600 text-sm">Médico Verificado</p>
                                        </div>
                                    </div>

                                    {/* Opciones del usuario */}
                                    <div className="space-y-2">
                                        <button 
                                            onClick={handleProfileClick}
                                            className="flex items-center gap-3 w-full text-left hover:bg-blue-100 rounded-lg p-2 transition duration-200 text-blue-700"
                                        >
                                            <FaUser className="w-4 h-4" />
                                            <span className="font-medium">Mi Perfil</span>
                                        </button>

                                        <button 
                                            onClick={() => console.log('Configuración')}
                                            className="flex items-center gap-3 w-full text-left hover:bg-blue-100 rounded-lg p-2 transition duration-200 text-blue-700"
                                        >
                                            <FaCog className="w-4 h-4" />
                                            <span className="font-medium">Configuración</span>
                                        </button>

                                        <button 
                                            onClick={handleLogout}
                                            disabled={logoutLoading}
                                            className="flex items-center gap-3 w-full text-left hover:bg-red-50 rounded-lg p-2 transition duration-200 text-red-600 disabled:opacity-50"
                                        >
                                            <FaSignOutAlt className="w-4 h-4" />
                                            <span className="font-medium">
                                                {logoutLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Usuario no autenticado
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <h3 className="font-semibold text-blue-800 mb-2">Iniciar Sesión</h3>
                                    <p className="text-blue-600 text-sm mb-4">Accede a tu cuenta</p>
                                    <Login />
                                </div>
                            )}

                            {/* Información adicional */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-3">TheHeartCloud</h3>
                                <p className="text-gray-600 text-sm">
                                    Plataforma médica para profesionales de la salud.
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-xs text-gray-500 text-center">
                            TheHeartCloud v1.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MenuModal;