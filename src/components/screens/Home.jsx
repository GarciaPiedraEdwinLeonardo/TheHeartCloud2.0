import { useState } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';
import SidebarModal from '../modals/SidebarModal';
import Main from './../Main';
import ProfileView from '../ProfileView';
import SearchResults from './../searching/SearchResults';
import ThemeView from './../sections/ThemeView';
import PostDetailView from '../sections/PostDetailView';

function Home() {
  const [isSidebarModalOpen, setIsSidebarModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('main'); // 'main', 'profile', 'search', 'theme', 'post'
  const [searchData, setSearchData] = useState({ query: '', type: 'temas' });
  const [currentTheme, setCurrentTheme] = useState(null);
  const [currentPost, setCurrentPost] = useState(null);

  const handleShowProfile = () => {
    setCurrentView('profile');
  };

  const handleShowMain = () => {
    setCurrentView('main');
  };

  const handleSearch = (query, type = 'temas') => {
    setSearchData({ query, type });
    setCurrentView('search');
  };

  const handleShowTheme = (themeData) => {
    setCurrentTheme(themeData);
    setCurrentView('theme');
  };

  const handleShowPost = (postData) => {
    setCurrentPost(postData);
    setCurrentView('post');
  };

  const handleBackFromTheme = () => {
    setCurrentView('main');
  };

  const handleBackFromPost = () => {
    setCurrentView('main'); 
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onToggleSidebar={() => setIsSidebarModalOpen(true)}
        onProfileClick={handleShowProfile}
        onSearch={handleSearch}
      />
      
      <div className="flex">
        {/* Sidebar normal para desktop */}
        <Sidebar 
          onInicioClick={handleShowMain}
          onThemeClick={handleShowTheme}
        />
        
        {/* Modal del sidebar para móvil */}
        <SidebarModal 
          isOpen={isSidebarModalOpen}
          onClose={() => setIsSidebarModalOpen(false)}
          onInicioClick={() => {
            handleShowMain();
            setIsSidebarModalOpen(false);
          }}
          onThemeClick={handleShowTheme}
        />
        
        {/* Contenido Principal - Cambia según la vista */}
        <div className="flex-1 min-w-0 flex justify-center">
          <div className="w-full max-w-7xl">
            {currentView === 'main' && <Main/>}
            {currentView === 'profile' && <ProfileView />}
            {currentView === 'search' && (
              <SearchResults 
                searchQuery={searchData.query} 
                searchType={searchData.type} 
                onThemeClick={handleShowTheme}
              />
            )}
            {currentView === 'theme' && (
              <ThemeView 
                themeData={currentTheme}
                onBack={handleBackFromTheme}
                onPostClick={handleShowPost}
              />
            )}
            {currentView === 'post' && (
              <PostDetailView 
                post={currentPost}
                onBack={handleBackFromPost}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;