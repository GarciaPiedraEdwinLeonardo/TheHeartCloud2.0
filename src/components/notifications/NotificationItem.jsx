import VerificationApproved from './NotificationTypes/VerificationApproved';
import VerificationRejected from './NotificationTypes/VerificationRejected';
import SanctionNotification from './NotificationTypes/SanctionNotification';
import PostApproved from './NotificationTypes/PostApproved';
import PostRejected from './NotificationTypes/PostRejected';
import ModeratorAssigned from './NotificationTypes/ModeratorAssigned';
import CommunityBan from './NotificationTypes/CommunityBan';
import MembershipApproved from './NotificationTypes/MembershipApproved';
import OwnershipTransferred from './NotificationTypes/OwnershipTransferred';
import CommentDeleted from './NotificationTypes/CommentDeleted';
import PostDeleted from './NotificationTypes/PostDeleted';

function NotificationItem({ notification, onMarkAsRead, onDelete }) {
  const renderNotification = () => {
    switch (notification.type) {
      case 'verification_approved':
        return <VerificationApproved notification={notification} onMarkAsRead={onMarkAsRead} onDelete={onDelete} />;
      case 'verification_rejected':
        return <VerificationRejected notification={notification} onMarkAsRead={onMarkAsRead} onDelete={onDelete} />;
      case 'user_suspended':
        return <SanctionNotification notification={notification} onMarkAsRead={onMarkAsRead} onDelete={onDelete} />;
      case 'post_approved':
        return <PostApproved notification={notification} onMarkAsRead={onMarkAsRead} onDelete={onDelete} />;
      case 'post_rejected':
        return <PostRejected notification={notification} onMarkAsRead={onMarkAsRead} onDelete={onDelete} />;
      case 'post_deleted':
        return <PostDeleted notification={notification} onMarkAsRead={onMarkAsRead} onDelete={onDelete} />;
      case 'moderator_assigned':
        return <ModeratorAssigned notification={notification} onMarkAsRead={onMarkAsRead} onDelete={onDelete} />;
      case 'community_ban':
        return <CommunityBan notification={notification} onMarkAsRead={onMarkAsRead} onDelete={onDelete} />;
      case 'membership_approved':
        return <MembershipApproved notification={notification} onMarkAsRead={onMarkAsRead} onDelete={onDelete} />;
      case 'ownership_transferred':
        return <OwnershipTransferred notification={notification} onMarkAsRead={onMarkAsRead} onDelete={onDelete} />;
      case 'comment_deleted':
        return <CommentDeleted notification={notification} onMarkAsRead={onMarkAsRead} onDelete={onDelete} />;
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