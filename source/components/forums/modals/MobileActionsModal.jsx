import { FaTimes, FaEdit, FaUserShield, FaCog, FaFlag, FaUsers, FaCheckCircle, FaBan, FaSignOutAlt, FaUserPlus } from 'react-icons/fa';

function MobileActionsModal({ isOpen, onClose, actions }) {
  if (!isOpen) return null;

  const getActionIcon = (iconName) => {
    const icons = {
      createPost: <FaEdit className="w-5 h-5" />,
      manageModerators: <FaUserShield className="w-5 h-5" />,
      settings: <FaCog className="w-5 h-5" />,
      report: <FaFlag className="w-5 h-5" />,
      manageMembers: <FaUsers className="w-5 h-5" />,
      validatePosts: <FaCheckCircle className="w-5 h-5" />,
      banUser: <FaBan className="w-5 h-5" />,
      leave: <FaSignOutAlt className="w-5 h-5" />,
      join: <FaUserPlus className="w-5 h-5" />
    };
    return icons[iconName] || <FaEdit className="w-5 h-5" />;
  };

  const getActionColor = (type) => {
    const colors = {
      primary: 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100',
      secondary: 'border-gray-500 bg-gray-50 text-gray-700 hover:bg-gray-100',
      danger: 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100',
      success: 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100',
      warning: 'border-orange-500 bg-orange-50 text-orange-700 hover:bg-orange-100'
    };
    return colors[type] || colors.secondary;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden flex items-end">
      <div className="w-full bg-white rounded-t-2xl shadow-xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Acciones</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-3 p-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              disabled={action.disabled}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition duration-200 min-h-[100px] disabled:opacity-50 disabled:cursor-not-allowed ${getActionColor(action.type)}`}
            >
              {getActionIcon(action.icon)}
              <span className="text-sm font-medium text-center leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileActionsModal;