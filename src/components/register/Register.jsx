import { useState, useEffect } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from './../../config/firebase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import VerificationSent from './VerificationSent';
import axiosInstance from "./../../config/axiosInstance"

function Register({ onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isFormValid, setIsFormValid] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    }

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

        if (!/(?=.*[a-z])/.test(password)) return 'La contraseña debe contener al menos una minúscula';
        if (!/(?=.*[A-Z])/.test(password)) return 'La contraseña debe contener al menos una mayúscula';
        if (!/(?=.*\d)/.test(password)) return 'La contraseña debe contener al menos un número';

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
            case 'confirmPassword':
                if (value && value !== formData.password) {
                    error = 'Las contraseñas no coinciden';
                } else if (!value) {
                    error = 'Confirma tu contraseña';
                }
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

    // Validar el formulario completo cada vez que cambian los datos
    useEffect(() => {
        const emailValid = validateEmail(formData.email) === null;
        const passwordValid = validatePassword(formData.password) === null;
        const confirmValid = formData.confirmPassword !== '' && 
                            formData.confirmPassword === formData.password;
        
        setIsFormValid(emailValid && passwordValid && confirmValid);
    }, [formData.email, formData.password, formData.confirmPassword]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Limitar longitud según campo
        let processedValue = value;
        if (name === 'email' && value.length > 254) {
            processedValue = value.slice(0, 254);
        } else if ((name === 'password' || name === 'confirmPassword') && value.length > 18) {
            processedValue = value.slice(0, 18);
        }
        
        // Para contraseñas, permitir solo letras y números
        if ((name === 'password' || name === 'confirmPassword') && value.length > 0) {
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

    const handleEmailRegister = async (e) => {
        e.preventDefault();
        
        if (!isFormValid) return;
        
        setLoading(true);
        setError('');

        // Validar todos los campos
        const isEmailValid = validateField('email', formData.email);
        const isPasswordValid = validateField('password', formData.password);
        const isConfirmValid = validateField('confirmPassword', formData.confirmPassword);
        
        if (!isEmailValid || !isPasswordValid || !isConfirmValid) {
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            const response = await axiosInstance.post('/api/auth/register', {
                email: formData.email,
                password: formData.password
            });

            if (response.success && response.data.customToken) {

                const { signInWithCustomToken, sendEmailVerification } = await import('firebase/auth');

                const userCredential = await signInWithCustomToken(auth, response.data.customToken);
                const user = userCredential.user;

                await sendEmailVerification(user);

                await auth.signOut();

                // Registro exitoso - mostrar pantalla de verificación
                setVerificationSent(true);
            }

        } catch (error) {
            console.error('Registration error:', error);
            
            // Manejar errores del backend
            const errorMsg = error.response?.data?.error || error.message || error;
            
            if (errorMsg.startsWith('Ya se envió un email')) {
                setError(errorMsg);
            } else if (errorMsg.includes('ya está registrado')) {
                setError('Este correo electrónico ya está registrado en el sistema.');
            } else {
                setError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!currentUser) return;
        
        setLoading(true);
        try {
            await sendEmailVerification(currentUser);
            setError(''); // Limpiar errores anteriores
            
            // Actualizar timestamp de envío
            await setDoc(doc(db, 'users', currentUser.uid), {
                emailVerificationSentAt: new Date()
            }, { merge: true });
            
        } catch (error) {
            setError('Error al reenviar el email. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Si se envió la verificación, mostrar pantalla de éxito
    if (verificationSent) {
        return (
            <VerificationSent 
                email={formData.email}
                onBackToLogin={onSwitchToLogin}
                onResendEmail={handleResendVerification}
                loading={loading}
            />
        );
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                Crear Cuenta
            </h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleEmailRegister} className="space-y-4">
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
                        minLength={8}
                        maxLength={18}
                        pattern="[a-zA-Z0-9]+"
                        title="Solo letras y números (sin espacios ni caracteres especiales)"
                        className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            fieldErrors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Entre 8 y 18 caracteres"
                    />

                    <button type='button' onClick={toggleShowPassword} className='absolute right-3 top-9 p-1 text-gray-500 hover:text-gray-700 transition duration-200'>
                        {showPassword ? (
                            <FaEyeSlash className='w-5 h-5'></FaEyeSlash>
                        ):(
                            <FaEye className='w-5 h-5'></FaEye>
                        )}
                    </button>
                    
                    {fieldErrors.password && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                    )}

                    {/* Indicadores de requisitos faltantes */}
                    {formData.password && (
                        <div className="mt-2 space-y-1">
                            {!(formData.password.length >= 8 && formData.password.length <= 18) && (
                                <div className="text-xs flex items-center text-red-500">
                                    <span className="mr-1">•</span>
                                    Debe tener entre 8 y 18 caracteres
                                </div>
                            )}
                            {!/(?=.*[a-z])/.test(formData.password) && (
                                <div className="text-xs flex items-center text-red-500">
                                    <span className="mr-1">•</span>
                                    Debe contener al menos una minúscula
                                </div>
                            )}
                            {!/(?=.*[A-Z])/.test(formData.password) && (
                                <div className="text-xs flex items-center text-red-500">
                                    <span className="mr-1">•</span>
                                    Debe contener al menos una mayúscula
                                </div>
                            )}
                            {!/(?=.*\d)/.test(formData.password) && (
                                <div className="text-xs flex items-center text-red-500">
                                    <span className="mr-1">•</span>
                                    Debe contener al menos un número
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className='relative'>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Contraseña
                    </label>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
                        required
                        minLength={8}
                        maxLength={18}
                        pattern="[a-zA-Z0-9]+"
                        className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            fieldErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Repite tu contraseña"
                    />

                    <button type='button' onClick={toggleShowConfirmPassword} className='absolute right-3 top-9 p-1 text-gray-500 hover:text-gray-700 transition duration-200'>
                        {showConfirmPassword ? (
                            <FaEyeSlash className='w-5 h-5'></FaEyeSlash>
                        ):(
                            <FaEye className='w-5 h-5'></FaEye>
                        )}
                    </button>
                    
                    {fieldErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
                    )}

                    {/* Indicador de falta de coincidencia */}
                    {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                        <div className="text-xs mt-1 flex items-center text-red-500">
                            <span className="mr-1">•</span>
                            Las contraseñas no coinciden
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || !isFormValid}
                    className={`w-full py-3 px-4 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ${
                        loading || !isFormValid
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <div className="text-sm text-gray-600">
                    ¿Ya tienes cuenta?{' '}
                    <button
                        onClick={onSwitchToLogin}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Inicia sesión aquí
                    </button>
                </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 text-center">
                    <strong>Nota:</strong> Las cuentas no verificadas se eliminan automáticamente después de 24 horas.
                </p>
            </div>
        </div>
    );
}

export default Register;