import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';
import { doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './../../../config/firebase'; 
import { FaTimes, FaSignOutAlt, FaUser, FaTrash, FaUserCircle } from 'react-icons/fa';
import VerificarCuenta from './../../buttons/VerificarCuenta';
import DeleteAcount from '../../modals/DeleteAcount';
import { toast } from 'react-hot-toast';

function MenuModal({ isOpen, onClose, onProfileClick, onVerifyAccount }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
                toast.error('Error al eliminar la cuenta');
                console.error('Error al eliminar la cuenta ' + error)
            }
            setDeleteLoading(false);
        }
    };

    const confirmDelete = () => {
        setShowDeleteConfirm(true);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

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

    const handleVerifyAccount = () => {
        if (onVerifyAccount) {
            onVerifyAccount();
        }
        onClose();
    };

    // Función para obtener el nombre completo del usuario
    const getFullName = () => {
        if (!userData) {
            return null;
        }

        // Verificar si userData.name es un objeto con los apellidos
        if (userData.name && typeof userData.name === 'object') {
            const { name, apellidopat, apellidomat } = userData.name;
            const parts = [name, apellidopat, apellidomat].filter(Boolean);
            return parts.length > 0 ? parts.join(' ') : null;
        }

        // Si userData.name es solo un string, buscar apellidos en el nivel superior
        const name = userData.name;
        const apellidopat = userData.apellidopat;
        const apellidomat = userData.apellidomat;
        
        const parts = [name, apellidopat, apellidomat].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : null;
    };

    // Función para truncar nombres largos
    const truncateName = (name, maxLength = 25) => {
        if (!name || name.length <= maxLength) return name;
        return name.substring(0, maxLength) + '...';
    };

    // Verificar si el usuario necesita verificación
    const needsVerification = userData?.role === 'unverified';

    const fullName = getFullName();
    const userName = truncateName(fullName || user?.displayName || user?.email || 'Usuario');
    const userInitial = fullName 
        ? fullName[0].toUpperCase() 
        : (user?.email ? user.email[0].toUpperCase() : 'U');
    const userRole = userData?.role === 'unverified' ? 'Sin verificar' : 
                    userData?.role === 'doctor' ? 'Médico' : 
                    userData?.role === 'moderator' ? 'Moderador':
                    userData?.role === 'admin' ? "Admin":
                    userData?.role || 'Usuario';
    const userPhoto = userData?.photoURL;

    if (!isOpen) return null;

    return (
        <>
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
                            
                            {/* Sección de Usuario */}
                            {loading ? ( 
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ) : 
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        {/* Foto de perfil o avatar por defecto */}
                                        {userPhoto ? (
                                            <img 
                                                src={userPhoto} 
                                                alt="Foto de perfil"
                                                className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold">
                                                    {userInitial}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-blue-800 truncate" title={fullName || userName}>
                                                {userName}
                                            </p>
                                            <p className="text-blue-600 text-sm">
                                                {userRole}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Botón de Verificar Cuenta (solo para no verificados) */}
                                    {needsVerification && (
                                        <div className="mb-4">
                                            <VerificarCuenta onClick={handleVerifyAccount} />
                                        </div>
                                    )}

                                    {/* Opciones del usuario */}
                                    <div className="space-y-2">
                                        {!needsVerification &&(
                                            <button 
                                                onClick={handleProfileClick}
                                                className="flex items-center gap-3 w-full text-left hover:bg-blue-100 rounded-lg p-2 transition duration-200 text-blue-700"
                                            >
                                                <FaUser className="w-4 h-4" />
                                                <span className="font-medium">Mi Perfil</span>
                                            </button>
                                        )}

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

                                        <button
                                            onClick={confirmDelete}
                                            className="flex items-center gap-3 w-full text-left hover:bg-red-50 rounded-lg p-2 transition duration-200 text-red-600"
                                        >
                                            <FaTrash className="w-4 h-4 text-red-500" />
                                            <span className="font-medium">Eliminar Cuenta</span>
                                        </button>
                                    </div>
                                </div>
                            }

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

export default MenuModal;