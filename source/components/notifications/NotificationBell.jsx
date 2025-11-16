import { FaBell } from 'react-icons/fa';

function NotificationBell({ unreadCount, onClick, isOpen }) {
    return (
        <button
            onClick={onClick}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition duration-200"
        >
            <FaBell className="w-6 h-6" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    );
}

export default NotificationBell;