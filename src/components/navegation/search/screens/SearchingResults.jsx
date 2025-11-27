import { useState } from 'react';
import { useSearch } from './../hooks/useSearch';
import SearchForumsList from './../lists/SearchForumsList';
import SearchUsersList from './../lists/SearchUsersList';

function SearchResults({ 
  searchQuery, 
  searchType = 'forums', 
  onThemeClick, 
  onUserClick,
  onShowUserProfile  
}) {
  const [activeTab, setActiveTab] = useState(searchType);
  const { results, loading, error } = useSearch(searchQuery);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleForumClick = (forum) => {
    if (onThemeClick) {
      onThemeClick(forum);
    }
  };

  const handleUserClick = (user) => {
  
  if (onShowUserProfile) {
    if (user && user.id) {
      onShowUserProfile(user);
    } else {
      console.error('El objeto usuario no tiene ID:', user);
    }
  }
};

  // Obtener resultados del tipo activo (cambio instantáneo)
  const activeResults = activeTab === 'forums' ? results.forums : results.users;
  const resultsCount = activeResults.length;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header de búsqueda */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Resultados de búsqueda: "{searchQuery}"
          </h1>
          <p className="text-gray-600">
            {loading 
              ? 'Buscando...' 
              : activeTab === 'forums' 
                ? `Encontramos ${resultsCount} comunidades relacionadas` 
                : `Encontramos ${resultsCount} usuarios relacionados`
            }
          </p>
        </div>

        {/* Navegación por pestañas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => handleTabChange('forums')}
              className={`flex-1 py-4 px-6 text-center font-medium transition duration-200 ${
                activeTab === 'forums'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Comunidades ({loading ? '...' : results.forums.length})
            </button>
            <button
              onClick={() => handleTabChange('users')}
              className={`flex-1 py-4 px-6 text-center font-medium transition duration-200 ${
                activeTab === 'users'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Usuarios ({loading ? '...' : results.users.length})
            </button>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : activeTab === 'forums' ? (
              <SearchForumsList 
                forums={activeResults} 
                searchQuery={searchQuery} 
                onForumClick={handleForumClick}
              />
            ) : (
              <SearchUsersList 
                users={activeResults} 
                searchQuery={searchQuery} 
                onUserClick={handleUserClick}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default SearchResults;