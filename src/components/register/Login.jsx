import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './../../config/firebase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axiosInstance from "./../../config/axiosInstance"

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
    const [touched, setTouched] = useState({
        email: false,
        password: false
    });

    const validateEmail = (email) => {
    if (!email) return 'El email es requerido';

    if (email.length < 6)
        return 'El email es demasiado corto';

    if (email.length > 254)
        return 'El email es demasiado largo';

    // Bloquear solo emojis reales (no números)
    if (/\p{Extended_Pictographic}/u.test(email))
        return 'El email no puede contener emojis';

    const emailRegex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email))
        return 'Formato de email inválido';

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

    // Función para verificar si el formulario es válido
    const isFormValid = () => {
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        
        return !emailError && !passwordError && formData.email && formData.password;
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
        
        // Validación en tiempo real solo si el campo ha sido tocado
        if (touched[name] && processedValue) {
            validateField(name, processedValue);
        } else if (touched[name] && !processedValue) {
            // Mostrar error si el campo está vacío y ha sido tocado
            setFieldErrors(prev => ({
                ...prev,
                [name]: name === 'email' ? 'El email es requerido' : 'Ingresa una contraseña'
            }));
        } else if (!touched[name]) {
            // Limpiar error si el campo no ha sido tocado
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleBlur = (name) => {
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
        validateField(name, formData[name]);
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        
        // Marcar todos los campos como tocados
        setTouched({
            email: true,
            password: true
        });
        
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
            
            // OBTENER LOS PROVEEDORES DEL USUARIO
            const providerData = user.providerData || [];
            const isGoogleUser = providerData.some(provider => provider.providerId === 'google.com');
            
            // Verificar si es usuario de Google (ya verificado por Google)
            // o si es usuario normal y necesita verificar email
            if (!user.emailVerified && !isGoogleUser) {
                await auth.signOut();
                setError('Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada y carpeta de spam.');
                setLoading(false);
                return;
            }
            
            // Actualizar lastLogin a través del backend
            try {
                await axiosInstance.post('/api/auth/update-login', {
                    userId: user.uid
                });
            } catch (err) {
                console.error('Error actualizando lastLogin:', err);
                // No bloquear el login si falla esto
            }
            
        } catch (error) {
            setError(getErrorMessage(error.code));
            setLoading(false);
        } 
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');

        try {
            // 1. Autenticar con Google
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            // 2. Obtener ID token
            const idToken = await user.getIdToken();

            // 3. Enviar al backend
            const response = await axiosInstance.post('/api/auth/google', {
                idToken: idToken
            });
            
        } catch (error) {
            console.error('Error en login con Google:', error);
            
            if (error.code !== 'auth/popup-closed-by-user' && 
                error.code !== 'auth/cancelled-popup-request') {
                const errorMsg = error.response?.data?.error || error.message;
                setError(errorMsg);
            }
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
                return 'Error al iniciar sesión: Intenta nuevamente.';
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
                        onBlur={() => handleBlur('email')}
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
                        onBlur={() => handleBlur('password')}
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
                    disabled={loading || !isFormValid()}
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