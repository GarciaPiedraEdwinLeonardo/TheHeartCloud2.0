function TopicCard({ tema }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          {tema.nombre}
        </h3>
        <span className="text-xs sm:text-sm text-gray-500">
          Unido: {new Date(tema.fechaUnion).toLocaleDateString('es-ES')}
        </span>
      </div>
      <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
        <span>Publicaciones: {tema.publicaciones}</span>
        <span>Comentarios: {tema.comentarios}</span>
      </div>
    </div>
  );
}

export default TopicCard;