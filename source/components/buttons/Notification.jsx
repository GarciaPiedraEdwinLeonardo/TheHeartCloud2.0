import { MdNotifications } from "react-icons/md";

function Notification() {
  return (
    <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition duration-200">
      <MdNotifications className="w-6 h-6" />
    </button>
  );
}

export default Notification;