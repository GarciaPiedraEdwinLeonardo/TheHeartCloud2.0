import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Main from './components/register/Main';
import Home from './components/Home';

function Index() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // OBTENER LOS PROVEEDORES DEL USUARIO
                const providerData = user.providerData || [];
                const isGoogleUser = providerData.some(provider => provider.providerId === 'google.com');
                
                // Solo requerir verificación de email para usuarios que NO son de Google
                if (!user.emailVerified && !isGoogleUser) {
                    // Si no está verificado y no es usuario de Google, cerrar sesión
                    auth.signOut();
                    setUser(null);
                } else {
                    setUser(user);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

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

    return user ? <Home /> : <Main />;
}

export default Index;