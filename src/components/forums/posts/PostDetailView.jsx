import { useState, useEffect } from 'react';
import { FaArrowLeft, FaSpinner, FaExclamationTriangle, FaUsers } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from './../../../config/firebase';
import { useComments } from './comments/hooks/useComments';
import PostCard from './components/PostCard';
import CommentList from './comments/components/CommentList';
import CreateCommentModal from './comments/modals/CreateCommentModal';
import { usePost } from './hooks/usePost';

function PostDetailView({ post, forumData: initialForumData, onBack, onShowUserProfile, onShowForum }) {
  const { post: postData, loading: postLoading, error: postError } = usePost(post?.id);
  const [authorData, setAuthorData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [forumData, setForumData] = useState(initialForumData || null);
  const [showCreateCommentModal, setShowCreateCommentModal] = useState(false);

  const { comments, loading: commentsLoading, error: commentsError } = useComments(post?.id);
  const user = auth.currentUser;

  // Cargar userData inmediatamente cuando el componente se monta o cambia el usuario
  useEffect(() => {
    loadUserData();
  }, [user]);

  // Cargar autor y foro cuando postData esté disponible
  useEffect(() => {
    if (postData) {
      loadAuthorData();
      
      // Solo cargar forumData si no lo tenemos ya desde las props
      if (!forumData) {
        loadForumData();
      }
    }
  }, [postData]);

  const loadAuthorData = async () => {
    if (postData?.authorId) {
      try {
        const authorDoc = await getDoc(doc(db, 'users', postData.authorId));
        if (authorDoc.exists()) {
          setAuthorData(authorDoc.data());
        }
      } catch (error) {
        console.error('Error cargando datos del autor:', error);
      }
    }
  };

  const loadUserData = async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error cargando userData:', error);
      }
    }
  };

  const loadForumData = async () => {
    try {
      if (postData?.forumId) {
        const forumDoc = await getDoc(doc(db, 'forums', postData.forumId));
        if (forumDoc.exists()) {
          setForumData({ id: forumDoc.id, ...forumDoc.data() });
        }
      }
    } catch (error) {
      console.error('Error cargando datos del foro:', error);
    }
  };

  const handleCommentCreated = () => {
    setShowCreateCommentModal(false);
  };

  const handlePostUpdated = () => {
    // Ya no necesitamos recargar manualmente, usePost se encarga
  };

  const handlePostDeleted = () => {
    if (onBack) {
      onBack();
    }
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando publicación...</p>
        </div>
      </div>
    );
  }

  if (postError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar la publicación</h3>
          <p className="text-gray-600 mb-4">{postError}</p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Publicación no encontrada</h3>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const canComment = userData && ['doctor', 'moderator', 'admin'].includes(userData?.role);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con botón de volver */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-lg transition duration-200"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>

          {/* Mostrar nombre del foro en el header en móviles */}
          {forumData && (
            <div className="lg:hidden">
              <button
                onClick={() => onShowForum && onShowForum(forumData)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition duration-200 text-sm font-medium"
              >
                <FaUsers className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{forumData.name}</span>
              </button>
            </div>
          )}
        </div>

        {/* Post Principal */}
        <div className="mb-8">
          <PostCard
            post={postData}
            onCommentClick={() => {}}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
            onShowUserProfile={onShowUserProfile}
            onShowForum={onShowForum}
            userRole={userData?.role}
            userMembership={{}}
            requiresPostApproval={false}
            showCommentsButton={false}
            forumData={forumData}
          />
        </div>

        {/* Sección de Comentarios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header de Comentarios */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Comentarios ({comments.length})
              </h2>
              
              {canComment && (
                <button
                  onClick={() => setShowCreateCommentModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                >
                  Nuevo Comentario
                </button>
              )}
            </div>

            {!canComment && user && (
              <p className="text-sm text-gray-500 mt-2">
                Solo usuarios verificados pueden comentar
              </p>
            )}

            {!user && (
              <p className="text-sm text-gray-500 mt-2">
                Inicia sesión para comentar
              </p>
            )}
          </div>

          {/* Lista de Comentarios */}
          <div className="p-6">
            <CommentList
              comments={comments}
              loading={commentsLoading}
              error={commentsError}
              postId={postData.id}
              userData={userData}
              onCommentCreated={handleCommentCreated}
              onShowUserProfile={onShowUserProfile}
              forumData={forumData}
            />
          </div>
        </div>
      </div>

      {/* Modal para crear comentario */}
      <CreateCommentModal
        isOpen={showCreateCommentModal}
        onClose={() => setShowCreateCommentModal(false)}
        postId={postData.id}
        postTitle={postData.title}
        onCommentCreated={handleCommentCreated}
      />
    </div>
  );
}

export default PostDetailView;