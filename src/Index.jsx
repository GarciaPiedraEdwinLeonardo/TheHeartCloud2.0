import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Main from './components/register/Main';
import Home from './components/Home';
import GooglePasswordSetup from './components/register/GooglePasswordSetup';

function Index() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
    const [googleUserData, setGoogleUserData] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('Auth state changed:', user?.uid, user?.email);
            
            if (user) {
                // Verificar si el usuario tiene contraseña configurada
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    
                    // Detectar si es usuario de Google
                    const isGoogleUser = user.providerData.some(
                        provider => provider.providerId === 'google.com'
                    );
                    
                    console.log('User data:', {
                        uid: user.uid,
                        email: user.email,
                        hasPassword: userData.hasPassword,
                        isGoogleUser: isGoogleUser,
                        providerData: user.providerData
                    });
                    
                    // Si es usuario de Google y NO tiene contraseña configurada
                    if (isGoogleUser && userData.hasPassword === false) {
                        console.log('Google user needs password setup');
                        setGoogleUserData({
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL
                        });
                        setNeedsPasswordSetup(true);
                        setUser(null); // No establecer usuario todavía
                    } else {
                        // Usuario normal o Google con contraseña configurada
                        setUser(user);
                        setNeedsPasswordSetup(false);
                        setGoogleUserData(null);
                    }
                } else {
                    // Documento no existe (caso raro)
                    setUser(user);
                    setNeedsPasswordSetup(false);
                    setGoogleUserData(null);
                }
            } else {
                setUser(null);
                setNeedsPasswordSetup(false);
                setGoogleUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const handlePasswordSetupComplete = () => {
        // Actualizar estado y permitir acceso
        setNeedsPasswordSetup(false);
        setGoogleUserData(null);
        
        // Forzar recarga del usuario actual
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUser(currentUser);
        }
    };

    const handlePasswordSetupCancel = async () => {
        try {
            // Cerrar sesión y limpiar
            await auth.signOut();
            setNeedsPasswordSetup(false);
            setGoogleUserData(null);
            setUser(null);
        } catch (error) {
            console.error('Error cancelando configuración:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    // Si necesita configurar contraseña, mostrar pantalla de configuración
    if (needsPasswordSetup && googleUserData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <div className="w-50 h-50 flex items-center justify-center">
                                <img 
                                    src="/img/logoprincipal.png" 
                                    alt="TheHeartCloud Logo" 
                                    className="w-28 h-28 object-contain rounded-xl"
                                />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-blue-700 mb-2">TheHeartCloud</h1>
                        <p className="text-gray-600 text-lg">Comunidad médica especializada</p>
                    </div>
                    
                    {/* Componente de configuración de contraseña */}
                    <GooglePasswordSetup 
                        googleUser={googleUserData}
                        onSetupComplete={handlePasswordSetupComplete}
                        onCancel={handlePasswordSetupCancel}
                    />
                </div>
            </div>
        );
    }

    return user ? <Home /> : <Main />;
}

export default Index;