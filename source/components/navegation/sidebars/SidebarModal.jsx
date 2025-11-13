import { useState } from 'react';
import { FaAngleDown, FaAngleUp, FaTimes } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import Logo from './../../buttons/Logo'
import CreateThemeModal from './../../modals/CreateThemeModal';

function SidebarModal({ isOpen, onClose, onInicioClick, onThemeClick }) {
  const [isThemesOpen, setIsThemesOpen] = useState(true);
  const [isMyThemesOpen, setIsMyThemesOpen] = useState(false);
  const [showCreateThemeModal, setShowCreateThemeModal] = useState(false);

  const healthTopics = [
    { id: 1, name: 'Cardiología', description: 'Enfermedades del corazón' },
    { id: 2, name: 'Diabetes', description: 'Manejo y prevención' },
    { id: 3, name: 'Salud Mental', description: 'Bienestar psicológico' },
    { id: 4, name: 'COVID-19', description: 'Actualizaciones y prevención' },
    { id: 5, name: 'Oncología', description: 'Prevención del cáncer' },
    { id: 6, name: 'Neurología', description: 'Sistema nervioso' },
    { id: 7, name: 'Ortopedia', description: 'Huesos y articulaciones' },
    { id: 8, name: 'Oftalmología', description: 'Salud visual' },
    { id: 9, name: 'Pediatría', description: 'Salud infantil' },
    { id: 10, name: 'Medicina del Sueño', description: 'Trastornos del sueño' }
  ];

  const handleCreateTheme = () => {
    setShowCreateThemeModal(true);
  };

  const handleInicio = () => {
    onInicioClick();
    onClose();
  };

  const handleThemeClick = (topic) => {
    if (onThemeClick) {
      onThemeClick({
        id: topic.id,
        nombre: topic.name,
        descripcion: topic.description,
        fechaCreacion: '2023-01-15',
        integrantes: Math.floor(Math.random() * 1000) + 500,
        publicaciones: Math.floor(Math.random() * 200) + 50,
        creador: 'Administración'
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div 
        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal del Sidebar */}
      <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl">
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <Logo />
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <FaTimes className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Contenido del Sidebar */}
        <div className="h-full overflow-y-auto pb-20">
          <nav className="p-4">
            {/* Inicio */}
            <button 
              onClick={handleInicio}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition duration-200 mb-2 w-full text-left"
            >
              <span className="font-medium">Inicio</span>
            </button>

            {/* Temas Predefinidos - Acordeón */}
            <div className="mb-4">
              <button
                onClick={() => setIsThemesOpen(!isThemesOpen)}
                className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition duration-200"
              >
                <span className="font-medium">Temas Predefinidos</span>
                {isThemesOpen ? 
                  <FaAngleDown className="w-4 h-4" /> : 
                  <FaAngleUp className="w-4 h-4" />
                }
              </button>

              {isThemesOpen && (
                <div className="mt-2 ml-4 space-y-1">
                  {healthTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleThemeClick(topic)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition duration-200 group w-full text-left"
                      title={topic.description}
                    >
                      <span className="text-sm flex-1">{topic.name}</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaAngleUp className="w-3 h-3 text-gray-400 transform rotate-90" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Crear Tema */}
            <div className="mb-4">
              <button 
                onClick={handleCreateTheme}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-600 transition duration-200 w-full text-left"
              >
                <IoIosAddCircleOutline className='w-5 h-5' />
                <span className="font-medium">Crear Tema</span>
              </button>
            </div>

            {/* Mis Temas - Acordeón */}
            <div className="mb-4">
              <button
                onClick={() => setIsMyThemesOpen(!isMyThemesOpen)}
                className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition duration-200"
              >
                <span className="font-medium">Mis Temas</span>
                {isMyThemesOpen ? 
                  <FaAngleDown className="w-4 h-4" /> : 
                  <FaAngleUp className="w-4 h-4" />
                }
              </button>

              {isMyThemesOpen && (
                <div className="mt-2 ml-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                      Próximamente cargaré datos de una base de datos
                    </p>
                    <div className="mt-2 flex justify-center">
                      <div className="animate-pulse flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Separador */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Términos y Condiciones */}
            <div className="mb-4">
              <a 
                href="/terminos-y-condiciones"
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition duration-200"
              >
                <span className="text-sm font-medium">Términos y Condiciones</span>
              </a>
            </div>
          </nav>
        </div>
      </div>

      {/* Modal de Creación de Tema */}
      <CreateThemeModal 
        isOpen={showCreateThemeModal}
        onClose={() => setShowCreateThemeModal(false)}
      />
    </>
  );
}

export default SidebarModal;