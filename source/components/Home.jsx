import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import Header from './sections/Header';
import Sidebar from './navegation/sidebars/Sidebar';
import SidebarModal from './navegation/sidebars/SidebarModal';
import Main from './screens/Main';
import ProfileView from './profile/ProfileView';
import SearchResults from './navegation/search/screens/SearchingResults';
import ForumView from './forums/screens/ForumView';
import VerifyAccount from './screens/VerifyAccount';
import VerificationRequests from './admin/VerificationRequests';
import PostDetailView from './forums/posts/PostDetailView';

function Home() {
  const [isSidebarModalOpen, setIsSidebarModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('main'); 
  const [previousView, setPreviousView] = useState('main');
  const [searchData, setSearchData] = useState({ query: '', type: 'forums' }); 
  const [currentForum, setCurrentForum] = useState(null);
  const [currentPost, setCurrentPost] = useState(null);
  const [user, setUser] = useState(null); 
  const [userData, setUserData] = useState(null); 
  const [verificationRequest, setVerificationRequest] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null); // Nuevo estado para el perfil seleccionado

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      if (user) {
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

  // Función para cambiar de vista guardando la anterior
  const navigateToView = (newView) => {
    setPreviousView(currentView);
    setCurrentView(newView);
  };

  const handleShowProfile = () => {
    setSelectedUserId(null); // Ver perfil propio
    navigateToView('profile');
  };

  const handleShowMain = () => {
    navigateToView('main');
  };

  const handleSearch = (query, type = 'forums') => { 
    setSearchData({ query, type });
    navigateToView('search');
  };

  const handleShowForum = (forumData) => { 
    setCurrentForum(forumData);
    navigateToView('forum');
  };

  const handleShowPost = (postData) => {
    setCurrentPost(postData);
    navigateToView('post');
  };

  const handleBackFromForum = () => { 
    // Volver a la vista anterior, no siempre al main
    setCurrentView(previousView);
  };

  const handleBackFromPost = () => {
    // Volver a la vista anterior (podría ser profile, forum, search, etc.)
    setCurrentView(previousView);
  };

  const handleVerifyAccount = () => {
    navigateToView('verify');
  };

  const handleVerificationRequests = () => {
    navigateToView('verificationRequests');
  };

  // Función mejorada para mostrar perfil de usuario desde búsqueda
  const handleShowUserProfile = (userData) => {
    console.log('👤 Mostrar perfil de usuario:', userData);
    if (userData && userData.id) {
      setSelectedUserId(userData.id); // Guardar el ID del usuario seleccionado
      navigateToView('profile');
    } else {
      console.error('❌ No se pudo obtener el ID del usuario');
    }
  };

  // Función para volver desde un perfil de usuario
  const handleBackFromProfile = () => {
    if (selectedUserId && selectedUserId !== user?.uid) {
      // Si estábamos viendo el perfil de otro usuario, volver a la búsqueda
      setCurrentView('search');
      setSelectedUserId(null);
    } else {
      // Si era nuestro propio perfil, volver al main
      handleShowMain();
    }
  };

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
          onThemeClick={handleShowForum} 
          userData={userData}
          onVerificationClick={handleVerificationRequests}
        />
        
        {/* Modal del sidebar para móvil */}
        <SidebarModal 
          isOpen={isSidebarModalOpen}
          onClose={() => setIsSidebarModalOpen(false)}
          onInicioClick={() => {
            handleShowMain();
            setIsSidebarModalOpen(false);
          }}
          onThemeClick={handleShowForum} 
          userData={userData}
          onVerificationClick={handleVerificationRequests}
        />
        
        {/* Contenido Principal - Cambia según la vista */}
        <div className="flex-1 min-w-0 flex justify-center">
          <div className="w-full max-w-7xl">
            {currentView === 'main' && <Main/>}
            
            {currentView === 'profile' && (
              <ProfileView 
                userId={selectedUserId} // Pasar el ID del usuario seleccionado
                onShowForum={handleShowForum}
                onShowMain={handleBackFromProfile} // Usar la nueva función de back
                onShowPost={handleShowPost}
              />
            )}
            
            {currentView === 'search' && (
              <SearchResults 
                searchQuery={searchData.query} 
                searchType={searchData.type} 
                onThemeClick={handleShowForum} 
                onShowUserProfile={handleShowUserProfile} // Cambiar a onShowUserProfile
              />
            )}
            
            {currentView === 'forum' && ( 
              <ForumView 
                forumData={currentForum}
                onBack={handleBackFromForum}
                onShowPost={handleShowPost}
                onShowUserProfile={handleShowUserProfile}
              />
            )}
            
            {currentView === 'post' && (
              <PostDetailView 
                post={currentPost}
                onBack={handleBackFromPost}
                onShowUserProfile={handleShowUserProfile}
              />
            )}
            
            {currentView === 'verify' && (
              <VerifyAccount onBack={handleShowMain}/>
            )}
            
            {currentView === 'verificationRequests' && (
              <VerificationRequests/>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;