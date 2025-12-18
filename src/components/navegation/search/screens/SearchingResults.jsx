import { useState } from 'react';
import { useSearch } from './../hooks/useSearch';
import SearchForumsList from './../lists/SearchForumsList';
import SearchUsersList from './../lists/SearchUsersList';
import SearchPostsList from './../lists/SearchPostsList';

function SearchResults({ 
  searchQuery, 
  searchType = 'posts', 
  onThemeClick, 
  onUserClick,
  onShowUserProfile,
  onPostClick, 
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
      }
    }
  };

  const handlePostClick = (post) => {
    if (onPostClick) {
      onPostClick(post);
    }
  };

  // Filtrar posts activos
  const activePosts = results.posts.filter(post => post.status === 'active');

  // Obtener resultados del tipo activo
  const activeResults = 
    activeTab === 'forums' ? results.forums : 
    activeTab === 'users' ? results.users : 
    activePosts;
  
  const resultsCount = activeResults.length;

  // Función para truncar texto largo
  const truncateLongText = (text, maxLength = 60) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Texto truncado para el título
  const truncatedQuery = truncateLongText(searchQuery, 60);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6">
      <div className="max-w-full px-3 sm:px-4 md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto sm:px-6 lg:px-8">
        
        {/* Header de búsqueda */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words px-1 sm:px-0">
            Resultados de búsqueda: "{truncatedQuery}"
          </h1>
          <p className="text-gray-600 text-sm sm:text-base px-1 sm:px-0">
            {loading 
              ? 'Buscando...' 
              : activeTab === 'forums' 
                ? `Encontramos ${resultsCount} comunidades relacionadas` 
                : activeTab === 'users'
                  ? `Encontramos ${resultsCount} usuarios relacionados`
                  : `Encontramos ${resultsCount} publicaciones relacionadas`
            }
          </p>
        </div>

        {/* Navegación por pestañas*/}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6 w-full overflow-hidden">
          {/* Versión móvil - Botones apilados verticalmente */}
          <div className="md:hidden flex flex-col border-b border-gray-200">
            <button
              onClick={() => handleTabChange('posts')}
              className={`flex items-center justify-between py-3 px-4 text-center font-medium transition duration-200 text-sm ${
                activeTab === 'posts'
                  ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Publicaciones</span>
              <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {loading ? '...' : activePosts.length}
              </span>
            </button>
            <button
              onClick={() => handleTabChange('forums')}
              className={`flex items-center justify-between py-3 px-4 text-center font-medium transition duration-200 text-sm ${
                activeTab === 'forums'
                  ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Comunidades</span>
              <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {loading ? '...' : results.forums.length}
              </span>
            </button>
            <button
              onClick={() => handleTabChange('users')}
              className={`flex items-center justify-between py-3 px-4 text-center font-medium transition duration-200 text-sm ${
                activeTab === 'users'
                  ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Usuarios</span>
              <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {loading ? '...' : results.users.length}
              </span>
            </button>
          </div>

          {/* Versión desktop - Botones horizontales */}
          <div className="hidden md:flex border-b border-gray-200">
            <button
              onClick={() => handleTabChange('posts')}
              className={`flex-1 py-4 px-6 text-center font-medium transition duration-200 ${
                activeTab === 'posts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Publicaciones ({loading ? '...' : activePosts.length})
            </button>
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
          <div className="p-3 sm:p-4 md:p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : activeTab === 'forums' ? (
              <SearchForumsList 
                forums={activeResults} 
                searchQuery={searchQuery} 
                onForumClick={handleForumClick}
                queryDisplay={truncatedQuery}
              />
            ) : activeTab === 'users' ? (
              <SearchUsersList 
                users={activeResults} 
                searchQuery={searchQuery} 
                onUserClick={handleUserClick}
                queryDisplay={truncatedQuery}
              />
            ) : (
              <SearchPostsList 
                posts={activeResults} 
                searchQuery={searchQuery} 
                onPostClick={handlePostClick}
                onShowUserProfile={onShowUserProfile}
                onShowForum={onThemeClick}
                queryDisplay={truncatedQuery}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default SearchResults;