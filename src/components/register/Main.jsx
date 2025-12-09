import { useState } from 'react';
import Aside from './Aside';
import Register from './Register';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import GooglePasswordSetup from './GooglePasswordSetup';
import Logo from './../../img/logoprincipal.png'

function Main() {
    const [activeComponent, setActiveComponent] = useState('login');
    const [googleUserData, setGoogleUserData] = useState(null);

    const handleGooglePasswordSetup = (userData) => {
        console.log('Redirecting to Google password setup for:', userData.email);
        setGoogleUserData(userData);
        setActiveComponent('google-password-setup');
    };

    const handlePasswordSetupComplete = () => {
        console.log('Password setup complete');
        setGoogleUserData(null);
        setActiveComponent('login');
    };

    const handlePasswordSetupCancel = () => {
        console.log('Password setup cancelled');
        setGoogleUserData(null);
        setActiveComponent('login');
    };

    const renderComponent = () => {
        switch (activeComponent) {
            case 'register':
                return <Register onSwitchToLogin={() => setActiveComponent('login')} />;
            case 'forgot-password':
                return <ForgotPassword onSwitchToLogin={() => setActiveComponent('login')} />;
            case 'google-password-setup':
                return googleUserData ? (
                    <GooglePasswordSetup 
                        googleUser={googleUserData}
                        onSetupComplete={handlePasswordSetupComplete}
                        onCancel={handlePasswordSetupCancel}
                    />
                ) : (
                    <Login 
                        onSwitchToRegister={() => setActiveComponent('register')}
                        onSwitchToForgotPassword={() => setActiveComponent('forgot-password')}
                        onGooglePasswordSetup={handleGooglePasswordSetup}
                    />
                );
            default:
                return <Login 
                    onSwitchToRegister={() => setActiveComponent('register')}
                    onSwitchToForgotPassword={() => setActiveComponent('forgot-password')}
                    onGooglePasswordSetup={handleGooglePasswordSetup}
                />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col lg:flex-row">
            
            {/* Sección informativa - Aside */}
            <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
                <Aside />
            </div>

            {/* Sección de autenticación */}
            <div className="lg:w-1/2 bg-white">
                <div className="min-h-screen flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        {/* Logo y título */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-6">
                                <div className="w-50 h-50 flex items-center justify-center">
                                    <img 
                                        src={Logo} 
                                        alt="TheHeartCloud Logo" 
                                        className="w-28 h-28 object-contain rounded-xl"
                                    />
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold text-blue-700 mb-2">TheHeartCloud</h1>
                            <p className="text-gray-600 text-lg">Comunidad médica especializada</p>
                        </div>

                        {/* Componente dinámico de autenticación */}
                        {renderComponent()}

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Main;