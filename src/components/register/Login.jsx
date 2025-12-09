import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, deleteUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './../../config/firebase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login({ onSwitchToRegister, onSwitchToForgotPassword }) {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: ''
    });

    const validateEmail = (email) => {
        if(!email) return 'El email es requerido';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) return 'Formato de email inválido';

        if(email.length > 254) return 'El email no puede ser de esa longitud';

        if(email.length < 6) return 'El email no puede ser tan corto';

        const invalidChars = /[<>()\[\]\\;:,@"]/;
        if (invalidChars.test(email.split('@')[0])) {
            return 'El email contiene caracteres no permitidos';
        }

        return null;
    };

    const validatePassword = (password) => {
        if(!password) return 'Ingresa una contraseña';

        if(password.length < 8){
            return 'La contraseña debe tener al menos 8 caracteres';
        }

        if(password.length > 18){
            return 'La contraseña debe tener como máximo 18 caracteres';
        }

        const allowedChars = /^[a-zA-Z0-9]+$/;
        if (!allowedChars.test(password)) {
            return 'Solo se permiten letras y números sin espacios';
        }

        return null;
    };

    const validateField = (name, value) => {
        let error = '';
        
        switch (name) {
            case 'email':
                error = validateEmail(value);
                break;
            case 'password':
                error = validatePassword(value);
                break;
            default:
                break;
        }
        
        setFieldErrors(prev => ({
            ...prev,
            [name]: error
        }));
        
        return !error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Limitar longitud según campo
        let processedValue = value;
        if (name === 'email' && value.length > 254) {
            processedValue = value.slice(0, 254);
        } else if (name === 'password' && value.length > 18) {
            processedValue = value.slice(0, 18);
        }
        
        // Para contraseñas, permitir solo letras y números
        if (name === 'password' && value.length > 0) {
            const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
            processedValue = filteredValue.slice(0, 18);
        }
        
        setFormData({
            ...formData,
            [name]: processedValue
        });
        
        // Validación en tiempo real
        if (processedValue) {
            validateField(name, processedValue);
        } else {
            // Limpiar error si el campo está vacío
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    // FUNCIÓN PARA LIMPIAR USUARIO EXPIRADO
    const cleanupExpiredUser = async (user) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const now = new Date();
                const expiresAt = userData.verificationExpiresAt?.toDate();
                
                // Verificar si la verificación expiró (más de 24 horas)
                if (expiresAt && now > expiresAt && !userData.emailVerified) {
                    // Eliminar de Firestore
                    await deleteDoc(doc(db, 'users', user.uid));
                    // Eliminar de Authentication
                    await deleteUser(user);
                    return true; // Indica que se eliminó
                }
            }
        } catch (error) {
            console.error('Error cleaning up expired user:', error);
        }
        return false; // No se eliminó
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validar todos los campos antes de enviar
        const isEmailValid = validateField('email', formData.email);
        const isPasswordValid = validateField('password', formData.password);
        
        if (!isEmailValid || !isPasswordValid) {
            setLoading(false);
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            
            // VERIFICAR SI EL EMAIL ESTÁ CONFIRMADO
            if (!user.emailVerified) {
                // Verificar si el usuario expiró y limpiarlo
                const wasDeleted = await cleanupExpiredUser(user);
                
                if (wasDeleted) {
                    await auth.signOut();
                    setError('El enlace de verificación ha expirado. Por favor regístrate nuevamente.');
                    setLoading(false);
                    return;
                }
                
                await auth.signOut();
                setError('Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada y carpeta de spam. Si no recibiste el email, puedes registrarte nuevamente después de 1 hora.');
                setLoading(false);
                return;
            }
            
            // Si llegó aquí, el email está verificado - permitir acceso
            await updateDoc(doc(db, 'users', user.uid), {
                lastLogin: new Date(),
                emailVerified: true
            });
            
        } catch (error) {
            setError(getErrorMessage(error.code));
            setLoading(false);
        } 
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            // Verificar si el usuario ya existe en Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            
            if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                    id: user.uid,
                    email: user.email,
                    name: null,
                    role: "unverified",
                    profileMedia: null,
                    professionalInfo: null,
                    stats: {
                        aura: 0,
                        contributionCount: 0,
                        postCount: 0,
                        commentCount: 0,
                        forumCount: 0,
                        joinedForumsCount: 0,
                        totalImagesUploaded: 0,
                        totalStorageUsed: 0
                    },
                    suspension: {
                        isSuspended: false,
                        reason: null,
                        startDate: null,
                        endDate: null,
                        suspendedBy: null
                    },
                    joinedForums: [],
                    joinDate: new Date(),
                    lastLogin: new Date(),
                    isActive: true,
                    isDeleted: false,
                    deletedAt: null,
                    emailVerified: true,
                    emailVerificationSentAt: new Date()
                });
            } else {
                // Actualizar lastLogin para usuarios existentes
                await updateDoc(doc(db, 'users', user.uid), {
                    lastLogin: new Date(),
                    emailVerified: true
                });
            }
            
        } catch (error) {
            console.error('Error en login con Google:', error);
            setError(getErrorMessage(error.code));
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const getErrorMessage = (errorCode) => {    
        // Si errorCode es undefined, retornar mensaje genérico
        if (!errorCode) {
            return 'Error al iniciar sesión. Intenta nuevamente.';
        }
        
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'El correo electrónico es inválido';
            case 'auth/invalid-credential':
                return 'El correo electrónico o contraseña no es válido.';
            case 'auth/user-disabled':
                return 'Esta cuenta ha sido deshabilitada.';
            case 'auth/user-not-found':
                return 'No existe una cuenta con este correo electrónico. Regístrate primero.';
            case 'auth/wrong-password':
                return 'La contraseña es incorrecta.';
            case 'auth/too-many-requests':
                return 'Demasiados intentos fallidos. Intenta más tarde.';
            case 'auth/popup-closed-by-user':
                return 'El inicio de sesión con Google fue cancelado.';
            case 'auth/network-request-failed':
                return 'Error de conexión. Verifica tu internet.';
            case 'auth/invalid-login-credentials': 
            case 'auth/invalid-credential':
                return 'Correo o contraseña incorrectos. Verifica tus datos.';
            default:
                return `Error al iniciar sesión: ${errorCode}. Intenta nuevamente.`;
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                Iniciar Sesión
            </h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Correo Electrónico
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => validateField('email', formData.email)}
                        required
                        maxLength={254}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            fieldErrors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="tu@correo.com"
                    />
                    {fieldErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                    )}
                </div>

                <div className='relative'>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => validateField('password', formData.password)}
                        required
                        maxLength={18}
                        pattern="[a-zA-Z0-9]+"
                        title="Solo letras y números (sin espacios ni caracteres especiales)"
                        className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            fieldErrors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                    />

                    <button 
                        type='button' 
                        onClick={toggleShowPassword} 
                        className='absolute right-3 top-9 p-1 text-gray-500 hover:text-gray-700 transition duration-200'
                    >
                        {showPassword ? (
                            <FaEyeSlash className='w-5 h-5' />
                        ) : (
                            <FaEye className='w-5 h-5' />
                        )}
                    </button>
                    
                    {fieldErrors.password && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">O continúa con</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full mt-4 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                    {loading ? 'Iniciando sesión...' : 'Iniciar con Google'}
                </button>
            </div>

            <div className="mt-6 text-center space-y-3">
                <button
                    onClick={onSwitchToForgotPassword}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                    ¿Olvidaste tu contraseña?
                </button>
                <div className="text-sm text-gray-600">
                    ¿No tienes cuenta?{' '}
                    <button
                        onClick={onSwitchToRegister}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Regístrate aquí
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;