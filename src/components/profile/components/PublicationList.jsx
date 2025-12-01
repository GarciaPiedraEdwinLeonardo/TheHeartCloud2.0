import PostCard from './../../forums/posts/components/PostCard';

function PublicationsList({ publicaciones, onCommentClick, onShowForum }) {
  // Transformar los datos para que sean compatibles con PostCard
  const transformPostData = (publicacion) => {
    return {
      id: publicacion.id,
      title: publicacion.title || publicacion.titulo,
      content: publicacion.content || publicacion.contenido,
      authorId: publicacion.authorId,
      authorName: publicacion.authorName || 'Tú',
      authorRole: publicacion.authorRole,
      forumId: publicacion.forumId,
      forumName: publicacion.tema,
      createdAt: publicacion.fecha || publicacion.createdAt,
      likes: publicacion.likes || [],
      stats: publicacion.stats || {
        commentCount: publicacion.commentCount || 0,
        likeCount: publicacion.likeCount || 0,
        viewCount: publicacion.viewCount || 0
      },
      images: publicacion.images || [],
      status: publicacion.status || 'active'
    };
  };

  const handleCommentClick = (post) => {
    if (onCommentClick) {
      onCommentClick(post);
    }
  };

  return (
    <div className="space-y-4">
      {publicaciones.map((publicacion) => (
        <PostCard
          key={publicacion.id}
          post={transformPostData(publicacion)}
          showForumInfo={true}
          showActions={true}
          isProfileView={true}
          onCommentClick={() => handleCommentClick(transformPostData(publicacion))}
          onShowForum={onShowForum}
        />
      ))}

      {publicaciones.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="text-gray-300 mb-4">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Aún no has creado publicaciones
          </h3>
          <p className="text-gray-600 max-w-md mx-auto text-lg">
            Cuando crees publicaciones en las comunidades, aparecerán aquí.
          </p>
        </div>
      )}
    </div>
  );
}

export default PublicationsList;