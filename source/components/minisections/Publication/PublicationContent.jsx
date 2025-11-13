function PublicationContent({ titulo, contenido }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {titulo}
      </h2>
      <div className="prose max-w-none text-gray-700 leading-relaxed">
        {contenido.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

export default PublicationContent;