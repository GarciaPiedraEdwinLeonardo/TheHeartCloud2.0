import { useState, useEffect } from 'react';
import { updatePassword, EmailAuthProvider, linkWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function SetPasswordAfterGoogle({ user, onComplete }) {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

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

    // Validar el formulario completo cada vez que cambian los datos o errores
    useEffect(() => {
        const passwordValid = validatePassword(formData.password) === null;
        const confirmValid = formData.confirmPassword !== '' && 
                            formData.confirmPassword === formData.password;
        
        setIsFormValid(passwordValid && confirmValid);
    }, [formData.password, formData.confirmPassword]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Limitar longitud
        let processedValue = value;
        if ((name === 'password' || name === 'confirmPassword') && value.length > 18) {
            processedValue = value.slice(0, 18);
        }
        
        // Para contraseñas, permitir solo letras y números
        if ((name === 'password' || name === 'confirmPassword') && value.length > 0) {
            const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
            processedValue = filteredValue.slice(0, 18);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
        
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prevenir envío si el formulario no es válido
        if (!isFormValid) {
            return;
        }
        
        setLoading(true);
        setError('');

        // Validar todos los campos antes de enviar
        const isPasswordValid = validateField('password', formData.password);
        const isConfirmValid = validateField('confirmPassword', formData.confirmPassword);
        
        if (!isPasswordValid || !isConfirmValid) {
            setLoading(false);
            return;
        }

        // Validar que coinciden las contraseñas
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            // IMPORTANTE: Cuando un usuario de Google establece contraseña por primera vez
            // Necesitamos verificar si ya tiene algún proveedor de email/contraseña
            
            // 1. Verificar los proveedores actuales
            const userData = auth.currentUser;
            const providerData = userData.providerData || [];
            const hasEmailPasswordProvider = providerData.some(
                provider => provider.providerId === 'password'
            );
            
            if (hasEmailPasswordProvider) {
                // Si ya tiene proveedor de email/contraseña, solo actualizar la contraseña
                await updatePassword(userData, formData.password);
            } else {
                // Si no tiene proveedor de email/contraseña, vincularlo
                const emailCredential = EmailAuthProvider.credential(
                    user.email,
                    formData.password
                );
                
                await linkWithCredential(userData, emailCredential);
            }
            
            // Actualizar en Firestore que el usuario ahora tiene contraseña
            await updateDoc(doc(db, 'users', user.uid), {
                hasPassword: true,
                lastPasswordUpdate: new Date(),
                emailVerified: true // Asegurar que está verificado
            });
            
            // Notificar que se completó
            onComplete();
            
        } catch (error) {
            console.error('Error setting password:', error);
            
            // Manejar errores específicos
            if (error.code === 'auth/requires-recent-login') {
                setError('Por favor, vuelve a iniciar sesión con Google primero.');
            } else if (error.code === 'auth/email-already-in-use') {
                setError('Este email ya está en uso con otro método de autenticación.');
            } else {
                setError(`Error: ${error.message || 'Intenta nuevamente.'}`);
            }
            
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Establecer Contraseña
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Para continuar, necesitas establecer una contraseña para tu cuenta.
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Email: <strong>{user?.email}</strong>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className='relative'>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Nueva Contraseña
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
                            autoComplete="new-password"
                        />

                        <button 
                            type='button' 
                            onClick={() => setShowPassword(!showPassword)} 
                            className='absolute right-3 top-9 p-1 text-gray-500 hover:text-gray-700 transition duration-200'
                        >
                            {showPassword ? (
                                <FaEyeSlash className='w-5 h-5' />
                            ):(
                                <FaEye className='w-5 h-5' />
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
                            autoComplete="new-password"
                        />

                        <button 
                            type='button' 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                            className='absolute right-3 top-9 p-1 text-gray-500 hover:text-gray-700 transition duration-200'
                        >
                            {showConfirmPassword ? (
                                <FaEyeSlash className='w-5 h-5' />
                            ):(
                                <FaEye className='w-5 h-5' />
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
                        {loading ? 'Estableciendo contraseña...' : 'Establecer Contraseña'}
                    </button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                        <strong>Importante:</strong> Una vez establecida la contraseña, podrás iniciar sesión tanto con Google como con tu correo electrónico y contraseña.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SetPasswordAfterGoogle;