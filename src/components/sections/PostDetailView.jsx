import { useState } from 'react';
import { FaArrowLeft, FaComment, FaShare } from 'react-icons/fa';
import PublicationCard from './../cards/PublicationCard';
import CommentCard from './CommentCard';
import CommentInput from './../inputs/CommentInput';

function PostDetailView({ post, onBack }) {
  const [comments, setComments] = useState([
    {
      id: 1,
      usuario: 'Dra. María González',
      especialidad: 'Endocrinóloga',
      contenido: 'Excelente punto sobre los nuevos medicamentos. ¿Has considerado los efectos a largo plazo en pacientes con comorbilidades?',
      fecha: '2024-02-20 14:30',
      likes: 8,
      dislikes: 1,
      respuestas: [
        {
          id: 101,
          usuario: 'Dr. Juan Carlos Pérez',
          especialidad: 'Cardiólogo',
          contenido: 'Sí, en el estudio de seguimiento a 5 años se observó que...',
          fecha: '2024-02-20 15:45',
          likes: 3,
          dislikes: 0
        }
      ]
    },
    {
      id: 2,
      usuario: 'Dr. Roberto Sánchez',
      especialidad: 'Cardiólogo Intervencionista',
      contenido: 'Muy buena revisión. Agregaría que la combinación con ejercicio físico potencia los efectos positivos.',
      fecha: '2024-02-20 16:20',
      likes: 5,
      dislikes: 0,
      respuestas: []
    }
  ]);

  const handleAddComment = (contenido) => {
    const newComment = {
      id: comments.length + 1,
      usuario: 'Tú', // En realidad vendría del usuario logueado
      especialidad: 'Tu especialidad',
      contenido,
      fecha: new Date().toLocaleString(),
      likes: 0,
      dislikes: 0,
      respuestas: []
    };
    setComments(prev => [newComment, ...prev]);
  };

  const handleAddReply = (commentId, contenido) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        const newReply = {
          id: comment.respuestas.length + 1,
          usuario: 'Tú',
          especialidad: 'Tu especialidad',
          contenido,
          fecha: new Date().toLocaleString(),
          likes: 0,
          dislikes: 0
        };
        return {
          ...comment,
          respuestas: [...comment.respuestas, newReply]
        };
      }
      return comment;
    }));
  };

  const handleCommentAction = (commentId, action, value) => {
    setComments(prev => prev.map(comment => {
      // Buscar en comentarios principales
      if (comment.id === commentId) {
        return { ...comment, [action]: value };
      }
      
      // Buscar en respuestas
      const updatedRespuestas = comment.respuestas.map(reply => {
        if (reply.id === commentId) {
          return { ...reply, [action]: value };
        }
        return reply;
      });
      
      return { ...comment, respuestas: updatedRespuestas };
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header con botón de volver */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
          <div className="flex items-center gap-2 text-gray-500">
            <FaComment className="w-4 h-4" />
            <span>{comments.length} comentarios</span>
          </div>
        </div>

        {/* Publicación principal */}
        <div className="mb-6">
          <PublicationCard publicacion={post} />
        </div>

        {/* Sección de comentarios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          
          {/* Input para nuevo comentario */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Añadir comentario
            </h3>
            <CommentInput 
              onSubmit={handleAddComment}
              placeholder="Escribe tu comentario..."
              buttonText="Comentar"
            />
          </div>

          {/* Lista de comentarios */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Comentarios ({comments.length})
            </h3>
            
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaComment className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay comentarios aún. Sé el primero en comentar.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map(comment => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    onReply={handleAddReply}
                    onAction={handleCommentAction}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetailView;