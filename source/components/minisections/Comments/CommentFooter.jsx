import InteractionButtons from './../InteractionButtons';
import { FaComment } from 'react-icons/fa';
import ReportButton from './../../buttons/ReportButton';

function CommentFooter({ 
  isLiked, 
  isDisliked, 
  likeCount, 
  onLike, 
  onDislike, 
  onReply, 
  onReport 
}) {
  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <InteractionButtons
          isLiked={isLiked}
          isDisliked={isDisliked}
          likeCount={likeCount}
          onLike={onLike}
          onDislike={onDislike}
        />

        <div className="flex items-center gap-4">
          {/* Botón Responder */}
          <button
            onClick={onReply}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition duration-200"
          >
            <FaComment className="w-5 h-5" />
            <span className="font-medium">Responder</span>
          </button>

          <ReportButton onReport={onReport} title="Reportar comentario" />
        </div>
      </div>
    </div>
  );
}

export default CommentFooter;