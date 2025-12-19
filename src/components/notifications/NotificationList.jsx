import { useState, useRef, useCallback, useEffect } from 'react';
import NotificationItem from './NotificationItem';
import { FaCheckDouble, FaBellSlash, FaSpinner, FaTrash, FaEllipsisV, FaTimes } from 'react-icons/fa';

function NotificationList({ 
    notifications, 
    onMarkAsRead, 
    onMarkAllAsRead, 
    onDeleteNotification,
    onDeleteAllNotifications,
    onDeleteReadNotifications,
    loading, 
    hasMore, 
    loadMore 
}) {
    const [filter, setFilter] = useState('all');
    const [showMenu, setShowMenu] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [deletingAll, setDeletingAll] = useState(false);
    const observer = useRef();
    const menuRef = useRef();

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

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const readCount = notifications.filter(n => n.isRead).length;

    const openModal = (action) => {
        setModalAction(action);
        setShowModal(true);
        setShowMenu(false);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalAction(null);
    };

    const handleConfirmAction = async () => {
        setDeletingAll(true);
        
        if (modalAction === 'deleteAll') {
            await onDeleteAllNotifications();
        } else if (modalAction === 'deleteRead') {
            await onDeleteReadNotifications();
        }
        
        setDeletingAll(false);
        closeModal();
    };

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
        <>
            <div className="w-96 max-h-96 bg-white rounded-xl shadow-lg border border-gray-200">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                        
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={onMarkAllAsRead}
                                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                                >
                                    <FaCheckDouble className="w-4 h-4" />
                                    Marcar todas
                                </button>
                            )}
                            
                            {/* Menú de opciones */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200"
                                    disabled={deletingAll || notifications.length === 0}
                                >
                                    <FaEllipsisV className="w-4 h-4" />
                                </button>

                                {showMenu && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                        <div className="py-1">
                                            <button
                                                onClick={() => openModal('deleteRead')}
                                                disabled={readCount === 0}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                <FaTrash className="w-3 h-3" />
                                                Eliminar leídas ({readCount})
                                            </button>
                                            
                                            <button
                                                onClick={() => openModal('deleteAll')}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <FaTrash className="w-3 h-3" />
                                                Eliminar todas ({notifications.length})
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
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
                    {deletingAll ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                            <p className="text-sm text-gray-500">Eliminando notificaciones...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
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
                                        onDelete={onDeleteNotification}
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

            {/* Modal de Confirmación */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <FaTrash className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {modalAction === 'deleteAll' ? 'Eliminar todas las notificaciones' : 'Eliminar notificaciones leídas'}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {modalAction === 'deleteAll' 
                                            ? `Estás a punto de eliminar ${notifications.length} notificaciones. Esta acción no se puede deshacer.`
                                            : `Se eliminarán ${readCount} notificaciones leídas. Esta acción no se puede deshacer.`
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-200"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default NotificationList;