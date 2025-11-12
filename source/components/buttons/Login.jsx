import { useState } from "react";
import AuthCard from "../cards/AuthCard";

function Login(){
    const[isAuthCardOpen,setIsAuthCardOpen] = useState(false);
    
    return(
    <>
        <button aria-label="Iniciar Sesion" className="bg-blue-600 text-white px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 font-medium whitespace-nowrap text-sm shadow-sm hover:shadow-md flex items-center gap-2" onClick={() => setIsAuthCardOpen(true)}>

            <span className="hidden sm:inline">Iniciar Sesión</span>

            <span className="sm:hidden">Login</span>

        </button>

        {/* Modal del Login */}
        <AuthCard isOpen={isAuthCardOpen} onClose={() => setIsAuthCardOpen(false)}/>
        

    </>
    );
}

export default Login;