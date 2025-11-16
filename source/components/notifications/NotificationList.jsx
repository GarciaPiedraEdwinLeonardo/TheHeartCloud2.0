import { useState, useRef, useCallback } from 'react';
import NotificationItem from './NotificationItem';
import { FaCheckDouble, FaBellSlash, FaSpinner } from 'react-icons/fa';

function NotificationList({ notifications, onMarkAsRead, onMarkAllAsRead, loading, hasMore, loadMore }) {
    const [filter, setFilter] = useState('all');
    const observer = useRef();

    // Observer para infinite scroll
    const lastNotificationRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMore]);

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading && notifications.length === 0) {
        return (
            <div className="w-96 max-h-96 bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="animate-pulse space-y-4 p-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-96 max-h-96 bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllAsRead}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                        >
                            <FaCheckDouble className="w-4 h-4" />
                            Marcar todas
                        </button>
                    )}
                </div>

                {/* Filtros */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 text-sm rounded-lg transition duration-200 ${
                            filter === 'all' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Todas ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-3 py-1 text-sm rounded-lg transition duration-200 ${
                            filter === 'unread' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        No leídas ({unreadCount})
                    </button>
                </div>
            </div>

            {/* Lista */}
            <div className="overflow-y-auto max-h-80">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <FaBellSlash className="w-12 h-12 mb-3 text-gray-300" />
                        <p className="text-sm font-medium">
                            {filter === 'unread' ? 'No hay notificaciones no leídas' : 'No hay notificaciones'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredNotifications.map((notification, index) => (
                            <div 
                                key={notification.id} 
                                className="hover:bg-gray-50 transition duration-200"
                                ref={index === filteredNotifications.length - 1 ? lastNotificationRef : null}
                            >
                                <NotificationItem 
                                    notification={notification} 
                                    onMarkAsRead={onMarkAsRead}
                                />
                            </div>
                        ))}
                        
                        {/* Loading para más notificaciones */}
                        {hasMore && (
                            <div className="flex justify-center py-4">
                                <FaSpinner className="w-5 h-5 text-blue-500 animate-spin" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default NotificationList;