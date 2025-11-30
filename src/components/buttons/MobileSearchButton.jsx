import { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

function MobileSearchButton({ onSearch }) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim(), 'posts');
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleClose = () => {
    setShowSearch(false);
    setSearchQuery('');
  };

  return (
    <div className="lg:hidden">
      {/* Botón de búsqueda */}
      <button 
        onClick={() => setShowSearch(!showSearch)}
        className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
        aria-label="Buscar"
      >
        {showSearch ? (
          <FaTimes className="w-5 h-5 text-gray-600" />
        ) : (
          <FaSearch className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Barra de búsqueda expandible */}
      {showSearch && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-40 animate-slideDown">
          <form onSubmit={handleSearch} className="flex w-full max-w-2xl mx-auto">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar publicaciones..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              autoFocus
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white px-4 py-3 rounded-r-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center min-w-[50px]"
            >
              <FaSearch className="w-4 h-4" />
            </button>
          </form>
          
          {/* Botón de cerrar adicional para mejor UX */}
          <div className="text-center mt-2">
            <button 
              onClick={handleClose}
              className="text-sm text-gray-500 hover:text-gray-700 transition duration-200"
            >
              Cerrar búsqueda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileSearchButton;