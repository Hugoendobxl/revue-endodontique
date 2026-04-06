import { useMemo } from 'react';

export default function SearchFilters({ articles, search, onSearch, journalFilter, onJournalFilter, themeFilter, onThemeFilter, showStarsOnly, onToggleStars, starsCount }) {
  const themes = useMemo(() => {
    const set = new Set(articles.map(a => a.theme));
    return [...set].sort();
  }, [articles]);

  return (
    <div className="search-filters">
      <input
        type="text"
        className="search-input"
        placeholder="Rechercher un article, auteur, mot-clé..."
        value={search}
        onChange={e => onSearch(e.target.value)}
      />
      <div className="filters-row">
        <select
          className="filter-select"
          value={journalFilter}
          onChange={e => onJournalFilter(e.target.value)}
        >
          <option value="">Tous journaux</option>
          <option value="JOE">JOE</option>
          <option value="IEJ">IEJ</option>
          <option value="AEJ">AEJ</option>
          <option value="EEJ">EEJ</option>
        </select>
        <select
          className="filter-select"
          value={themeFilter}
          onChange={e => onThemeFilter(e.target.value)}
        >
          <option value="">Toutes thématiques</option>
          {themes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button
          className={`newsletter-btn ${showStarsOnly ? 'active' : ''}`}
          onClick={onToggleStars}
        >
          ⭐ Newsletter{starsCount > 0 ? ` (${starsCount})` : ''}
        </button>
      </div>
    </div>
  );
}
