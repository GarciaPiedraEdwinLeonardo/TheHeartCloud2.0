import { FaTimes, FaRegUserCircle } from 'react-icons/fa';
import Login from '../buttons/Login';

function MenuModal({ isOpen, onClose, onProfileClick }) {
  if (!isOpen) return null;

  const handleProfileClick = () => {
    onProfileClick(); 
    onClose(); 
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      
      <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h2 className="text-xl font-bold text-blue-600">Menú</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6">
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Iniciar Sesión</h3>
                <p className="text-blue-600 text-sm mb-4">Accede a tu cuenta</p>
                <Login />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">Mi Perfil</h3>
                <button 
                  onClick={handleProfileClick}
                  className="flex items-center gap-3 mb-3 w-full text-left hover:bg-gray-100 rounded-lg p-2 transition duration-200"
                >
                  <div className="bg-gray-200 rounded-full p-2">
                    <FaRegUserCircle className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium text-sm">Usuario</p>
                    <p className="text-gray-500 text-xs">Ver mi perfil</p>
                  </div>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuModal;