import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
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
import SetPasswordAfterGoogle from './register/SetPasswordAfterGoogle';
import ProtectedRoute from './routing/ProtectedRoute';

function Home() {
  const [isSidebarModalOpen, setIsSidebarModalOpen] = useState(false);
  const [user, setUser] = useState(null); 
  const [userData, setUserData] = useState(null); 
  const [showSuspendedScreen, setShowSuspendedScreen] = useState(false); 
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
  
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        const userDocUnsubscribe = onSnapshot(doc(db, 'users', user.uid), async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setUserData(userData);
            
            // VERIFICAR SI EL USUARIO NECESITA ESTABLECER CONTRASEÑA
            const providerData = user.providerData || [];
            const isGoogleUser = providerData.some(provider => provider.providerId === 'google.com');
            
            if (isGoogleUser && !userData.hasPassword) {
              setNeedsPasswordSetup(true);
              return;
            }
            
            if (userData.suspension?.isSuspended && userData.suspension.endDate) {
              const endDate = userData.suspension.endDate.toDate();
              const now = new Date();
              
              if (now >= endDate) {
                console.log("Suspensión expirada limpiando automáticamente");
                
                try {
                  await updateDoc(doc(db, 'users', user.uid), {
                    "suspension.isSuspended": false,
                    "suspension.reason": null,
                    "suspension.startDate": null,
                    "suspension.endDate": null,
                    "suspension.suspendedBy": null,
                    "suspension.autoRemovedAt": serverTimestamp(),
                  });
                  
                  console.log("Suspensión limpiada exitosamente");
                  
                  const updatedDoc = await getDoc(doc(db, 'users', user.uid));
                  if (updatedDoc.exists()) {
                    setUserData(updatedDoc.data());
                  }
                } catch (error) {
                  console.error("Error limpiando suspensión:", error);
                }
              }
            }
            
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

  const handlePasswordSetupComplete = () => {
    setNeedsPasswordSetup(false);
  };

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
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Funciones de navegación usando navigate()
  const handleShowProfile = (userIdOrData = null) => {
    // Si recibimos un objeto con id, extraer solo el id
    const userId = userIdOrData?.id || userIdOrData;
    
    if (userId && userId !== currentUser?.uid) {
      // Perfil de otro usuario
      navigate(`/profile/${userId}`);
    } else {
      // Perfil propio
      navigate('/profile');
    }
  };

  const handleShowMain = () => {
    navigate('/home');
  };

  const handleSearch = (query, type = 'forums') => {
    navigate(`/search?q=${encodeURIComponent(query)}&type=${type}`);
  };

  const handleShowForum = (forumData) => {
    navigate(`/forum/${forumData.id}`, { state: { forumData } });
  };

  const handleShowPost = (postData) => {
    // Serializar las fechas antes de pasar por el state
    const serializedPost = {
      ...postData,
      createdAt: postData.createdAt?.toDate?.() || postData.createdAt,
      updatedAt: postData.updatedAt?.toDate?.() || postData.updatedAt
    };
    navigate(`/post/${postData.id}`, { state: { postData: serializedPost } });
  };

  const handleVerifyAccount = () => {
    navigate('/verify');
  };

  const handleVerificationRequests = () => {
    navigate('/admin/verifications');
  };

  const handleShowReports = () => {
    navigate('/moderation');
  };

  // Verificar permisos de moderación
  const canAccessModeration = () => {
    return userData && ['moderator', 'admin'].includes(userData.role);
  };

  const canAccessAdmin = () => {
    return userData && userData.role === 'admin';
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
        onProfileClick={() => handleShowProfile()}
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
        
        {/* Contenido Principal - Rutas */}
        <div className="flex-1 min-w-0">
          <div className="w-full max-w-2xl lg:max-w-4xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              {/* Ruta principal - Feed */}
              <Route 
                path="/home" 
                element={
                  <Main 
                    onShowPost={handleShowPost}
                    onShowUserProfile={handleShowProfile}
                    onShowForum={handleShowForum}
                  />
                } 
              />
              
              {/* Perfil propio */}
              <Route 
                path="/profile" 
                element={
                  <ProfileView 
                    userId={null}
                    onShowForum={handleShowForum}
                    onShowMain={handleShowMain}
                    onShowPost={handleShowPost}
                  />
                } 
              />
              
              {/* Perfil de otro usuario */}
              <Route 
                path="/profile/:userId" 
                element={
                  <ProfileView 
                    onShowForum={handleShowForum}
                    onShowMain={handleShowMain}
                    onShowPost={handleShowPost}
                  />
                } 
              />
              
              {/* Búsqueda */}
              <Route 
                path="/search" 
                element={
                  <SearchResults 
                    onThemeClick={handleShowForum} 
                    onShowUserProfile={handleShowProfile}
                    onPostClick={handleShowPost}
                  />
                } 
              />
              
              {/* Vista de foro */}
              <Route 
                path="/forum/:forumId" 
                element={
                  <ForumView 
                    onBack={() => navigate(-1)}
                    onShowPost={handleShowPost}
                    onShowUserProfile={handleShowProfile}
                  />
                } 
              />
              
              {/* Vista de post */}
              <Route 
                path="/post/:postId" 
                element={
                  <PostDetailView 
                    onBack={() => navigate(-1)}
                    onShowUserProfile={handleShowProfile}
                    onShowForum={handleShowForum}
                  />
                } 
              />
              
              {/* Verificar cuenta */}
              <Route 
                path="/verify" 
                element={
                  <VerifyAccount 
                    onBack={handleShowMain}
                  />
                } 
              />
              
              {/* Solicitudes de verificación - Solo Admin */}
              <Route 
                path="/admin/verifications" 
                element={
                  <ProtectedRoute allowedRoles={['admin']} userData={userData}>
                    <VerificationRequests />
                  </ProtectedRoute>
                } 
              />

              {/* Panel de moderación - Admin y Moderadores */}
              <Route 
                path="/moderation" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'moderator']} userData={userData}>
                    <ModerationDashboard
                      onShowUserProfile={handleShowProfile}
                      onShowForum={handleShowForum}
                    />
                  </ProtectedRoute>
                } 
              />

              {/* Ruta por defecto - Redirigir a /home */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;