import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';
import { doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './../../../config/firebase'; 
import NotificationCenter from '../../notifications/NotificationCenter';
import VerificarCuenta from "../../buttons/VerificarCuenta";
import { FaUser, FaSignOutAlt, FaChevronDown, FaTrash } from 'react-icons/fa';
import DeleteAcount from '../../modals/DeleteAcount';
import { toast } from 'react-hot-toast';

function DesktopUserMenu({ onProfileClick, onVerifyAccount }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [showDropdown, setShowDropdown] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteConfirm,setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false); 
            
            if (user) {
                const userDocUnsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
                    if (doc.exists()) {
                        setUserData(doc.data());
                    }
                });
                return () => userDocUnsubscribe();
            } else {
                setUserData(null);
            }
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

    const handleDeleteAcount = async () => {
        if(!user) return;
        setDeleteLoading(true);

        try{
            await deleteDoc(doc(db, 'users', user.uid));
            await deleteUser(user);
        } catch(error){
            if (error.code === 'auth/requires-recent-login') {
                toast.error('Para eliminar tu cuenta, necesitas haber iniciado sesión recientemente. Por favor, cierra sesión y vuelve a iniciar sesión, luego intenta eliminar tu cuenta nuevamente.');
            } else {
                toast.error('Error al eliminar la cuenta: ');
                console.error('Error al eliminar la cuenta ' + error)
            }
            setDeleteLoading(false);
        }
    };

    const confirmDelete = () => {
        setShowDeleteConfirm(true);
        setShowDropdown(false);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    // Verificar si el usuario necesita verificación
    const needsVerification = userData?.role === 'unverified';

    // Loading state
    if (loading) {
        return (
            <div className="hidden lg:flex items-center gap-4">
                <NotificationCenter />
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
        );
    }

    // Variables seguras
    const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';
    const userName = user?.displayName || user?.email || 'Usuario';
    const userPhoto = userData?.photoURL; // Obtener la foto de perfil

    return (
        <>
        <div className="hidden lg:flex items-center gap-4">
            <NotificationCenter />

            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition duration-200"
                >
                    {/* Foto de perfil o avatar por defecto */}
                    {userPhoto ? (
                        <img 
                            src={userPhoto} 
                            alt="Foto de perfil"
                            className="w-8 h-8 rounded-full object-cover border-2 border-blue-100"
                        />
                    ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                                {userInitial}
                            </span>
                        </div>
                    )}
                    
                    <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                            {userName}
                        </p>
                        <p className="text-xs text-gray-500">
                            {userData?.role === 'unverified' ? 'Sin verificar' : 
                            userData?.role === 'doctor' ? 'Médico' : 
                            userData?.role === 'moderator' ? 'Moderador':
                            userData?.role === 'admin' ? "Admin":
                            userData?.role || 'Usuario'}
                        </p>
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
                            
                            {/* Botón de Verificar Cuenta (solo para no verificados) */}
                            {needsVerification && (
                                <>
                                    <div className="px-4 py-2">
                                        <VerificarCuenta onClick={() => {
                                            if (onVerifyAccount) {
                                                onVerifyAccount();
                                            }
                                            setShowDropdown(false);
                                        }} />
                                    </div>
                                    <div className="border-t border-gray-200 my-1"></div>
                                </>
                            )}

                            {!needsVerification &&(
                                <button
                                    onClick={() => {
                                        if (onProfileClick) {
                                            onProfileClick();
                                        }
                                        setShowDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition duration-200"
                                >
                                    <FaUser className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Mi Perfil</span>
                                </button>
                            )}

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

                            <div className="border-t border-gray-200 my-1"></div>

                            <button
                                onClick={confirmDelete}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition duration-200"
                            >
                                <FaTrash className="w-4 h-4 text-red-500" />
                                <span className="font-medium">Eliminar Cuenta</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>

        {showDeleteConfirm &&(
            <DeleteAcount
                cancelDelete = {cancelDelete}
                deleteLoading = {deleteLoading}
                deleteAccount = {handleDeleteAcount} 
            />
        )}
    </>
    );
}

export default DesktopUserMenu;