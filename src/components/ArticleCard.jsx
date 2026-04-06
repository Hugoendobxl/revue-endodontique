const JOURNAL_COLORS = {
  JOE: { color: '#6366F1', bg: 'rgba(99,102,241,.07)' },
  IEJ: { color: '#F59E0B', bg: 'rgba(245,158,11,.07)' },
  AEJ: { color: '#10B981', bg: 'rgba(16,185,129,.07)' },
  EEJ: { color: '#EC4899', bg: 'rgba(236,72,153,.07)' },
};

export default function ArticleCard({ article, isStarred, onToggleStar, showMonth }) {
  const jc = JOURNAL_COLORS[article.journal] || JOURNAL_COLORS.JOE;

  return (
    <article className="article-card" style={{ '--journal-color': jc.color }}>
      <div className="card-bar" style={{ backgroundColor: jc.color }} />
      <div className="card-header">
        <div className="card-badges">
          <span className="badge journal-badge" style={{ color: jc.color, backgroundColor: jc.bg }}>
            {article.journal}
          </span>
          <span className="badge type-badge">{article.type}</span>
          {showMonth && <span className="badge month-badge">{article.month}</span>}
        </div>
        <button
          className={`star-btn ${isStarred ? 'starred' : ''}`}
          onClick={() => onToggleStar(article.id)}
          aria-label="Toggle favori"
        >
          {isStarred ? '⭐' : '☆'}
        </button>
      </div>
      <h2 className="card-title">{article.title}</h2>
      <p className="card-authors">{article.authors}</p>
      <p className="card-summary">{article.summary}</p>
      {article.takeaway && (
        <div className="card-takeaway" style={{ borderLeftColor: jc.color }}>
          <span className="takeaway-label">À retenir →</span> {article.takeaway}
        </div>
      )}
      <p className="card-meta">
        {article.doi && <>DOI: {article.doi}</>}
        {article.pages && <> · pp. {article.pages}</>}
      </p>
    </article>
  );
}
