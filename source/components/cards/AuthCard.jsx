import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import LoginForm from "../forms/LoginForm";
import RegisterForm from "../forms/RegisterForm";
import ForgotPasswordForm from "../forms/ForgotPasswordForm";

function AuthCard({isOpen,onClose}){
    const [currentView, setCurrentView] = useState('login');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const getTitle = () => {
        switch (currentView) {
            case 'login':
                return 'Iniciar Sesión';
            case 'register':
                return 'Registro de Medico';
            case 'forgot-password':
                return 'Recuperar Contraseña';
            default:
                return 'Iniciar Sesión';
        }
    };

    if (!isOpen) return null;

    return(

        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col" style={{ maxHeight: 'calc(90vh)' }} onClick={(e) => e.stopPropagation()}>

                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white flex-shrink-0">

                    <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>

                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition duration-200">

                        <FaTimes className="w-5 h-5 text-gray-500"/>

                    </button>

                </div>

                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 88px)' }}>

                    {currentView === 'login' && (

                        <LoginForm onSwitchToRegister={() => setCurrentView('register')} onSwitchToForgotPassword={() => setCurrentView('forgot-password')}/>

                    )}

                    {currentView === 'register' && (

                        <RegisterForm onSwitchToLogin={() => setCurrentView('login')}/>

                    )}

                    {currentView === 'forgot-password' && (

                        <ForgotPasswordForm onBack={() => setCurrentView('login')}/>

                    )}

                </div>

            </div>

        </div>

    );

}

export default AuthCard;