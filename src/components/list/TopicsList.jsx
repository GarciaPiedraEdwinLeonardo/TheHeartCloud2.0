import TopicCard from "../cards/TopicCard";

function TopicsList({ temas }) {
  return (
    <div className="space-y-4">
      {temas.map(tema => (
        <TopicCard key={tema.id} tema={tema} />
      ))}
    </div>
  );
}

export default TopicsList;