function VerificationSent({ email, onBackToLogin, onResendEmail, loading }) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Verifica tu email
                </h2>
                
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
                    <p className="font-medium">Email de verificación enviado</p>
                    <p className="mt-2 text-sm">
                        Hemos enviado un enlace de verificación a <strong>{email}</strong>. 
                        Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
                        Después de activar tu cuenta inicia sesión
                    </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6 text-sm">
                    <p><strong>⚠️ Importante:</strong></p>
                    <ul className="mt-2 space-y-1">
                        <li>• <strong>Tienes 24 horas</strong> para verificar tu cuenta</li>
                        <li>• Revisa tu carpeta de spam o correo no deseado</li>
                        <li>• Si no verificas en 24 horas, tu cuenta se eliminará automáticamente</li>
                        <li>• Solo puedes solicitar un nuevo email cada 1 hora</li>
                    </ul>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={onResendEmail}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Enviando...' : 'Reenviar email de verificación'}
                    </button>
                    
                    <button
                        onClick={onBackToLogin}
                        className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-all"
                    >
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VerificationSent;