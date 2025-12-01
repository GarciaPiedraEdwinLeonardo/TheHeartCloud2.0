import PublicationsList from "./PublicationList";
import CommentsList from "./CommentsList";
import TopicsList from "./TopicsList";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";

function TabContent({ activeTab, userData, onTopicClick, onCommentClick, onShowForum }) {
  const isLoading = !userData;

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner message={`Cargando ${activeTab}...`} />
      </div>
    );
  }

  const getContent = () => {
    switch (activeTab) {
      case 'publicaciones':
        return userData.publicaciones && userData.publicaciones.length > 0 ? (
          <PublicationsList 
            publicaciones={userData.publicaciones} 
            onCommentClick={onCommentClick}
            onShowForum={onShowForum}
          />
        ) : (
          <EmptyState type="publicaciones" />
        );
      
      case 'comentarios':
        return userData.comentarios && userData.comentarios.length > 0 ? (
          <CommentsList comentarios={userData.comentarios} />
        ) : (
          <EmptyState type="comentarios" />
        );
      
      case 'temas':
        return userData.temasParticipacion && userData.temasParticipacion.length > 0 ? (
          <TopicsList temas={userData.temasParticipacion} onTopicClick={onTopicClick} />
        ) : (
          <EmptyState type="temas" />
        );
      
      default:
        return <EmptyState />;
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {getContent()}
    </div>
  );
}

export default TabContent;