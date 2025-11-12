import CommentCard from "./../cards/CommentCard";

function CommentsList({ comentarios }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {comentarios.map(comentario => (
        <CommentCard key={comentario.id} comentario={comentario} />
      ))}
    </div>
  );
}

export default CommentsList;