import { FaHeart, FaRegHeart, FaThumbsDown, FaRegThumbsDown } from "react-icons/fa";

function InteractionButtons({ 
  isLiked, 
  isDisliked, 
  likeCount, 
  onLike, 
  onDislike 
}) {
  return (
    <div className="flex items-center gap-4">
      {/* Botón Like */}
      <button
        onClick={onLike}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition duration-200 ${
          isLiked 
            ? 'bg-red-50 text-red-600' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {isLiked ? (
          <FaHeart className="w-5 h-5" />
        ) : (
          <FaRegHeart className="w-5 h-5" />
        )}
        <span className="font-medium">{likeCount}</span>
      </button>

      {/* Botón Dislike */}
      <button
        onClick={onDislike}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition duration-200 ${
          isDisliked 
            ? 'bg-blue-50 text-blue-600' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {isDisliked ? (
          <FaThumbsDown className="w-5 h-5" />
        ) : (
          <FaRegThumbsDown className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

export default InteractionButtons;