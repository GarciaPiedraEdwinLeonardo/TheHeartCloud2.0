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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Elementos decorativos de fondo */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Círculos decorativos animados */}
                    <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-40 right-20 w-72 h-72 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>

                {/* Contenedor principal */}
                <div className="relative z-10 text-center">
                    {/* Logo o icono animado */}
                    <div className="mb-8 relative">
                        {/* Anillo exterior pulsante */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 border-4 border-blue-200 rounded-full animate-ping"></div>
                        </div>
                        
                        {/* Anillo giratorio */}
                        <div className="relative flex items-center justify-center">
                            <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            
                            {/* Punto central */}
                            <div className="absolute w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-lg flex items-center justify-center">
                                <div className="w-8 h-8 bg-white rounded-full opacity-30 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Texto de carga */}
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-slate-600 animate-pulse">
                            Cargando
                        </h2>
                        
                        {/* Puntos animados */}
                        <div className="flex justify-center space-x-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        
                        <p className="text-sm text-slate-500 font-medium">
                            Preparando la pagina
                        </p>
                    </div>

                    {/* Barra de progreso decorativa */}
                    <div className="mt-8 w-64 mx-auto">
                        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-progress"></div>
                        </div>
                    </div>
                </div>

                {/* Estilos de animación personalizados */}
                <style>{`
                    @keyframes blob {
                        0%, 100% {
                            transform: translate(0, 0) scale(1);
                        }
                        25% {
                            transform: translate(20px, -20px) scale(1.1);
                        }
                        50% {
                            transform: translate(-20px, 20px) scale(0.9);
                        }
                        75% {
                            transform: translate(20px, 20px) scale(1.05);
                        }
                    }

                    @keyframes progress {
                        0% {
                            transform: translateX(-100%);
                        }
                        100% {
                            transform: translateX(400%);
                        }
                    }

                    .animate-blob {
                        animation: blob 7s infinite;
                    }

                    .animation-delay-2000 {
                        animation-delay: 2s;
                    }

                    .animation-delay-4000 {
                        animation-delay: 4s;
                    }

                    .animate-progress {
                        animation: progress 1.5s ease-in-out infinite;
                    }
                `}</style>
            </div>
        );
    }

    return user ? <Home /> : <Main />;
}

export default Index;