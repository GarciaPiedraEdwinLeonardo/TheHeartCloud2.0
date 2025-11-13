import { FaFlag } from "react-icons/fa";

function ReportButton({ onReport, title = "Reportar" }) {
  return (
    <button
      onClick={onReport}
      className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition duration-200"
      title={title}
    >
      <FaFlag className="w-5 h-5" />
    </button>
  );
}

export default ReportButton;