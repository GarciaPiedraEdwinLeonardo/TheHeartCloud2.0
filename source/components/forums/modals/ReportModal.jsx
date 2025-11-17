import { useState } from 'react';
import { FaTimes, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

function ReportModal({ isOpen, onClose, reportType, targetId, targetName }) {
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    urgency: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reportReasons = {
    forum: [
      'Contenido inapropiado',
      'Spam o autopromoción',
      'Comunidad duplicada',
      'Información médica falsa',
      'Comportamiento abusivo',
      'Violación de normas',
      'Otro'
    ],
    post: [
      'Contenido inapropiado',
      'Información médica falsa',
      'Spam',
      'Derechos de autor',
      'Acoso o bullying',
      'Contenido ofensivo',
      'Otro'
    ],
    comment: [
      'Comentario ofensivo',
      'Spam',
      'Acoso',
      'Información falsa',
      'Fuera de contexto',
      'Otro'
    ],
    user: [
      'Comportamiento abusivo',
      'Spam',
      'Suplantación de identidad',
      'Perfil falso',
      'Acoso',
      'Otro'
    ]
  };

  const urgencyLevels = [
    { value: 'low', label: 'Baja', color: 'text-green-600', description: 'Problema menor' },
    { value: 'medium', label: 'Media', color: 'text-yellow-600', description: 'Necesita revisión' },
    { value: 'high', label: 'Alta', color: 'text-orange-600', description: 'Requiere atención pronto' },
    { value: 'critical', label: 'Crítica', color: 'text-red-600', description: 'Necesita acción inmediata' }
  ];

  const getReportTitle = () => {
    switch (reportType) {
      case 'forum':
        return `Reportar Comunidad: ${targetName}`;
      case 'post':
        return `Reportar Publicación: ${targetName}`;
      case 'comment':
        return `Reportar Comentario`;
      case 'user':
        return `Reportar Usuario: ${targetName}`;
      default:
        return 'Reportar Contenido';
    }
  };

  const getReportDescription = () => {
    switch (reportType) {
      case 'forum':
        return 'Reportar problemas con esta comunidad';
      case 'post':
        return 'Reportar problemas con esta publicación';
      case 'comment':
        return 'Reportar problemas con este comentario';
      case 'user':
        return 'Reportar problemas con este usuario';
      default:
        return 'Reportar contenido inapropiado';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reason || !formData.description.trim()) {
      setError('Por favor selecciona un motivo y proporciona una descripción');
      return;
    }

    if (formData.description.length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Integrar con Firebase para guardar el reporte
      console.log('Enviando reporte:', {
        type: reportType,
        targetId,
        targetName,
        ...formData,
        reportedAt: new Date(),
        reportedBy: 'current-user-id' // Reemplazar con ID del usuario actual
      });
      
      // Simular delay de envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('¡Reporte enviado exitosamente! Los moderadores revisarán tu reporte pronto.');
      onClose();
      setFormData({
        reason: '',
        description: '',
        urgency: 'medium'
      });
    } catch (error) {
      setError('Error al enviar el reporte');
    } finally {
      setLoading(false);
    }
  };

  // Prevenir scroll del body cuando el modal está abierto
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Contenedor principal con max-height y overflow */}
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fijo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaExclamationTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">{getReportTitle()}</h2>
              <p className="text-sm text-gray-500 truncate">{getReportDescription()}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50 flex-shrink-0 ml-2"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="max-h-[calc(80vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Motivo del reporte */}
            <div className="mb-6">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del reporte *
              </label>
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                disabled={loading}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 disabled:opacity-50"
                required
              >
                <option value="">Selecciona un motivo</option>
                {reportReasons[reportType]?.map((reason, index) => (
                  <option key={index} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            {/* Urgencia */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Nivel de urgencia
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {urgencyLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`flex flex-col p-3 border rounded-lg cursor-pointer transition duration-200 min-h-[60px] ${
                      formData.urgency === level.value
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name="urgency"
                        value={level.value}
                        checked={formData.urgency === level.value}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm font-medium ${level.color}`}>
                        {level.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {level.description}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción detallada *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={loading}
                rows={5}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none disabled:opacity-50"
                placeholder="Proporciona todos los detalles relevantes sobre el problema. Esto ayudará a los moderadores a entender la situación."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} caracteres (mínimo 10)
              </p>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Información importante</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Los reportes son anónimos para otros usuarios</li>
                <li>• Los moderadores revisarán tu reporte en 24-48 horas</li>
                <li>• Usa este sistema solo para contenido que viole las normas</li>
                <li>• Los reportes falsos pueden resultar en sanciones</li>
              </ul>
            </div>
          </form>
        </div>

        {/* Footer fijo con botones */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium disabled:opacity-50 order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 order-1 sm:order-2"
            >
              {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
              {loading ? 'Enviando...' : 'Enviar Reporte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;