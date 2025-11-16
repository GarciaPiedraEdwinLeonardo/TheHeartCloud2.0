import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import Header from './sections/Header';
import Sidebar from './navegation/sidebars/Sidebar';
import SidebarModal from './navegation/sidebars/SidebarModal';
import Main from './screens/Main';
import ProfileView from './screens/ProfileView';
import SearchResults from './screens/SearchingResults';
import ThemeView from './screens/ThemeView';
import VerifyAccount from './screens/VerifyAccount';

function Home() {
  const [isSidebarModalOpen, setIsSidebarModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('main'); // 'main', 'profile', 'search', 'theme', 'post'
  const [searchData, setSearchData] = useState({ query: '', type: 'temas' });
  const [currentTheme, setCurrentTheme] = useState(null);
  const [currentPost, setCurrentPost] = useState(null);
  const [user, setUser] = useState(null); 
  const [userData, setUserData] = useState(null); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      if (user) {
        // Escuchar cambios en los datos del usuario
        const userDocUnsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
          if (doc.exists()) {
            setUserData(doc.data());
          }
        });
        
        return () => userDocUnsubscribe();
      } else {
        setUserData(null);
      }
    });
    
    return unsubscribe;
  }, []);

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

  const handleVerifyAccount = () =>{
    setCurrentView('verify');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onToggleSidebar={() => setIsSidebarModalOpen(true)}
        onProfileClick={handleShowProfile}
        onSearch={handleSearch}
        onVerifyAccount={handleVerifyAccount}
      />
      
      <div className="flex">
        {/* Sidebar normal para desktop */}
        <Sidebar 
          onInicioClick={handleShowMain}
          onThemeClick={handleShowTheme}
          userData={userData}
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
          userData={userData}
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
            {currentView === 'verify' &&(
              <VerifyAccount onBack={handleShowMain}/>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;