import { FaFile, FaComment, FaUsers, FaSearch } from 'react-icons/fa';

function EmptyState({ type = 'default', message }) {
  const getIcon = () => {
    switch (type) {
      case 'publicaciones':
        return <FaFile className="w-12 h-12" />;
      case 'comentarios':
        return <FaComment className="w-12 h-12" />;
      case 'temas':
        return <FaUsers className="w-12 h-12" />;
      default:
        return <FaSearch className="w-12 h-12" />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'publicaciones':
        return 'Aún no has creado ninguna publicación';
      case 'comentarios':
        return 'Aún no has realizado ningún comentario';
      case 'temas':
        return 'Aún no te has unido a ninguna comunidad';
      default:
        return message || 'No hay datos para mostrar';
    }
  };

  const getSuggestion = () => {
    switch (type) {
      case 'publicaciones':
        return 'Comienza compartiendo tus conocimientos con la comunidad';
      case 'comentarios':
        return 'Participa en las discusiones de otros profesionales';
      case 'temas':
        return 'Explora comunidades de tu especialidad y únete';
      default:
        return '';
    }
  };

  return (
    <div className="text-center py-12 px-4">
      <div className="text-gray-300 mb-4 flex justify-center">
        {getIcon()}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {getDefaultMessage()}
      </h3>
      {getSuggestion() && (
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          {getSuggestion()}
        </p>
      )}
    </div>
  );
}

export default EmptyState;