import TopicBadge from './../InfoComponents/TopicBadge';
import UserHeader from './../InfoComponents/UserHeader';
import DateDisplay from './../InfoComponents/DateDisplay';

function CommentHeader({ 
  tema, 
  publicacionTitulo, 
  usuarioComentarista, 
  usuarioPost, 
  rolComentarista, 
  fecha 
}) {
  return (
    <div className="p-6 border-b border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          {/* Tema y Publicación */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <TopicBadge tema={tema} color="green" />
            <span className="text-gray-400">→</span>
            <span className="text-sm text-gray-600 font-medium">
              {publicacionTitulo}
            </span>
          </div>
          
          {/* Información de interacción */}
          <div className="mb-3">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">{usuarioComentarista || 'Tú'}</span>
              {' '}ha comentado a{' '}
              <span className="font-semibold text-blue-600">{usuarioPost}</span>
            </p>
          </div>
          
          {/* Usuario que comenta */}
          <UserHeader
            userName={usuarioComentarista || 'Tú'}
            userRole={rolComentarista || 'Comentarista'}
          />
        </div>
      </div>
      
      <DateDisplay fecha={fecha} />
    </div>
  );
}

export default CommentHeader;