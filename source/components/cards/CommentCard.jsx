import { useState } from "react";
import CommentHeader from "./../minisections/Comments/CommentHeader";
import CommentContent from "./../minisections/Comments/CommentContent";
import CommentFooter from "./../minisections/Comments/CommentFooter";

function CommentCard({ comentario }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(comentario.likes);

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
      if (isDisliked) {
        setIsDisliked(false);
      }
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      setIsDisliked(true);
      if (isLiked) {
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      }
    }
  };

  const handleReply = () => {
    console.log('Responder a comentario:', comentario.id);
  };

  const handleReport = () => {
    console.log('Reportar comentario:', comentario.id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <CommentHeader
        tema={comentario.tema}
        publicacionTitulo={comentario.publicacionTitulo}
        usuarioComentarista={comentario.usuarioComentarista}
        usuarioPost={comentario.usuarioPost}
        rolComentarista={comentario.rolComentarista}
        fecha={comentario.fecha}
      />
      
      <CommentContent contenido={comentario.contenido} />
      
      <CommentFooter
        isLiked={isLiked}
        isDisliked={isDisliked}
        likeCount={likeCount}
        onLike={handleLike}
        onDislike={handleDislike}
        onReply={handleReply}
        onReport={handleReport}
      />
    </div>
  );
}

export default CommentCard;