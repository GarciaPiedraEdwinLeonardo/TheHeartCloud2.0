import { FaUsers, FaArrowRight } from 'react-icons/fa';

function TopicsList({ temas, onTopicClick }) {
  const truncateText = (text, maxLength = 150) => {
    if (!text) return 'Sin descripción';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const handleTopicClick = (topic) => {
    if (onTopicClick) {
      onTopicClick(topic);
    }
  };

  return (
    <div className="space-y-4">
      {temas.map((tema) => (
        <div 
          key={tema.id} 
          className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition duration-200 cursor-pointer group"
          onClick={() => handleTopicClick(tema)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <FaUsers className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition duration-200 break-words">
                  {tema.nombre}
                </h3>
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed break-words">
                {truncateText(tema.description, 150)}
              </p>
            </div>
            
            <FaArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition duration-200 flex-shrink-0 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default TopicsList;