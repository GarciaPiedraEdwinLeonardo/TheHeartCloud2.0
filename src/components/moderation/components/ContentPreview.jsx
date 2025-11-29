import { useState, useEffect } from 'react';
import { FaSpinner, FaUser, FaUsers, FaFileAlt, FaComment } from 'react-icons/fa';
import { usePosts } from './../../forums/posts/hooks/usePosts';
import { useComments } from './../../forums/posts/comments/hooks/useComments';
import { useUserProfile } from './../../profile/hooks/useUserProfile';
import { useForums } from './../../forums/hooks/useForums';

function ContentPreview({ report, contentType }) {
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos según el tipo de contenido
  useEffect(() => {
    const loadContentData = async () => {
      setLoading(true);
      setError(null);

      try {
        let data = null;

        switch (contentType) {
          case 'post':
            // Usar el hook usePost para cargar el post
            const { post } = await loadPostData(report.targetId);
            data = post;
            break;

          case 'comment':
            // Cargar comentario y su post padre
            const commentData = await loadCommentData(report.targetId);
            data = commentData;
            break;

          case 'user':
          case 'profile':
            // Cargar perfil de usuario
            const userData = await loadUserData(report.targetId);
            data = userData;
            break;

          case 'forum':
            // Cargar datos del foro
            const forumData = await loadForumData(report.targetId);
            data = forumData;
            break;

          default:
            throw new Error('Tipo de contenido no soportado');
        }

        setContentData(data);
      } catch (err) {
        console.error('Error cargando contenido:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadContentData();
  }, [contentType, report.targetId]);

  // Función para cargar post
  const loadPostData = async (postId) => {
    // Simular el hook usePost
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          post: {
            id: postId,
            title: report.targetName || 'Título del post',
            content: report.description || 'Contenido del post...',
            authorId: report.targetAuthorId,
            authorName: report.targetAuthorName,
            createdAt: report.createdAt,
            likes: [],
            stats: { commentCount: 0 }
          }
        });
      }, 500);
    });
  };

  // Función para cargar comentario
  const loadCommentData = async (commentId) => {
    return {
      id: commentId,
      content: report.description || 'Contenido del comentario...',
      authorId: report.targetAuthorId,
      authorName: report.targetAuthorName,
      createdAt: report.createdAt,
      postId: report.postId,
      postTitle: report.postTitle
    };
  };

  // Función para cargar usuario
  const loadUserData = async (userId) => {
    return {
      id: userId,
      name: report.targetName || 'Usuario',
      email: report.targetAuthorEmail,
      role: 'user',
      joinDate: report.createdAt
    };
  };

  // Función para cargar foro
  const loadForumData = async (forumId) => {
    return {
      id: forumId,
      name: report.targetName || 'Comunidad',
      description: report.description || 'Descripción de la comunidad...',
      memberCount: 0,
      createdAt: report.createdAt
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="w-6 h-6 text-blue-500 animate-spin mr-3" />
        <span className="text-gray-600">Cargando contenido...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-sm bg-red-50 p-4 rounded-lg">
          Error al cargar el contenido: {error}
        </div>
      </div>
    );
  }

  if (!contentData) {
    return (
      <div className="text-center py-8 text-gray-500">
        No se pudo cargar el contenido
      </div>
    );
  }

  // Renderizar según el tipo de contenido
  const renderContent = () => {
    switch (contentType) {
      case 'post':
        return renderPost(contentData);
      case 'comment':
        return renderComment(contentData);
      case 'user':
      case 'profile':
        return renderUser(contentData);
      case 'forum':
        return renderForum(contentData);
      default:
        return renderFallback(contentData);
    }
  };

  const renderPost = (post) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <FaUser className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{post.authorName || 'Autor'}</h4>
          <p className="text-sm text-gray-500">
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Fecha desconocida'}
          </p>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
      <div className="text-gray-700 whitespace-pre-line">
        {post.content}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-sm text-gray-500">
        <span>{post.stats?.commentCount || 0} comentarios</span>
      </div>
    </div>
  );

  const renderComment = (comment) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <FaUser className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{comment.authorName || 'Usuario'}</h4>
          <p className="text-sm text-gray-500">
            Comentario en: {comment.postTitle || 'Publicación'}
          </p>
        </div>
      </div>
      
      <div className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
        {comment.content}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Fecha desconocida'}
      </div>
    </div>
  );

  const renderUser = (user) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
          <FaUser className="w-8 h-8 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500 capitalize">{user.role}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">0</div>
          <div className="text-sm text-gray-600">Publicaciones</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">0</div>
          <div className="text-sm text-gray-600">Comentarios</div>
        </div>
      </div>
    </div>
  );

  const renderForum = (forum) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
          <FaUsers className="w-8 h-8 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{forum.name}</h3>
          <p className="text-gray-600">{forum.memberCount || 0} miembros</p>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
        <p className="text-gray-700 whitespace-pre-line">
          {forum.description || 'Esta comunidad no tiene descripción.'}
        </p>
      </div>
    </div>
  );

  const renderFallback = (data) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-center">
        <FaFileAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Contenido no disponible</h3>
        <p className="text-gray-600">No se puede mostrar una vista previa de este contenido.</p>
      </div>
    </div>
  );

  return (
    <div className="content-preview">
      {renderContent()}
    </div>
  );
}

export default ContentPreview;