function TopicBadge({ tema, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    purple: "bg-purple-100 text-purple-800",
    red: "bg-red-100 text-red-800"
  };

  return (
    <div className={`inline-block ${colorClasses[color]} px-3 py-1 rounded-full text-sm font-medium`}>
      {tema}
    </div>
  );
}

export default TopicBadge;