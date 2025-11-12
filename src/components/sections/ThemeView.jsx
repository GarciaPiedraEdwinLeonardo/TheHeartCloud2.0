import { useState } from 'react';
import { FaUserPlus, FaFlag, FaCalendar, FaUsers, FaEdit } from 'react-icons/fa';
import PublicationCard from './../cards/PublicationCard'; 
import ReportModal from './../modals/ReportModal';
import CreatePostModal from '../modals/CreatePostModal';

function ThemeView({ themeData, onBack }) {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  // Datos de ejemplo del tema
  const themeInfo = themeData || {
    id: 1,
    nombre: 'Cardiología',
    descripcion: 'Todo sobre enfermedades cardiovasculares, tratamientos, prevención y avances en cardiología. Comparte conocimientos sobre arritmias, cardiopatías, hipertensión y más.',
    fechaCreacion: '2023-05-15',
    integrantes: 1247,
    publicaciones: 356,
    creador: 'Dr. Roberto Mendoza'
  };

  // Datos de publicaciones usando la estructura que espera PublicationCard
  const publicaciones = [
    {
      id: 1,
      tema: 'Cardiología',
      titulo: 'Nuevos avances en el tratamiento de la hipertensión arterial',
      contenido: 'Recientes estudios demuestran que la combinación de medicamentos de última generación puede reducir significativamente los eventos cardiovasculares mayores. Los resultados son prometedores para pacientes con hipertensión resistente, mostrando una reducción del 35% en eventos adversos.',
      fecha: '2024-02-20',
      likes: 24,
      comentarios: 8
    },
    {
      id: 2,
      tema: 'Cardiología',
      titulo: 'Manejo de cardiopatías congénitas en neonatos',
      contenido: 'El diagnóstico temprano y el manejo multidisciplinario son clave para mejorar el pronóstico en pacientes pediátricos con cardiopatías congénitas complejas. Las técnicas de intervención mínimamente invasiva han revolucionado el tratamiento en los últimos años.',
      fecha: '2024-02-19',
      likes: 15,
      comentarios: 5
    },
    {
      id: 3,
      tema: 'Cardiología',
      titulo: 'Técnicas mínimamente invasivas en enfermedad coronaria',
      contenido: 'La angioplastia con stent farmacoactivo continúa demostrando superioridad en términos de reducción de reestenosis en comparación con técnicas convencionales. Estudios recientes confirman una tasa de éxito del 92% en procedimientos complejos.',
      fecha: '2024-02-18',
      likes: 32,
      comentarios: 12
    },
    {
      id: 4,
      tema: 'Cardiología',
      titulo: 'Importancia del ejercicio cardiovascular preventivo',
      contenido: 'La actividad física regular no solo mejora la capacidad cardiorrespiratoria, sino que también reduce significativamente el riesgo de desarrollar enfermedades cardiovasculares. Recomendamos al menos 150 minutos semanales de ejercicio moderado.',
      fecha: '2024-02-17',
      likes: 18,
      comentarios: 7
    }
  ];

  const handleJoin = () => {
    setIsJoined(!isJoined);
    // Aquí iría la lógica para unirse/abandonar el tema
  };

  const handleReport = () => {
    // Aquí iría la lógica para reportar el tema
    setShowReportModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Contenido Principal */}
          <main className="lg:w-3/4">
            {/* Header del Tema */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {themeInfo.nombre}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {themeInfo.descripcion}
                  </p>
                </div>
                <button 
                  onClick={onBack}
                  className="mt-4 sm:mt-0 px-4 py-2 text-gray-600 hover:text-gray-800 transition duration-200"
                >
                  ← Volver
                </button>
              </div>

              {/* Estadísticas del Tema */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-500 border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2">
                  <FaCalendar className="w-4 h-4" />
                  <span>Creado el {new Date(themeInfo.fechaCreacion).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers className="w-4 h-4" />
                  <span>{themeInfo.integrantes.toLocaleString()} integrantes</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaEdit className="w-4 h-4" />
                  <span>{themeInfo.publicaciones} publicaciones</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Creado por: {themeInfo.creador}</span>
                </div>
              </div>
            </div>

            {/* Lista de Publicaciones usando PublicationCard */}
            <div className="space-y-6">
              {publicaciones.map(publicacion => (
                <PublicationCard 
                  key={publicacion.id} 
                  publicacion={publicacion} 
                />
              ))}
            </div>

            {/* Mensaje si no hay publicaciones */}
            {publicaciones.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <FaEdit className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay publicaciones aún
                </h3>
                <p className="text-gray-600 mb-4">
                  Sé el primero en compartir contenido en este tema
                </p>
                <button
                  onClick={handleCreatePost}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                >
                  Crear primera publicación
                </button>
              </div>
            )}
          </main>

          {/* Sidebar Fijo */}
          <aside className="lg:w-1/4">
            <div className="sticky top-24 space-y-4">
              {/* Acciones del Tema */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Acciones</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCreatePostModal(true)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2 font-medium"
                  >
                    <FaEdit className="w-4 h-4" />
                    Crear Post
                  </button>
                  
                  <button
                    onClick={handleJoin}
                    className={`w-full py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 font-medium border ${
                      isJoined 
                        ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
                        : 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
                    }`}
                  >
                    <FaUserPlus className="w-4 h-4" />
                    {isJoined ? 'Abandonar Tema' : 'Unirse al Tema'}
                  </button>
                  
                  <button
                    onClick={handleReport}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center gap-2 font-medium"
                  >
                    <FaFlag className="w-4 h-4" />
                    Reportar Tema
                  </button>

                </div>
              </div>

              {/* Información del Tema */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Sobre este tema</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaCalendar className="w-4 h-4 text-gray-400" />
                    <span>Creado el {new Date(themeInfo.fechaCreacion).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="w-4 h-4 text-gray-400" />
                    <span>{themeInfo.integrantes.toLocaleString()} integrantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEdit className="w-4 h-4 text-gray-400" />
                    <span>{themeInfo.publicaciones} publicaciones</span>
                  </div>
                </div>

                {/* Descripción */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {themeInfo.descripcion}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <ReportModal 
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportType="tema"
          targetId={themeData.id}
          targetName={themeData.nombre}
        />

        <CreatePostModal 
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        defaultTheme={themeData.nombre} 
      />

        </div>
      </div>
    </div>
  );
}

export default ThemeView;