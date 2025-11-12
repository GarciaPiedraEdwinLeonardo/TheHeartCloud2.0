import { useState } from 'react';
import { FaReply, FaEllipsisH, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import CommentInput from './../inputs/CommentInput';
import ReportModal from './../modals/ReportModal';

function CommentCard({ comment, onReply, onAction, level = 0 }) {
  const [isReplying, setIsReplying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const isReply = level > 0;

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      onAction(comment.id, 'likes', comment.likes - 1);
    } else {
      setIsLiked(true);
      onAction(comment.id, 'likes', comment.likes + 1);
      if (isDisliked) {
        setIsDisliked(false);
        onAction(comment.id, 'dislikes', comment.dislikes - 1);
      }
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
      onAction(comment.id, 'dislikes', comment.dislikes - 1);
    } else {
      setIsDisliked(true);
      onAction(comment.id, 'dislikes', comment.dislikes + 1);
      if (isLiked) {
        setIsLiked(false);
        onAction(comment.id, 'likes', comment.likes - 1);
      }
    }
  };

  const handleReplySubmit = (contenido) => {
    onReply(comment.id, contenido);
    setIsReplying(false);
  };

  const handleReport = () => {
    setShowReportModal(true);
    setShowOptions(false);
  };

  return (
    <>
      <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
        {/* Header del comentario */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-xs">
                {comment.usuario.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {comment.usuario}
              </h4>
              <p className="text-xs text-gray-500">{comment.especialidad}</p>
            </div>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{comment.fecha}</span>
          </div>

          {/* Menú de opciones */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 hover:bg-gray-100 rounded transition duration-200"
            >
              <FaEllipsisH className="w-4 h-4 text-gray-400" />
            </button>

            {showOptions && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                <button
                  onClick={handleReport}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition duration-200"
                >
                  Reportar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contenido del comentario */}
        <div className="mb-3">
          <p className="text-gray-700 leading-relaxed">
            {comment.contenido}
          </p>
        </div>

        {/* Acciones del comentario */}
        <div className="flex items-center gap-4 text-sm">
          {/* Like/Dislike */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 p-1 rounded transition duration-200 ${
                isLiked 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              <FaThumbsUp className="w-3 h-3" />
              <span>{comment.likes}</span>
            </button>
            
            <button
              onClick={handleDislike}
              className={`flex items-center gap-1 p-1 rounded transition duration-200 ${
                isDisliked 
                  ? 'text-red-600 bg-red-50' 
                  : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
              }`}
            >
              <FaThumbsDown className="w-3 h-3" />
              <span>{comment.dislikes}</span>
            </button>
          </div>

          {/* Responder */}
          {level < 2 && ( // Máximo 2 niveles de anidamiento
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition duration-200 p-1"
            >
              <FaReply className="w-3 h-3" />
              <span>Responder</span>
            </button>
          )}
        </div>

        {/* Input para responder (si está activo) */}
        {isReplying && (
          <div className="mt-4 ml-4">
            <CommentInput
              onSubmit={handleReplySubmit}
              placeholder={`Respondiendo a ${comment.usuario}...`}
              buttonText="Responder"
              autoFocus
            />
          </div>
        )}

        {/* Respuestas */}
        {comment.respuestas && comment.respuestas.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.respuestas.map(reply => (
              <CommentCard
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onAction={onAction}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de reporte */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportType="comentario"
        targetId={comment.id}
        targetName={`Comentario de ${comment.usuario}`}
      />
    </>
  );
}

export default CommentCard;