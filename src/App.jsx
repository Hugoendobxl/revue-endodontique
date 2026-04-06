import { useState, useCallback, useMemo, useEffect } from 'react';
import Header from './components/Header';
import MonthNav from './components/MonthNav';
import SearchFilters from './components/SearchFilters';
import ThemeChips from './components/ThemeChips';
import ArticleCard from './components/ArticleCard';
import ImportZone from './components/ImportZone';
import NewsletterPanel from './components/NewsletterPanel';
import { loadArticles, loadStars, toggleStar, subscribeArticles, subscribeStars } from './utils/storage';

export default function App() {
  const [articles, setArticles] = useState([]);
  const [stars, setStars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [journalFilter, setJournalFilter] = useState('');
  const [themeFilter, setThemeFilter] = useState('');
  const [activeTheme, setActiveTheme] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [activeMonth, setActiveMonth] = useState(null);
  const [showStarsOnly, setShowStarsOnly] = useState(false);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    let unsubArticles;
    let unsubStars;

    async function init() {
      try {
        console.log('[ENDO] Starting init...');
        const arts = await loadArticles();
        console.log('[ENDO] Articles loaded:', arts.length);
        const st = await loadStars();
        console.log('[ENDO] Stars loaded:', st.length);
      } catch (e) {
        console.error('[ENDO] Init error:', e);
      }
      setLoading(false);

      unsubArticles = subscribeArticles((a) => {
        console.log('[ENDO] Subscribe articles:', a.length);
        setArticles(a);
      });
      unsubStars = subscribeStars((s) => {
        console.log('[ENDO] Subscribe stars:', s.length);
        setStars(s);
      });
    }
    init();

    return () => {
      if (unsubArticles) unsubArticles();
      if (unsubStars) unsubStars();
    };
  }, []);

  const handleToggleStar = useCallback(async (id) => {
    const newStars = await toggleStar(id, stars);
    setStars(newStars);
  }, [stars]);

  const filteredArticles = useMemo(() => {
    let result = articles;

    if (activeYear) {
      result = result.filter(a => a.month.startsWith(activeYear));
    }
    if (activeMonth) {
      result = result.filter(a => a.month.endsWith(`-${activeMonth}`));
    }
    if (journalFilter) {
      result = result.filter(a => a.journal === journalFilter);
    }
    const effectiveTheme = activeTheme || themeFilter;
    if (effectiveTheme) {
      result = result.filter(a => a.theme === effectiveTheme);
    }
    if (showStarsOnly) {
      result = result.filter(a => stars.includes(a.id));
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.authors.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        (a.takeaway || '').toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.theme.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => b.month.localeCompare(a.month));
  }, [articles, activeYear, activeMonth, journalFilter, themeFilter, activeTheme, showStarsOnly, stars, search]);

  const showMonth = !activeYear;

  if (loading) {
    return (
      <div className="app">
        <Header totalCount={0} />
        <p className="loading-text">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header totalCount={articles.length} />

      <div className="sticky-nav">
        <div className="nav-container">
          <MonthNav
            articles={articles}
            activeYear={activeYear}
            activeMonth={activeMonth}
            onSelectYear={(y) => { setActiveYear(y); setActiveMonth(null); }}
            onSelectMonth={setActiveMonth}
          />
          <button className="import-btn" onClick={() => setShowImport(true)}>
            + Importer
          </button>
        </div>
      </div>

      <main className="main-content">
        <SearchFilters
          articles={articles}
          search={search}
          onSearch={setSearch}
          journalFilter={journalFilter}
          onJournalFilter={setJournalFilter}
          themeFilter={themeFilter}
          onThemeFilter={setThemeFilter}
          showStarsOnly={showStarsOnly}
          onToggleStars={() => setShowStarsOnly(v => !v)}
          starsCount={stars.length}
        />

        <ThemeChips
          articles={filteredArticles}
          activeTheme={activeTheme}
          onSelectTheme={setActiveTheme}
        />

        <p className="results-count">
          {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
          {search && ` pour "${search}"`}
        </p>

        <div className="articles-list">
          {filteredArticles.map((article, i) => (
            <ArticleCard
              key={article.id}
              article={article}
              isStarred={stars.includes(article.id)}
              onToggleStar={handleToggleStar}
              showMonth={showMonth}
            />
          ))}
          {filteredArticles.length === 0 && (
            <p className="no-results">Aucun article trouvé.</p>
          )}
        </div>

        <NewsletterPanel articles={articles} stars={stars} />
      </main>

      {showImport && (
        <ImportZone
          articles={articles}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
