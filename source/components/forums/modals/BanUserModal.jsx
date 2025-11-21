import { useState } from 'react';
import { FaTimes, FaSpinner, FaBan, FaUser } from 'react-icons/fa';
import { useCommunityBans } from './../hooks/useCommunityBans';

function BanUserModal({ isOpen, onClose, user, forumId, forumName, onUserBanned }) {
  const [formData, setFormData] = useState({
    reason: '',
    duration: '7d'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { banUser } = useCommunityBans();

  const durationOptions = [
    { value: '1d', label: '1 día', description: 'Suspensión temporal' },
    { value: '7d', label: '7 días', description: 'Suspensión por una semana' },
    { value: '30d', label: '30 días', description: 'Suspensión por un mes' },
    { value: 'permanent', label: 'Permanente', description: 'Baneo definitivo' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      setError('Por favor proporciona un motivo para el baneo');
      return;
    }

    if (formData.reason.length < 10) {
      setError('El motivo debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await banUser(forumId, user.id, formData.reason, formData.duration);

      if (result.success) {
        if (onUserBanned) {
          onUserBanned();
        }
        onClose();
        setFormData({ reason: '', duration: '7d' });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al banear al usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const getUserName = () => {
    if (user.name && (user.name.name || user.name.apellidopat || user.name.apellidomat)) {
      return `${user.name.name || ''} ${user.name.apellidopat || ''} ${user.name.apellidomat || ''}`.trim();
    }
    return user.email || 'Usuario';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FaBan className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Banear Usuario</h2>
              <p className="text-sm text-gray-600">De {forumName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Información del usuario */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Usuario a banear:</h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FaUser className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{getUserName()}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                {user.role && (
                  <span className="inline-block mt-1 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Duración */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Duración del baneo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {durationOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex flex-col p-3 border rounded-lg cursor-pointer transition duration-200 ${
                    formData.duration === option.value
                      ? 'border-red-500 bg-red-50 ring-2 ring-red-500 ring-opacity-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="duration"
                      value={option.value}
                      checked={formData.duration === option.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {option.label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {option.description}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Motivo */}
          <div className="mb-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo del baneo *
            </label>
            <textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              disabled={loading}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 disabled:opacity-50"
              placeholder="Explica detalladamente por qué estás baneando a este usuario..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.reason.length} caracteres (mínimo 10)
            </p>
          </div>

          {/* Advertencia */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <FaBan className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">Consecuencias del baneo</h4>
                <ul className="text-xs text-red-700 space-y-1">
                  <li>• El usuario será removido de la comunidad</li>
                  <li>• No podrá volver a unirse a esta comunidad</li>
                  <li>• Se notificará al usuario sobre el baneo</li>
                  <li>• El motivo será revisado por moderación global</li>
                  {formData.duration === 'permanent' && (
                    <li>• ⚠️ Este baneo es permanente e irreversible</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || formData.reason.length < 10}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
              <FaBan className="w-4 h-4" />
              Banear Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BanUserModal;