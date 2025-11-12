import { useState } from "react";
import PublicationHeader from './../comments&posts/posts/PublicationHeader';
import PublicationContent from './../comments&posts/posts/PublicationContent';
import PublicationFooter from './../comments&posts/posts/PublicationFooter';

function PublicationCard({ publicacion, onPostClick }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(publicacion.likes);

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

  const handleComment = () => {
    if (onPostClick) {
      onPostClick(publicacion);
    }
  };

  const handleReport = () => {
    console.log('Reportar publicación:', publicacion.id);
  };

  const handlePostClick = () => {
    if (onPostClick) {
      onPostClick(publicacion);
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition duration-200"
      onClick={handlePostClick}
    >
      <PublicationHeader
        tema={publicacion.tema}
        userName="Tú"
        userRole="Autor"
        fecha={publicacion.fecha}
      />
      
      <PublicationContent
        titulo={publicacion.titulo}
        contenido={publicacion.contenido}
      />
      
      <PublicationFooter
        isLiked={isLiked}
        isDisliked={isDisliked}
        likeCount={likeCount}
        commentCount={publicacion.comentarios}
        onLike={handleLike}
        onDislike={handleDislike}
        onComment={handleComment}
        onReport={handleReport}
      />
    </div>
  );
}

export default PublicationCard;