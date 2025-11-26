import PublicationsList from "./../Publication/PublicationList";
import CommentsList from "./../Comments/CommentsList";
import TopicsList from "../InfoComponents/TopicsList";

function TabContent({ activeTab, userData }) {
  return (
    <div className="p-4 sm:p-6">
      {activeTab === 'publicaciones' && <PublicationsList publicaciones={userData.publicaciones} />}
      {activeTab === 'comentarios' && <CommentsList comentarios={userData.comentarios} />}
      {activeTab === 'temas' && <TopicsList temas={userData.temasParticipacion} />}
    </div>
  );
}

export default TabContent;