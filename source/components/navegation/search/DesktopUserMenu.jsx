import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './../../../config/firebase'; // ← CONFIRMA ESTA RUTA
import Notification from "../../buttons/Notification";
import { FaUser, FaCog, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

function DesktopUserMenu({ onProfileClick }) {
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
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
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            setLogoutLoading(false);
        }
    };

    // Si no hay usuario autenticado, mostrar botón de login vacío o null
    if (!user) {
        return (
            <div className="hidden lg:flex items-center gap-4">
                <Notification />
                {/* El componente Login se manejará en otro lugar */}
            </div>
        );
    }

    return (
        <div className="hidden lg:flex items-center gap-4">
            <Notification />

            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition duration-200"
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                            {user.email ? user.email[0].toUpperCase() : 'U'}
                        </span>
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                            {user.displayName || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500"></p>
                    </div>
                    <FaChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                    <>
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowDropdown(false)}
                        />
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                            <button
                                onClick={() => {
                                    onProfileClick();
                                    setShowDropdown(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition duration-200"
                            >
                                <FaUser className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">Mi Perfil</span>
                            </button>


                            <div className="border-t border-gray-200 my-1"></div>

                            <button
                                onClick={handleLogout}
                                disabled={logoutLoading}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition duration-200 disabled:opacity-50"
                            >
                                <FaSignOutAlt className="w-4 h-4 text-red-500" />
                                <span className="font-medium">
                                    {logoutLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                                </span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default DesktopUserMenu;