function Main() {
  // Datos de ejemplo para publicaciones
  const publicaciones = [
    {
      id: 1,
      tema: 'Cardiología',
      titulo: 'Nuevos avances en el tratamiento de la hipertensión',
      contenido: 'Recientes estudios demuestran que la combinación de medicamentos de última generación puede reducir significativamente los eventos cardiovasculares mayores. Los resultados son prometedores para pacientes con hipertensión resistente.',
      fecha: '2024-02-20',
      likes: 24,
      comentarios: 8
    },
    {
      id: 2,
      tema: 'Diabetes',
      titulo: 'Manejo integral de la diabetes tipo 2',
      contenido: 'El enfoque multidisciplinario en el manejo de la diabetes ha demostrado mejorar significativamente la calidad de vida de los pacientes. La combinación de tratamiento farmacológico, dieta y ejercicio es clave.',
      fecha: '2024-02-19',
      likes: 15,
      comentarios: 5
    }
  ];

  return (
    <main className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Lista de Posts */}
        

        {/* Espacio para más posts */}
        <div className="mt-8 text-center">
          <p className="text-gray-500">Más posts cargarán aquí...</p>
        </div>

      </div>
    </main>
  );
}

export default Main;