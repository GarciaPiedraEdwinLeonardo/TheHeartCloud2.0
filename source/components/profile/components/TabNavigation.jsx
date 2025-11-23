import { FaFileAlt, FaComment, FaUsers } from 'react-icons/fa';

function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { 
      id: 'publicaciones', 
      label: 'Publicaciones',
      icon: <FaFileAlt className="w-4 h-4" />
    },
    { 
      id: 'comentarios', 
      label: 'Comentarios',
      icon: <FaComment className="w-4 h-4" />
    },
    { 
      id: 'temas', 
      label: 'Comunidades',
      icon: <FaUsers className="w-4 h-4" />
    }
  ];

  return (
    <nav className="flex border-b border-gray-200 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 min-w-0 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition duration-200 whitespace-nowrap flex items-center justify-center gap-2 ${
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
        </button>
      ))}
    </nav>
  );
}

export default TabNavigation;