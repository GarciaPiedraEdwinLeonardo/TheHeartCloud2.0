import { FaSearch } from 'react-icons/fa';
import { useState } from 'react';

function DesktopSearch({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const MAX_CHARS = 100; // Límite de caracteres

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Solo permitir escribir hasta el límite
    if (value.length <= MAX_CHARS) {
      setSearchQuery(value);
    }
    // Si excede el límite, simplemente no actualizar el estado
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    const trimmedQuery = searchQuery.trim();
    
    // Solo buscar si hay texto válido
    if (trimmedQuery && trimmedQuery.length <= MAX_CHARS) {
      onSearch(trimmedQuery, 'posts');
    }
  };

  return (
    <div className="hidden lg:flex flex-1 max-w-lg mx-4">
      <form onSubmit={handleSearch} className="flex w-full">
        <input 
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Buscar publicaciones, comunidades y usuarios..."
          className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          maxLength={MAX_CHARS}
        />
        <button 
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center min-w-[45px] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!searchQuery.trim()}
        >
          <FaSearch className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default DesktopSearch;