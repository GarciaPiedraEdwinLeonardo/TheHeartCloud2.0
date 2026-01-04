import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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
import ModerationDashboard from './moderation/ModerationDashboard';
import SuspendedScreen from './modals/SuspendedScreen';
import SetPasswordAfterGoogle from './register/SetPasswordAfterGoogle'; // Importar nuevo componente

function Home() {
  const [isSidebarModalOpen, setIsSidebarModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('main'); 
  const [previousView, setPreviousView] = useState('main');
  const [searchData, setSearchData] = useState({ query: '', type: 'forums' }); 
  const [currentForum, setCurrentForum] = useState(null);
  const [currentPost, setCurrentPost] = useState(null);
  const [user, setUser] = useState(null); 
  const [userData, setUserData] = useState(null); 
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showSuspendedScreen, setShowSuspendedScreen] = useState(false); 
  const [currentForumFromPost, setCurrentForumFromPost] = useState(null);
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false); // Nuevo estado

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        const userDocUnsubscribe = onSnapshot(doc(db, 'users', user.uid), async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setUserData(userData);
            
            // VERIFICAR SI EL USUARIO NECESITA ESTABLECER CONTRASEÑA
            // Usuarios que se registraron con Google y no tienen contraseña establecida
            const providerData = user.providerData || [];
            const isGoogleUser = providerData.some(provider => provider.providerId === 'google.com');
            
            if (isGoogleUser && !userData.hasPassword) {
              setNeedsPasswordSetup(true);
              return; // No continuar con la lógica normal
            }
            
            if (userData.suspension?.isSuspended && userData.suspension.endDate) {
              const endDate = userData.suspension.endDate.toDate();
              const now = new Date();
              
              // Verificar si la suspensión expiró
              if (now >= endDate) {
                console.log("Suspensión expirada limpiando automáticamente");
                
                try {
                  // Limpiar suspensión
                  await updateDoc(doc(db, 'users', user.uid), {
                    "suspension.isSuspended": false,
                    "suspension.reason": null,
                    "suspension.startDate": null,
                    "suspension.endDate": null,
                    "suspension.suspendedBy": null,
                    "suspension.autoRemovedAt": serverTimestamp(),
                  });
                  
                  console.log("Suspensión limpiada exitosamente");
                  
                  // Forzar recarga de datos
                  const updatedDoc = await getDoc(doc(db, 'users', user.uid));
                  if (updatedDoc.exists()) {
                    setUserData(updatedDoc.data());
                  }
                } catch (error) {
                  console.error("Error limpiando suspensión:", error);
                }
              }
            }
            
            // Verificar suspensión normal
            if (userData && userData.suspension?.isSuspended) {
              setShowSuspendedScreen(true);
            } else {
              setShowSuspendedScreen(false);
            }
          }
        });
        return () => userDocUnsubscribe();
      } else {
        setUserData(null);
        setNeedsPasswordSetup(false);
      }
    });
    return unsubscribe;
  }, []);

  // Función para cuando se completa la configuración de contraseña
  const handlePasswordSetupComplete = () => {
    setNeedsPasswordSetup(false);
  };

  // Si el usuario necesita establecer contraseña, mostrar pantalla de configuración
  if (needsPasswordSetup && user) {
    return (
      <SetPasswordAfterGoogle 
        user={user}
        onComplete={handlePasswordSetupComplete}
      />
    );
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

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
    setCurrentForumFromPost(postData.forumData || null);
    navigateToView('post');
  };

  const handleShowReports = () => {
    navigateToView('reports');
  };

  const handleVerifyAccount = () => {
    navigateToView('verify');
  };

  const handleVerificationRequests = () => {
    navigateToView('verificationRequests');
  };

  // Función mejorada para mostrar perfil de usuario desde búsqueda
  const handleShowUserProfile = (userData) => {
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
      // Si estábamos viendo el perfil de otro usuario, volver a la vista anterior
      setCurrentView(previousView);
      setSelectedUserId(null);
    } else {
      // Si era nuestro propio perfil, volver al main
      handleShowMain();
    }
  };

  // Función para volver desde foro
  const handleBackFromForum = () => { 
    // Volver a la vista anterior, no siempre al main
    setCurrentView(previousView);
  };

  // Función para volver desde post
  const handleBackFromPost = () => {
    // Volver a la vista anterior (podría ser profile, forum, search, etc.)
    setCurrentView(previousView);
  };

  // Verificar si el usuario tiene permisos de moderación
  const canAccessModeration = () => {
    return userData && ['moderator', 'admin'].includes(userData.role);
  };

  if (showSuspendedScreen && userData) {
    return (
      <SuspendedScreen 
        userData={userData} 
        onLogout={handleLogout}
      />
    );
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
          onThemeClick={handleShowForum} 
          userData={userData}
          onVerificationClick={handleVerificationRequests}
          onReportsClick={canAccessModeration() ? handleShowReports : null}
          showReportsButton={canAccessModeration()}
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
          onReportsClick={canAccessModeration() ? () => {
            handleShowReports();
            setIsSidebarModalOpen(false);
          } : null}
          showReportsButton={canAccessModeration()}
        />
        
        {/* Contenido Principal - Cambia según la vista */}
        <div className="flex-1 min-w-0">
          <div className="w-full max-w-2xl lg:max-w-4xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {currentView === 'main' && (
              <Main 
                onShowPost={handleShowPost}
                onShowUserProfile={handleShowUserProfile}
                onShowForum={handleShowForum}
              />
            )}
            
            {currentView === 'profile' && (
              <ProfileView 
                userId={selectedUserId}
                onShowForum={handleShowForum}
                onShowMain={handleBackFromProfile}
                onShowPost={handleShowPost}
              />
            )}
            
            {currentView === 'search' && (
              <SearchResults 
                searchQuery={searchData.query} 
                searchType={searchData.type} 
                onThemeClick={handleShowForum} 
                onShowUserProfile={handleShowUserProfile}
                onPostClick={handleShowPost}
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
                forumData = {currentForumFromPost}
                onBack={handleBackFromPost}
                onShowUserProfile={handleShowUserProfile}
                onShowForum = {handleShowForum}
              />
            )}
            
            {currentView === 'verify' && (
              <VerifyAccount onBack={handleShowMain}/>
            )}
            
            {currentView === 'verificationRequests' && (
              <VerificationRequests/>
            )}

            {currentView === 'reports' && (
              <ModerationDashboard
                onShowUserProfile={handleShowUserProfile}
                onShowForum={handleShowForum}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;