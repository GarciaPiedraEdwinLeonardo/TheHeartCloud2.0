import { useState, useRef, useEffect } from 'react';
import { useNotifications } from './hooks/useNotifications';
import NotificationBell from './NotificationBell';
import NotificationList from './NotificationList';

function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { 
        notifications, 
        unreadCount, 
        loading, 
        hasMore,
        markAsRead, 
        markAllAsRead,
        loadMore,
        deleteNotification,
        deleteAllNotifications,
        deleteReadNotifications
    } = useNotifications();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = () => {
        setIsOpen(!isOpen);
    };

    const handleMarkAsRead = (notificationId) => {
        markAsRead(notificationId);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    const handleDeleteNotification = async (notificationId) => {
        await deleteNotification(notificationId);
    };

    const handleDeleteAllNotifications = async () => {
        await deleteAllNotifications();
    };

    const handleDeleteReadNotifications = async () => {
        await deleteReadNotifications();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <NotificationBell 
                unreadCount={unreadCount}
                onClick={handleBellClick}
                isOpen={isOpen}
            />

            {isOpen && (
                <div className="absolute right-0 top-12 z-50">
                    <NotificationList
                        notifications={notifications}
                        onMarkAsRead={handleMarkAsRead}
                        onMarkAllAsRead={handleMarkAllAsRead}
                        onDeleteNotification={handleDeleteNotification}
                        onDeleteAllNotifications={handleDeleteAllNotifications}
                        onDeleteReadNotifications={handleDeleteReadNotifications}
                        loading={loading}
                        hasMore={hasMore}
                        loadMore={loadMore}
                    />
                </div>
            )}
        </div>
    );
}

export default NotificationCenter;