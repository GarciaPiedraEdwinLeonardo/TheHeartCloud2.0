import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './../../config/firebase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Register({ onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordErrors,setPasswordErrors] = useState([]);
    const [showPassword,setShowPassword] = useState(false);
    const [showConfirmPassword,setShowConfirmPassword] = useState(false);

    const toogleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const toogleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validatePassword = (password) => {

        {/* Validar longitud de la contraseña */}
        if(password.length < 8 ){
            return 'La contraseña debe tener al menos 8 caracteres';
        }

        if(password.length > 18){
            return 'La contraseña debe tener como máximo 18 caracteres';
        }

        {/* Validar que no tenga caracteres especiales */}
        const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        if(specialChars.test(password)){
            return 'La contraseña no puede contener caracteres especiales';
        }

        return null;

    };

    {/* Para validar en tiempo real */}
    const validatePasswordRealTime = (password) =>{
        const errors = [];

        if (password.length < 8) {
            errors.push('Mínimo 8 caracteres');
        }
        if (password.length > 18) {
            errors.push('Máximo 18 caracteres');
        }
        const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        if (specialChars.test(password)) {
            errors.push('Solo letras y números');
        }
    
        setPasswordErrors(errors);
        return errors.length === 0;
    }


    const handleEmailRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validar que coinciden las contraseñas
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        const passwordError = validatePassword(formData.password);
        if(passwordError){
            setError(passwordError);
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // Crear documento en Firestore con estructura mínima
            await setDoc(doc(db, 'users', user.uid), {
                id: user.uid,
                email: user.email,
                name: null,
                role: "unverified",
                profileMedia: null,
                professionalInfo: null,
                stats: null,
                suspension: null,
                joinedForums: null,
                joinDate: new Date(),
                lastLogin: new Date(),
                isActive: true,
                isDeleted: false,
                deletedAt: null
            });

        } catch (error) {
            setError(getErrorMessage(error.code));
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Crear documento en Firestore con estructura mínima
            await setDoc(doc(db, 'users', user.uid), {
                id: user.uid,
                email: user.email,
                username: null,
                name: null,
                role: "unverified",
                profileMedia: null,
                professionalInfo: null,
                stats: null,
                suspension: null,
                joinedForums: null,
                joinDate: new Date(),
                lastLogin: new Date(),
                isActive: true,
                isDeleted: false,
                deletedAt: null
            });

        } catch (error) {
            setError(getErrorMessage(error.code));
            setLoading(false);
        } 
    };

    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'Este correo electrónico ya está registrado.';
            case 'auth/invalid-email':
                return 'El correo electrónico no es válido.';
            case 'auth/operation-not-allowed':
                return 'El registro con email/contraseña no está habilitado.';
            case 'auth/weak-password':
                return 'La contraseña es demasiado débil.';
            case 'auth/popup-closed-by-user':
                return 'El registro con Google fue cancelado.';
            default:
                return 'Error al crear la cuenta. Intenta nuevamente.';
        }
    };

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
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="tu@correo.com"
                    />
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
                        onBlur={() => validatePasswordRealTime(formData.password)}
                        required
                        minLength={8}
                        maxLength={18}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Entre 8 y 18 caracteres"
                    />

                    <button type='button' onClick={toogleShowPassword} className='absolute right-3 top-9 p-1 text-gray-500 hover:text-gray-700 transition duration-200'>
                        {showPassword ? (
                            <FaEyeSlash className='w-5 h-5'></FaEyeSlash>
                        ):(
                            <FaEye className='w-5 h-5'></FaEye>
                        )}
                    </button>

                </div>

                {passwordErrors.length > 0 && (
                    <div className='text-red-500 text-xs space-y-1 mt-1'>
                        {passwordErrors.map((error,index) => (
                            <p key={index}> {error}</p>
                        ))}
                    </div>
                )}

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
                        required
                        minLength={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Repite tu contraseña"
                    />

                    <button type='button' onClick={toogleShowConfirmPassword} className='absolute right-3 top-9 p-1 text-gray-500 hover:text-gray-700 transition duration-200'>
                        {showConfirmPassword ? (
                            <FaEyeSlash className='w-5 h-5'></FaEyeSlash>
                        ):(
                            <FaEye className='w-5 h-5'></FaEye>
                        )}
                    </button>

                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">O regístrate con</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleRegister}
                    disabled={loading}
                    className="w-full mt-4 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                    
                    Google
                </button>
            </div>

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
                    <strong>Nota:</strong> Después del registro, podras verificarte como doctor de lo contrario solo podas leer el contenido
                </p>
            </div>
        </div>
    );
}

export default Register;