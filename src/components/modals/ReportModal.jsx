import { useState } from 'react';
import { FaTimes, FaExclamationTriangle, FaFlag } from 'react-icons/fa';

function ReportModal({ 
  isOpen, 
  onClose, 
  reportType = 'publicacion', // 'publicacion', 'comentario', 'tema', 'perfil'
  targetId,
  targetName 
}) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Razones de reporte según el tipo
  const reportReasons = {
    publicacion: [
      'Contenido inapropiado',
      'Información médica incorrecta',
      'Spam o publicidad',
      'Acoso o discurso de odio',
      'Violación de derechos de autor',
      'Otro'
    ],
    comentario: [
      'Comentario inapropiado',
      'Información médica incorrecta',
      'Spam o publicidad',
      'Acoso o ofensivo',
      'Fuera de contexto',
      'Otro'
    ],
    tema: [
      'Tema inapropiado',
      'Nombre engañoso',
      'Contenido no médico',
      'Spam o publicidad',
      'Acoso o discurso de odio',
      'Otro'
    ],
    perfil: [
      'Perfil falso o suplantación',
      'Información profesional falsa',
      'Comportamiento inapropiado',
      'Spam o publicidad',
      'Acoso a otros usuarios',
      'Otro'
    ]
  };

  // Títulos según el tipo
  const getTitle = () => {
    const titles = {
      publicacion: 'Reportar Publicación',
      comentario: 'Reportar Comentario',
      tema: 'Reportar Tema',
      perfil: 'Reportar Perfil'
    };
    return titles[reportType] || titles.publicacion;
  };

  // Descripciones según el tipo
  const getDescription = () => {
    const descriptions = {
      publicacion: '¿Por qué quieres reportar esta publicación?',
      comentario: '¿Por qué quieres reportar este comentario?',
      tema: '¿Por qué quieres reportar este tema?',
      perfil: '¿Por qué quieres reportar este perfil?'
    };
    return descriptions[reportType] || descriptions.publicacion;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedReason) {
      alert('Por favor selecciona una razón para el reporte');
      return;
    }

    setIsSubmitting(true);

    try {
      // Aquí iría la lógica para enviar el reporte a tu backend
      const reportData = {
        type: reportType,
        targetId: targetId,
        targetName: targetName,
        reason: selectedReason === 'Otro' ? customReason : selectedReason,
        timestamp: new Date().toISOString()
      };

      console.log('Reporte enviado:', reportData);
      
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Reporte enviado correctamente. Revisaremos tu solicitud.');
      handleClose();
      
    } catch (error) {
      console.error('Error al enviar reporte:', error);
      alert('Error al enviar el reporte. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    if (reason !== 'Otro') {
      setCustomReason('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaFlag className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {getTitle()}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            disabled={isSubmitting}
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Información del target */}
          {targetName && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Reportando:</span> {targetName}
              </p>
            </div>
          )}

          {/* Razones de reporte */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {getDescription()}
            </label>
            
            <div className="space-y-2">
              {reportReasons[reportType]?.map((reason, index) => (
                <label key={index} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition duration-200">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => handleReasonSelect(reason)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Campo para razón personalizada */}
          {selectedReason === 'Otro' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Por favor, describe el problema:
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe detalladamente por qué estás reportando este contenido..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                required
              />
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedReason || (selectedReason === 'Otro' && !customReason.trim())}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportModal;