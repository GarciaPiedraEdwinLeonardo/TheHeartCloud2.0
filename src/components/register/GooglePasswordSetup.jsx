import { useState } from 'react';
import { updatePassword, EmailAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './../../config/firebase';
import { FaEye, FaEyeSlash, FaGoogle, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';

function GooglePasswordSetup({ googleUser, onSetupComplete, onCancel }) {
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
                if (value !== formData.password) {
                    error = 'Las contraseñas no coinciden';
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Limitar longitud
        let processedValue = value;
        if ((name === 'password' || name === 'confirmPassword') && value.length > 18) {
            processedValue = value.slice(0, 18);
        }
        
        // Permitir solo letras y números
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
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validar campos
    const isPasswordValid = validateField('password', formData.password);
    const isConfirmValid = validateField('confirmPassword', formData.confirmPassword);
    
    if (!isPasswordValid || !isConfirmValid) {
        setLoading(false);
        return;
    }

    try {
        // Obtener el usuario actual de Firebase Auth
        const user = auth.currentUser;
        
        if (!user) {
            throw new Error('No hay usuario autenticado');
        }
        
        // Verificar que sea un usuario de Google
        const isGoogleUser = user.providerData.some(
            provider => provider.providerId === 'google.com'
        );
        
        if (!isGoogleUser) {
            throw new Error('Este usuario no es de Google');
        }
        
        // Establecer la nueva contraseña directamente
        await updatePassword(user, formData.password);
        
        // Actualizar Firestore para marcar que ya tiene contraseña
        await updateDoc(doc(db, 'users', user.uid), {
            hasPassword: true,
            lastPasswordUpdate: new Date(),
            // Añadir también el proveedor "password" para que pueda iniciar con email/contraseña
            provider: 'google_and_password'
        });
        
        // Notificar que la configuración está completa
        onSetupComplete();
        
    } catch (error) {
        console.error('Error configurando contraseña:', error);
        
        // Si falla updatePassword, puede ser que necesite reautenticación
        if (error.code === 'auth/requires-recent-login') {
            setError('Tu sesión de Google ha expirado. Por favor, cancela e inicia sesión nuevamente con Google.');
            // Opcional: cerrar sesión automáticamente
            setTimeout(() => {
                auth.signOut();
                onCancel();
            }, 3000);
        } else {
            setError(getErrorMessage(error.code));
        }
        setLoading(false);
    }
};

    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/weak-password':
                return 'La contraseña es demasiado débil. Usa al menos 8 caracteres con mayúsculas, minúsculas y números.';
            case 'auth/requires-recent-login':
                return 'Necesitas iniciar sesión nuevamente. Por favor cancela e intenta con Google otra vez.';
            case 'auth/credential-already-in-use':
                return 'Esta contraseña ya está asociada a otra cuenta.';
            default:
                return 'Error al configurar la contraseña. Por favor intenta nuevamente.';
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            {/* Encabezado */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaShieldAlt className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Configura tu Contraseña
                </h2>
                
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                    <FaGoogle className="w-4 h-4" />
                    <span className="text-sm">
                        Registrado con Google: <strong className="break-all">{googleUser.email}</strong>
                    </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-2">
                    Configura una contraseña para poder iniciar sesión también con tu correo electrónico.
                </p>
                <p className="text-gray-500 text-xs">
                    Este paso es obligatorio para acceder a la plataforma.
                </p>
            </div>

            {/* Mensaje de error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
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
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            fieldErrors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Entre 8 y 18 caracteres"
                        disabled={loading}
                    />
                    
                    <button 
                        type="button" 
                        onClick={toggleShowPassword} 
                        className="absolute right-3 top-9 p-1 text-gray-500 hover:text-gray-700 transition duration-200"
                        disabled={loading}
                    >
                        {showPassword ? (
                            <FaEyeSlash className="w-5 h-5" />
                        ) : (
                            <FaEye className="w-5 h-5" />
                        )}
                    </button>
                    
                    {fieldErrors.password && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                    )}
                    
                    <div className="mt-2 text-xs text-gray-500">
                        <p className="font-medium mb-1">Requisitos:</p>
                        <ul className="space-y-1">
                            <li className="flex items-center">
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                8-18 caracteres
                            </li>
                            <li className="flex items-center">
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${/(?=.*[a-z])/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                Al menos una minúscula
                            </li>
                            <li className="flex items-center">
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${/(?=.*[A-Z])/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                Al menos una mayúscula
                            </li>
                            <li className="flex items-center">
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${/(?=.*\d)/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                Al menos un número
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="relative">
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
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            fieldErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Repite tu contraseña"
                        disabled={loading}
                    />
                    
                    <button 
                        type="button" 
                        onClick={toggleShowConfirmPassword} 
                        className="absolute right-3 top-9 p-1 text-gray-500 hover:text-gray-700 transition duration-200"
                        disabled={loading}
                    >
                        {showConfirmPassword ? (
                            <FaEyeSlash className="w-5 h-5" />
                        ) : (
                            <FaEye className="w-5 h-5" />
                        )}
                    </button>
                    
                    {fieldErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
                    )}
                </div>

                {/* Botones */}
                <div className="space-y-3 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Configurando...
                            </>
                        ) : (
                            'Configurar Contraseña y Continuar'
                        )}
                    </button>
                    
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        <FaArrowLeft className="w-4 h-4 mr-2" />
                        Cancelar y Cerrar Sesión
                    </button>
                </div>
            </form>

            {/* Información adicional */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                    <strong>¿Por qué configurar una contraseña?</strong>
                </p>
                <ul className="mt-2 text-xs text-blue-600 space-y-1">
                    <li className="flex items-start">
                        <span className="inline-block w-1 h-1 rounded-full bg-blue-500 mr-2 mt-1.5"></span>
                        Podrás iniciar sesión tanto con Google como con tu correo y contraseña
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-1 h-1 rounded-full bg-blue-500 mr-2 mt-1.5"></span>
                        Acceso en dispositivos o navegadores donde no puedas usar Google
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-1 h-1 rounded-full bg-blue-500 mr-2 mt-1.5"></span>
                        Mayor seguridad para tu cuenta
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-1 h-1 rounded-full bg-blue-500 mr-2 mt-1.5"></span>
                        Requisito obligatorio de la plataforma
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default GooglePasswordSetup;