function PerfilesList({ perfiles, searchQuery }) {
  if (perfiles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">No se encontraron perfiles relacionados con "{searchQuery}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {perfiles.map(perfil => (
        <div key={perfil.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition duration-200">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {perfil.nombre.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            
            {/* Información del perfil */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{perfil.nombre}</h3>
              <p className="text-gray-600 text-sm mb-1">{perfil.especialidad}</p>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>Aura: {perfil.aura}</span>
                <span>Interacciones: {perfil.interacciones}</span>
              </div>
            </div>
            
            {/* Botón de acción */}
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm">
              Ver Perfil
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PerfilesList;