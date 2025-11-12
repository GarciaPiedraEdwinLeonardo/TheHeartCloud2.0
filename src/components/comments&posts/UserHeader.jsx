import { FaUserCircle } from "react-icons/fa";

function UserHeader({ userName, userRole, avatarUrl = null }) {
  return (
    <div className="flex items-center gap-3">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <FaUserCircle className="w-8 h-8 text-gray-400" />
      )}
      <div>
        <h3 className="font-semibold text-gray-900">{userName}</h3>
        <p className="text-sm text-gray-500">{userRole}</p>
      </div>
    </div>
  );
}

export default UserHeader;