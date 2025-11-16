import VerificationApproved from './NotificationTypes/VerificationApproved';
import VerificationRejected from './NotificationTypes/VerificationRejected';
import SanctionNotification from './NotificationTypes/SanctionNotification';

function NotificationItem({ notification, onMarkAsRead }) {
  const renderNotification = () => {
    switch (notification.type) {
      case 'verification_approved':
        return <VerificationApproved notification={notification} onMarkAsRead={onMarkAsRead} />;
      case 'verification_rejected':
        return <VerificationRejected notification={notification} onMarkAsRead={onMarkAsRead} />;
      case 'user_suspended':
        return <SanctionNotification notification={notification} onMarkAsRead={onMarkAsRead} />;
      default:
        return (
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">Tipo de notificación no reconocido: {notification.type}</p>
          </div>
        );
    }
  };

  return renderNotification();
}

export default NotificationItem;