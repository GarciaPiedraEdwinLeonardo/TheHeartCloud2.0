import { FaTrash } from 'react-icons/fa';
import { useState } from 'react';

function CommentDeleted({ notification, onMarkAsRead, onDelete }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async (e) => {
        e.stopPropagation();
        setDeleting(true);
        await onDelete(notification.id);
    };

    return (
        <div className={`p-4 border-l-4 border-l-orange-500 bg-white rounded-r-lg hover:bg-gray-50 transition duration-200 ${
            !notification.isRead ? 'bg-blue-50' : ''
        } ${deleting ? 'opacity-50' : ''}`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <FaTrash className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                        {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                    
                    {notification.actionData?.reason && (
                        <p className="text-xs text-gray-500 mb-2">
                            <strong>Motivo:</strong> {notification.actionData.reason}
                        </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt?.seconds * 1000).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2">
                            {!notification.isRead && (
                                <button
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                                    disabled={deleting}
                                >
                                    Marcar leída
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                className="text-gray-400 hover:text-red-600 transition duration-200 p-1"
                                disabled={deleting}
                                title="Eliminar notificación"
                            >
                                <FaTrash className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CommentDeleted;