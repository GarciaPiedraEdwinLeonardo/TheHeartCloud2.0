import { useState } from 'react';
import { FaSpinner, FaExclamationTriangle, FaCommentSlash, FaChevronDown, FaChevronRight, FaReply } from 'react-icons/fa';
import CommentCard from './CommentCard';

function CommentList({ comments, loading, error, postId, userData, onCommentCreated, onShowUserProfile, forumData }) {
  const [expandedThreads, setExpandedThreads] = useState(new Set());
  const [showAllReplies, setShowAllReplies] = useState(new Set());

  // Función para organizar comentarios en hilos
  const organizeComments = (comments) => {
    const commentMap = new Map();
    const rootComments = [];

    comments.forEach(comment => {
      commentMap.set(comment.id, { 
        ...comment, 
        replies: [],
        replyCount: 0,
        depth: 0 // Agregar profundidad
      });
    });

    comments.forEach(comment => {
      const commentNode = commentMap.get(comment.id);
      
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          parent.replies.push(commentNode);
          parent.replyCount = (parent.replyCount || 0) + 1;
          // Calcular profundidad recursivamente
          commentNode.depth = parent.depth + 1;
        }
      } else {
        rootComments.push(commentNode);
      }
    });

    return rootComments;
  };

  const organizedComments = organizeComments(comments);

  // Función para toggle de hilos (recursiva)
  const toggleThread = (commentId) => {
    setExpandedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
        collapseAllChildThreads(commentId, newSet);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // Función para colapsar todos los hilos hijos (opcional)
  const collapseAllChildThreads = (commentId, set) => {
    const comment = organizedComments.find(c => c.id === commentId) || 
                   organizedComments.flatMap(c => c.replies).find(r => r.id === commentId);
    if (comment && comment.replies) {
      comment.replies.forEach(reply => {
        set.delete(reply.id);
        collapseAllChildThreads(reply.id, set);
      });
    }
  };

  const toggleShowAllReplies = (commentId) => {
    setShowAllReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

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

  // Función recursiva mejorada para renderizar hilos anidados
  const renderCommentWithReplies = (comment, depth = 0, parentExpanded = true) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isThreadExpanded = expandedThreads.has(comment.id);
    const showAll = showAllReplies.has(comment.id);
    
    // Solo renderizar si el padre está expandido
    if (depth > 0 && !parentExpanded) {
      return null;
    }

    // Calcular margen izquierdo basado en la profundidad (máximo 4 niveles)
    const maxDepth = 4;
    const effectiveDepth = Math.min(depth, maxDepth);
    const marginLeft = effectiveDepth * 1.5; // rem

    // Para respuestas anidadas, mostrar máximo 2 inicialmente
    const visibleReplies = showAll ? comment.replies : comment.replies.slice(0, 2);
    const hasHiddenReplies = comment.replies.length > 2 && !showAll;

    return (
      <div key={comment.id} className={`${depth > 0 ? `ml-${marginLeft * 4} border-l-2 border-gray-200 pl-4` : ''}`}>
        {/* Comentario principal */}
        <CommentCard
          comment={comment}
          postId={postId}
          userData={userData}
          onCommentCreated={onCommentCreated}
          onShowUserProfile={onShowUserProfile}
          isReply={depth > 0}
          forumData={forumData}
        />
        
        {/* Controles de hilo - mostrar para cualquier comentario con respuestas */}
        {hasReplies && (
          <div className="mt-3 ml-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleThread(comment.id)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-1 rounded-lg transition duration-200"
              >
                {isThreadExpanded ? (
                  <FaChevronDown className="w-3 h-3" />
                ) : (
                  <FaChevronRight className="w-3 h-3" />
                )}
                <span>
                  {isThreadExpanded ? 'Ocultar' : 'Ver'} {comment.replyCount} respuesta{comment.replyCount !== 1 ? 's' : ''}
                </span>
              </button>

              {/* Indicador visual de que es un hilo anidado */}
              {depth > 0 && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FaReply className="w-3 h-3 rotate-180" />
                  Hilo anidado
                </span>
              )}
            </div>
          </div>
        )}

        {/* Renderizar respuestas VISIBLES si el hilo está expandido */}
        {hasReplies && isThreadExpanded && (
          <div className="mt-4 space-y-4">
            {visibleReplies.map(reply => 
              renderCommentWithReplies(reply, depth + 1, isThreadExpanded)
            )}
            
            {/* Botón para mostrar más respuestas si hay más de 2 */}
            {hasHiddenReplies && (
              <div className={`ml-${(marginLeft + 1) * 4}`}>
                <button
                  onClick={() => toggleShowAllReplies(comment.id)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition duration-200"
                >
                  <FaChevronDown className="w-3 h-3" />
                  <span>Ver {comment.replies.length - 2} respuestas más</span>
                </button>
              </div>
            )}

            {/* Botón para mostrar menos si estamos mostrando todas */}
            {showAll && comment.replies.length > 2 && (
              <div className={`ml-${(marginLeft + 1) * 4}`}>
                <button
                  onClick={() => toggleShowAllReplies(comment.id)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition duration-200"
                >
                  <FaChevronRight className="w-3 h-3" />
                  <span>Mostrar menos</span>
                </button>
              </div>
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