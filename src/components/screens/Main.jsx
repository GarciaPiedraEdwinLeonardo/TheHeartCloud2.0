import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, orderBy, query } from 'firebase/firestore';
import { auth, db } from './../../config/firebase';
import { FaSpinner, FaExclamationTriangle, FaComments } from 'react-icons/fa';
import PostCard from './../forums/posts/components/PostCard';

function Main({ onShowPost, onShowUserProfile, onShowForum }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        // Cargar userData
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        }

        // Cargar todos los posts ORDENADOS por fecha (más reciente primero)
        const postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc')
        );
        
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = [];
        
        for (const postDoc of postsSnapshot.docs) {
          const post = {
            id: postDoc.id,
            ...postDoc.data()
          };
          
          // Cargar datos del autor
          if (post.authorId) {
            try {
              const authorDoc = await getDoc(doc(db, 'users', post.authorId));
              if (authorDoc.exists()) {
                post.authorData = authorDoc.data();
              }
            } catch (error) {
              console.error('Error cargando autor:', error);
            }
          }
          
          // Cargar datos del foro
          if (post.forumId) {
            try {
              const forumDoc = await getDoc(doc(db, 'forums', post.forumId));
              if (forumDoc.exists()) {
                post.forumData = { id: forumDoc.id, ...forumDoc.data() };
              }
            } catch (error) {
              console.error('Error cargando foro:', error);
            }
          }
          
          postsData.push(post);
        }
        
        setPosts(postsData);
        
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError('Error al cargar las publicaciones');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const handlePostUpdated = () => {
    window.location.reload();
  };

  const handlePostDeleted = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <main className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mr-3" />
            <p className="text-gray-600">Cargando publicaciones...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar publicaciones</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Reintentar
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Publicaciones Recientes</h1>
          <p className="text-gray-600">
            Las publicaciones más recientes de toda la comunidad médica
          </p>
        </div>

        {/* Lista de Posts */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-gray-400 mb-4">
                <FaComments className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay publicaciones</h3>
              <p className="text-gray-600">
                Sé el primero en publicar contenido en la comunidad
              </p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onCommentClick={() => onShowPost && onShowPost(post)}
                onPostUpdated={handlePostUpdated}
                onPostDeleted={handlePostDeleted}
                onShowUserProfile={onShowUserProfile}
                onShowForum={onShowForum}
                userRole={userData?.role}
                userMembership={{}}
                requiresPostApproval={false}
                forumData={post.forumData}
              />
            ))
          )}
        </div>

      </div>
    </main>
  );
}

export default Main;