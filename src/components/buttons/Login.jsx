import { useState } from 'react';
import LoginModal from './../modals/LoginModal'; 

function Login() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsLoginModalOpen(true)}
        className='bg-blue-600 text-white px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 font-medium whitespace-nowrap text-sm shadow-sm hover:shadow-md flex items-center gap-2'
      >
        <span className="hidden sm:inline">Iniciar Sesión</span>
        <span className="sm:hidden">Login</span>
      </button>

      {/* Modal de Login */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}

export default Login;