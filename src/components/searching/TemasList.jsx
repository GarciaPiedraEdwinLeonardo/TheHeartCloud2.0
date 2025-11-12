function TemasList({ temas, searchQuery }) {
  if (temas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">No se encontraron temas relacionados con "{searchQuery}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {temas.map(tema => (
        <div key={tema.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1">{tema.nombre}</h3>
              <p className="text-gray-600 text-sm mb-2">{tema.descripcion}</p>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>{tema.publicaciones} publicaciones</span>
                <span>{tema.seguidores} integrantes</span>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm">
                Unirse {/* Unido si ya esta dentro marcado de color verde*/}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TemasList;