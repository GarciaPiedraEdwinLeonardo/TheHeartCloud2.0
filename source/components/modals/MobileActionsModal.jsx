import { FaTimes } from 'react-icons/fa';

function MobileActionsModal({ isOpen, onClose, actions }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Acciones</h3>
          <button onClick={onClose} className="p-2">
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-2 p-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition duration-200 ${action.className}`}
              disabled={action.disabled}
            >
              {action.icon}
              <span className="text-sm font-medium text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MobileActionsModal;