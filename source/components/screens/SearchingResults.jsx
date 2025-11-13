import { useState } from 'react';

function SearchResults({ searchQuery, searchType = 'temas', onThemeClick }) {
  const [activeTab, setActiveTab] = useState(searchType);

  const resultadosTemas = [
    {
      id: 1,
      nombre: 'Cardiología',
      descripcion: 'Todo sobre enfermedades cardiovasculares y tratamientos',
      publicaciones: 245,
      seguidores: 1200,
      esRelevante: true,
      fechaCreacion: '2023-05-15',
      integrantes: 1247,
      creador: 'Administración'
    },
    {
      id: 2,
      nombre: 'Cardiología Pediátrica',
      descripcion: 'Especialidad médica dedicada a las cardiopatías en niños',
      publicaciones: 89,
      seguidores: 450,
      esRelevante: true,
      fechaCreacion: '2023-08-20',
      integrantes: 523,
      creador: 'Dra. Ana Martínez'
    },
    {
      id: 3,
      nombre: 'Cardiología Intervencionista',
      descripcion: 'Procedimientos mínimamente invasivos para problemas cardíacos',
      publicaciones: 156,
      seguidores: 780,
      esRelevante: true,
      fechaCreacion: '2023-06-10',
      integrantes: 845,
      creador: 'Dr. Roberto Sánchez'
    }
  ];

  const resultadosPerfiles = [
    {
      id: 1,
      nombre: 'Dr. Carlos Rodríguez',
      especialidad: 'Cardiólogo',
      fotoPerfil: null,
      aura: 345,
      interacciones: 89,
      temas: ['Cardiología', 'Hipertensión'],
      esRelevante: true
    },
    {
      id: 2,
      nombre: 'Dra. Ana Martínez Cardona',
      especialidad: 'Cardióloga Pediátrica',
      fotoPerfil: null,
      aura: 278,
      interacciones: 67,
      temas: ['Cardiología Pediátrica', 'Cardiopatías Congénitas'],
      esRelevante: true
    },
    {
      id: 3,
      nombre: 'Dr. Roberto Sánchez',
      especialidad: 'Cardiólogo Intervencionista',
      fotoPerfil: null,
      aura: 412,
      interacciones: 124,
      temas: ['Cardiología Intervencionista', 'Angioplastia'],
      esRelevante: true
    }
  ];

  const handleThemeClick = (tema) => {
    if (onThemeClick) {
      onThemeClick(tema);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header de búsqueda */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Resultados de búsqueda: "{searchQuery}"
          </h1>
          <p className="text-gray-600">
            {activeTab === 'temas' 
              ? `Encontramos ${resultadosTemas.length} temas relacionados` 
              : `Encontramos ${resultadosPerfiles.length} perfiles relacionados`
            }
          </p>
        </div>

        {/* Navegación por pestañas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('temas')}
              className={`flex-1 py-4 px-6 text-center font-medium transition duration-200 ${
                activeTab === 'temas'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Temas
            </button>
            <button
              onClick={() => setActiveTab('perfiles')}
              className={`flex-1 py-4 px-6 text-center font-medium transition duration-200 ${
                activeTab === 'perfiles'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Perfiles
            </button>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6">
            {activeTab === 'temas' ? (
              <TemasList 
                temas={resultadosTemas} 
                searchQuery={searchQuery} 
                onThemeClick={handleThemeClick}
              />
            ) : (
              <PerfilesList 
                perfiles={resultadosPerfiles} 
                searchQuery={searchQuery} 
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Componente para listar Temas
function TemasList({ temas, searchQuery, onThemeClick }) {
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
        <div 
          key={tema.id} 
          className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition duration-200 cursor-pointer"
          onClick={() => onThemeClick(tema)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">{tema.nombre}</h3>
              <p className="text-gray-600 text-sm mb-2">{tema.descripcion}</p>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>{tema.publicaciones} publicaciones</span>
                <span>{tema.seguidores} seguidores</span>
                <span>{tema.integrantes} integrantes</span>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm">
              Seguir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente para listar Perfiles
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
              <div className="flex flex-wrap gap-1 mb-2">
                {perfil.temas.map((tema, index) => (
                  <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    {tema}
                  </span>
                ))}
              </div>
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

export default SearchResults;