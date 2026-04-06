export default function NewsletterPanel({ articles, stars }) {
  const starred = articles.filter(a => stars.includes(a.id));
  if (starred.length === 0) return null;

  return (
    <div className="newsletter-panel">
      <h3 className="newsletter-title">⭐ Sélection Newsletter ({starred.length} article{starred.length > 1 ? 's' : ''})</h3>
      <ul className="newsletter-list">
        {starred.map(a => (
          <li key={a.id} className="newsletter-item">
            <span className="nl-journal" data-journal={a.journal}>{a.journal}</span>
            <span className="nl-title">{a.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
