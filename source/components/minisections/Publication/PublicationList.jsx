import PublicationCard from "./../../cards/PublicationCard";

function PublicationsList({ publicaciones }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {publicaciones.map(publicacion => (
        <PublicationCard key={publicacion.id} publicacion={publicacion} />
      ))}
    </div>
  );
}

export default PublicationsList;