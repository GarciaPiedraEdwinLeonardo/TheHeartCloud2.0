import VerificationApproved from './NotificationTypes/VerificationApproved';
import VerificationRejected from './NotificationTypes/VerificationRejected';
import SanctionNotification from './NotificationTypes/SanctionNotification';
import PostApproved from './NotificationTypes/PostApproved';
import PostRejected from './NotificationTypes/PostRejected';
import ModeratorAssigned from './NotificationTypes/ModeratorAssigned';
import CommunityBan from './NotificationTypes/CommunityBan';
import MembershipApproved from './NotificationTypes/MembershipApproved';
import OwnershipTransferred from './NotificationTypes/OwnershipTransferred';

function NotificationItem({ notification, onMarkAsRead }) {
  const renderNotification = () => {
    switch (notification.type) {
      case 'verification_approved':
        return <VerificationApproved notification={notification} onMarkAsRead={onMarkAsRead} />;
      case 'verification_rejected':
        return <VerificationRejected notification={notification} onMarkAsRead={onMarkAsRead} />;
      case 'user_suspended':
        return <SanctionNotification notification={notification} onMarkAsRead={onMarkAsRead} />;
      case 'post_approved':
        return <PostApproved notification={notification} onMarkAsRead={onMarkAsRead} />;
      case 'post_rejected':
        return <PostRejected notification={notification} onMarkAsRead={onMarkAsRead} />;
      case 'moderator_assigned':
        return <ModeratorAssigned notification={notification} onMarkAsRead={onMarkAsRead} />;
      case 'community_ban':
        return <CommunityBan notification={notification} onMarkAsRead={onMarkAsRead} />;
      case 'membership_approved':
        return <MembershipApproved notification={notification} onMarkAsRead={onMarkAsRead} />;
      case 'ownership_transferred':
        return <OwnershipTransferred notification={notification} onMarkAsRead={onMarkAsRead} />;
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