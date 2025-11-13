function DateDisplay({ fecha }) {
  return (
    <p className="text-sm text-gray-400">
      {new Date(fecha).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}
    </p>
  );
}

export default DateDisplay;