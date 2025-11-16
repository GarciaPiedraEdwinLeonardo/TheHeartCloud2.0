import { FaUserCheck, FaExclamationTriangle } from 'react-icons/fa';

function VerificarCuenta({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 w-full text-left bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg p-3 transition duration-200 group"
        >
            <div className="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                <FaUserCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
                <p className="font-semibold text-amber-800 text-sm">
                    Verificar Cuenta
                </p>
                <p className="text-amber-600 text-xs">
                    Completa tu perfil médico
                </p>
            </div>
            <FaExclamationTriangle className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
        </button>
    );
}

export default VerificarCuenta;