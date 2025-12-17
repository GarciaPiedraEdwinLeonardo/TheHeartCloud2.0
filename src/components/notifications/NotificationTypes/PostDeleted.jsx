import { FaTrash } from 'react-icons/fa';

function PostDeleted({ notification, onMarkAsRead }) {
    return (
        <div className={`p-4 border-l-4 border-l-red-500 bg-white rounded-r-lg hover:bg-gray-50 transition duration-200 ${
            !notification.isRead ? 'bg-blue-50' : ''
        }`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <FaTrash className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                        {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                    
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt?.seconds * 1000).toLocaleDateString()}
                        </p>
                        {!notification.isRead && (
                            <button
                                onClick={() => onMarkAsRead(notification.id)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                                Marcar leída
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostDeleted;