import { FaRegUserCircle } from 'react-icons/fa';

function Profile() {
  return (
    <button className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition duration-200">
      <FaRegUserCircle className="w-6 h-6 text-gray-600" />
    </button>
  );
}

export default Profile;