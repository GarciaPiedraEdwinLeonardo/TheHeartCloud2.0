function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'publicaciones', label: 'Publicaciones' },
    { id: 'comentarios', label: 'Comentarios' },
    { id: 'temas', label: 'Temas' }
  ];

  return (
    <nav className="flex border-b border-gray-200 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition duration-200 whitespace-nowrap ${
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export default TabNavigation;