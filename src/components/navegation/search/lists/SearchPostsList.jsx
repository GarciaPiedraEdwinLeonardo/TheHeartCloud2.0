import { FaComments } from 'react-icons/fa';
import PostCard from './../../../forums/posts/components/PostCard';

function SearchPostsList({ posts, searchQuery, onPostClick, onShowUserProfile, onShowForum, queryDisplay }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8">
        <div className="text-gray-400 mb-3 sm:mb-4">
          <FaComments className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
        </div>
        <p className="text-gray-500 text-base sm:text-lg mb-1 sm:mb-2 px-2">
          No se encontraron publicaciones relacionadas con "{queryDisplay || searchQuery}"
        </p>
        <p className="text-gray-400 text-xs sm:text-sm px-2">
          Intenta con otros términos de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onCommentClick={() => onPostClick && onPostClick(post)}
          onPostUpdated={() => {}}
          onPostDeleted={() => {}}
          onShowUserProfile={onShowUserProfile}
          onShowForum={onShowForum}
          userRole={null} 
          userMembership={{}}
          requiresPostApproval={false}
          forumData={post.forumData}
          className="rounded-lg overflow-hidden"
        />
      ))}
    </div>
  );
}

export default SearchPostsList;