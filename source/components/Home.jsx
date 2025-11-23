import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import Header from './sections/Header';
import Sidebar from './navegation/sidebars/Sidebar';
import SidebarModal from './navegation/sidebars/SidebarModal';
import Main from './screens/Main';
import ProfileView from './screens/ProfileView';
import SearchResults from './navegation/search/screens/SearchingResults';
import ForumView from './forums/screens/ForumView';
import VerifyAccount from './screens/VerifyAccount';
import VerificationRequests from './admin/VerificationRequests';
import PostDetailView from './forums/posts/PostDetailView';

function Home() {
  const [isSidebarModalOpen, setIsSidebarModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('main'); 
  const [searchData, setSearchData] = useState({ query: '', type: 'forums' }); 
  const [currentForum, setCurrentForum] = useState(null);
  const [currentPost, setCurrentPost] = useState(null);
  const [user, setUser] = useState(null); 
  const [userData, setUserData] = useState(null); 
  const [verificationRequest, setVerificationRequest] = useState(null);

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

  const handleShowProfile = () => {
    setCurrentView('profile');
  };

  const handleShowMain = () => {
    setCurrentView('main');
  };

  const handleSearch = (query, type = 'forums') => { 
    setSearchData({ query, type });
    setCurrentView('search');
  };

  const handleShowForum = (forumData) => { 
    setCurrentForum(forumData);
    setCurrentView('forum');
  };

  const handleShowPost = (postData) => {
    setCurrentPost(postData);
    setCurrentView('post');
  };

  const handleBackFromForum = () => { 
    setCurrentView('main');
  };

  const handleBackFromPost = () => {
    setCurrentView('forum'); 
  };

  const handleVerifyAccount = () =>{
    setCurrentView('verify');
  }

  const handleVerificationRequests = () => {
    setCurrentView('verificationRequests');
  }

  const handleShowUserProfile = (userData) => {
  // Por ahora redirigimos al perfil propio, pero preparado para perfiles de otros usuarios
  setCurrentView('profile');
  // Aquí podrías setear currentUserProfile cuando implementes ver perfiles de otros
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
            {currentView === 'profile' && <ProfileView />}
            {currentView === 'search' && (
              <SearchResults 
                searchQuery={searchData.query} 
                searchType={searchData.type} 
                onThemeClick={handleShowForum} 
                onUserClick={handleShowUserProfile}
              />
            )}
            {currentView === 'forum' && ( 
              <ForumView 
                forumData={currentForum}
                onBack={handleBackFromForum}
                onShowPost={handleShowPost}
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