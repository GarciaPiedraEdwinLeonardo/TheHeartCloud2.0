import { FaComments } from 'react-icons/fa';
import PostCard from './../../../forums/posts/components/PostCard';

function SearchPostsList({ posts, searchQuery, onPostClick, onShowUserProfile }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <FaComments className="w-16 h-16 mx-auto" />
        </div>
        <p className="text-gray-500 text-lg mb-2">
          No se encontraron publicaciones relacionadas con "{searchQuery}"
        </p>
        <p className="text-gray-400 text-sm">
          Intenta con otros términos de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onCommentClick={() => onPostClick && onPostClick(post)}
          onPostUpdated={() => {}}
          onPostDeleted={() => {}}
          onShowUserProfile={onShowUserProfile}
          userRole={null} // No necesitamos rol del usuario para búsqueda
          userMembership={{}}
          requiresPostApproval={false}
          forumData={post.forumData}
        />
      ))}
    </div>
  );
}

export default SearchPostsList;