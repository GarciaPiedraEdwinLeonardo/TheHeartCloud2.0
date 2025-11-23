import { FaSpinner, FaExclamationTriangle, FaCommentSlash } from 'react-icons/fa';
import CommentCard from './CommentCard';

function CommentList({ comments, loading, error, postId, userData, onCommentCreated, forumData }) {
  // Función para organizar comentarios en hilos
  const organizeComments = (comments) => {
    const commentMap = new Map();
    const rootComments = [];

    // Primero, mapear todos los comentarios
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Luego, organizar en árbol
    comments.forEach(comment => {
      const commentNode = commentMap.get(comment.id);
      
      if (comment.parentCommentId) {
        // Es una respuesta, agregar al comentario padre
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          parent.replies.push(commentNode);
        }
      } else {
        // Es un comentario raíz
        rootComments.push(commentNode);
      }
    });

    return rootComments;
  };

  const organizedComments = organizeComments(comments);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando comentarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <FaExclamationTriangle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar comentarios</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (organizedComments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <FaCommentSlash className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay comentarios aún</h3>
        <p className="text-gray-600">Sé el primero en comentar esta publicación</p>
      </div>
    );
  }

  // Función recursiva para renderizar comentarios y sus respuestas
  const renderCommentWithReplies = (comment, depth = 0) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    
    return (
      <div key={comment.id} className={depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}>
        <CommentCard
          comment={comment}
          postId={postId}
          userData={userData}
          onCommentCreated={onCommentCreated}
          isReply={depth > 0}
          forumData={forumData}
        />
        
        {/* Renderizar respuestas */}
        {hasReplies && (
          <div className="mt-4 space-y-4">
            {comment.replies.map(reply => 
              renderCommentWithReplies(reply, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {organizedComments.map(comment => 
        renderCommentWithReplies(comment)
      )}
    </div>
  );
}

export default CommentList;