function JoinButton({ onJoin, isJoined = false }) {
  return (
    <button
      onClick={onJoin}
      className={`
        px-4 py-2 rounded-lg font-medium transition duration-200 shadow-sm hover:shadow-md
        ${isJoined 
          ? 'bg-green-600 text-white hover:bg-green-700' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
        }
      `}
    >
      {isJoined ? 'Unido' : 'Unirse'}
    </button>
  );
}

export default JoinButton;