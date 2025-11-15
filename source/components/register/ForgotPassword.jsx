import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './../../config/firebase';

function ForgotPassword({ onSwitchToLogin }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.');
        } catch (error) {
            setError(getErrorMessage(error.code));
        } finally {
            setLoading(false);
        }
    };

    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'No existe una cuenta con este correo electrónico.';
            case 'auth/invalid-email':
                return 'El correo electrónico no es válido.';
            case 'auth/too-many-requests':
                return 'Demasiados intentos. Intenta más tarde.';
            default:
                return 'Error al enviar el correo de recuperación. Intenta nuevamente.';
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                Recuperar Contraseña
            </h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Correo Electrónico
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="tu@correo.com"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={onSwitchToLogin}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                    ← Volver al inicio de sesión
                </button>
            </div>
        </div>
    );
}

export default ForgotPassword;