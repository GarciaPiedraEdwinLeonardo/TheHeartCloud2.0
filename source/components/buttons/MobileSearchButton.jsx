import { FaSearch } from 'react-icons/fa';

function MobileSearchButton() {
  return (
    <div className="lg:hidden">
      {/* Botón de búsqueda */}
      <button 
        className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
        aria-label="Buscar"
      >
        <FaSearch className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}

export default MobileSearchButton; 