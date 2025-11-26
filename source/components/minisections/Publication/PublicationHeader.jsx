import TopicBadge from '../InfoComponents/TopicBadge';
import UserHeader from './../InfoComponents/UserHeader';
import DateDisplay from './../InfoComponents/DateDisplay';
import JoinButton from './../../buttons/JoinButton';

function PublicationHeader({ tema, userName, userRole, fecha }) {
  const handleJoin = () => {
    console.log(`Unirse al tema: ${tema}`);
    // Aquí iría la lógica para unirse al tema
  };

  return (
    <div className="p-6 border-b border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="mb-2">
            <TopicBadge tema={tema} color="green" />
          </div>
          <UserHeader userName={userName} userRole={userRole} />
        </div>
        
        {/* Botón Unirse a la derecha */}
        <JoinButton onJoin={handleJoin} />
      </div>
      <DateDisplay fecha={fecha} />
    </div>
  );
}

export default PublicationHeader;