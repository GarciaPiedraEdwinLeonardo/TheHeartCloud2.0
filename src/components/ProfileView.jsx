import { useState } from 'react';
import ProfileHeader from './sections/ProfileHeader';
import TabNavigation from './sections/TabNavigation';
import TabContent from './sections/TabContent';
import StatsSidebar from './sections/StatsSidebar';
import StatsModal from './modals/StatsModal';

function ProfileView() {
  const [activeTab, setActiveTab] = useState('publicaciones');
  const [showStatsModal, setShowStatsModal] = useState(false);

  const userData = {
    nombreCompleto: 'Dr. Juan Carlos Pérez García',
    especialidad: 'Cardiología',
    fotoPerfil: null,
    fechaRegistro: '2024-01-15',
    estadisticas: {
      aura: 245,
      interacciones: 89,
      diasPlataforma: 45,
      temasParticipacion: 12
    },
    publicaciones: [
      {
        id: 1,
        titulo: 'Nuevos avances en el tratamiento de la hipertensión',
        contenido: 'Recientes estudios demuestran que la combinación de medicamentos...',
        fecha: '2024-02-20',
        tema: 'Cardiología',
        likes: 24,
        comentarios: 8
      },
      {
        id: 2,
        titulo: 'Importancia del ejercicio cardiovascular',
        contenido: 'El ejercicio regular puede reducir significativamente el riesgo...',
        fecha: '2024-02-18',
        tema: 'Cardiología',
        likes: 15,
        comentarios: 5
      }
    ],
    comentarios: [
      {
        id: 1,
        publicacionTitulo: 'Manejo de diabetes tipo 2',
        contenido: 'Excelente punto sobre la importancia de la dieta balanceada...',
        fecha: '2024-02-19',
        tema: 'Diabetes',
        likes: 8,
        usuarioComentarista: 'Dr. Juan Carlos Pérez García',
        rolComentarista: 'Cardiología',
        usuarioPost: 'Dr. María González'
      },
      {
        id: 2,
        publicacionTitulo: 'Salud mental en profesionales médicos',
        contenido: 'Comparto tu experiencia, el burnout es real en nuestra profesión...',
        fecha: '2024-02-17',
        tema: 'Salud Mental',
        likes: 12,
        usuarioComentarista: 'Dr. Juan Carlos Pérez García',
        rolComentarista: 'Cardiología',
        usuarioPost: 'Dra. Ana Martínez'
      }
    ],
    temasParticipacion: [
      {
        id: 1,
        nombre: 'Cardiología',
        fechaUnion: '2024-01-15',
        publicaciones: 5,
        comentarios: 12
      },
      {
        id: 2,
        nombre: 'Diabetes',
        fechaUnion: '2024-01-20',
        publicaciones: 2,
        comentarios: 8
      },
      {
        id: 3,
        nombre: 'Salud Mental',
        fechaUnion: '2024-02-01',
        publicaciones: 1,
        comentarios: 3
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          
          {/* Contenido Principal */}
          <main className="lg:w-3/4">
            <ProfileHeader 
              userData={userData} 
              onShowStats={() => setShowStatsModal(true)}
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabContent activeTab={activeTab} userData={userData} />
            </div>
          </main>

          {/* Sidebar - Solo desktop */}
          <aside className="hidden lg:block lg:w-1/4">
            <div className="sticky top-24">
              <StatsSidebar estadisticas={userData.estadisticas} />
            </div>
          </aside>

        </div>
      </div>

      {/* Modal de Estadísticas - Solo móvil */}
      <StatsModal 
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        estadisticas={userData.estadisticas}
      />
    </div>
  );
}

export default ProfileView;