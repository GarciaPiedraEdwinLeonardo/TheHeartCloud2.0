import { useState, useEffect } from 'react';
import { FaArrowLeft, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from './../../../config/firebase';
import { useComments } from './comments/hooks/useComments';
import PostCard from './components/PostCard';
import CommentList from './comments/components/CommentList';
import CreateCommentModal from './comments/modals/CreateCommentModal';

function PostDetailView({ post, onBack }) {
  const [postData, setPostData] = useState(post);
  const [authorData, setAuthorData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showCreateCommentModal, setShowCreateCommentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { comments, loading: commentsLoading, error: commentsError } = useComments(post?.id);
  const user = auth.currentUser;

  useEffect(() => {
    if (post) {
      loadPostDetails();
      loadUserData();
    }
  }, [post]);

  const loadPostDetails = async () => {
    try {
      setLoading(true);
      
      // Recargar datos del post para asegurar que tenemos la información más reciente
      if (post.id) {
        const postDoc = await getDoc(doc(db, 'posts', post.id));
        if (postDoc.exists()) {
          setPostData({ id: postDoc.id, ...postDoc.data() });
        }
      }

      // Cargar datos del autor
      if (post.authorId) {
        const authorDoc = await getDoc(doc(db, 'users', post.authorId));
        if (authorDoc.exists()) {
          setAuthorData(authorDoc.data());
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error cargando detalles del post:', err);
      setError('Error cargando el post');
      setLoading(false);
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

  const handleCommentCreated = () => {
    setShowCreateCommentModal(false);
    // Los comentarios se actualizarán automáticamente por el hook useComments
  };

  const handlePostUpdated = () => {
    loadPostDetails(); // Recargar datos del post
  };

  const handlePostDeleted = () => {
    if (onBack) {
      onBack(); // Volver si el post fue eliminado
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando publicación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar la publicación</h3>
          <p className="text-gray-600 mb-4">{error}</p>
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
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-lg transition duration-200"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
        </div>

        {/* Post Principal */}
        <div className="mb-8">
          <PostCard
            post={postData}
            onCommentClick={() => {}} // Deshabilitar en esta vista ya que estamos en la vista de comentarios
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
            userRole={userData?.role}
            userMembership={{}} // No necesitamos membresía del foro aquí
            requiresPostApproval={false}
            showCommentsButton={false} // Ocultar botón de comentarios
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