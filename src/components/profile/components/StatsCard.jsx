function StatsCard({ 
  icon, 
  title, 
  value, 
  description, 
  color = 'bg-gray-50', 
  borderColor = 'border-gray-200',
  size = 'medium'
}) {
  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-5'
  };

  const textSize = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  };

  return (
    <div className={`${color} border ${borderColor} rounded-lg ${sizeClasses[size]} transition duration-200 hover:shadow-sm`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
      </div>
      
      <div className={`font-bold text-gray-900 ${textSize[size]} mb-1`}>
        {value.toLocaleString()}
      </div>
      
      {description && (
        <div className="text-xs text-gray-600">
          {description}
        </div>
      )}
    </div>
  );
}

export default StatsCard;