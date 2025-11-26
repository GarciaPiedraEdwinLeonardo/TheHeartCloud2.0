function CommentContent({ contenido }) {
  return (
    <div className="p-6">
      <div className="prose max-w-none text-gray-700 leading-relaxed">
        <p>{contenido}</p>
      </div>
    </div>
  );
}

export default CommentContent;