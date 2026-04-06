import { useMemo } from 'react';

const THEME_EMOJIS = {
  'Recherche Clinique': '🏥',
  'Biologie & Résorption': '🧬',
  'Instrumentation': '⚙️',
  'Irrigation & Désinfection': '💧',
  'Anatomie & Diagnostic': '📐',
  'Régénération': '🧪',
  'Diagnostic & Imagerie': '📊',
  'Non classé': '📄',
};

export default function ThemeChips({ articles, activeTheme, onSelectTheme }) {
  const themeCounts = useMemo(() => {
    const counts = {};
    articles.forEach(a => {
      counts[a.theme] = (counts[a.theme] || 0) + 1;
    });
    return counts;
  }, [articles]);

  const themes = Object.keys(themeCounts).sort();

  return (
    <div className="theme-chips">
      {themes.map(theme => (
        <button
          key={theme}
          className={`theme-chip ${activeTheme === theme ? 'active' : ''}`}
          onClick={() => onSelectTheme(activeTheme === theme ? null : theme)}
        >
          <span className="chip-emoji">{THEME_EMOJIS[theme] || '📄'}</span>
          <span className="chip-label">{theme}</span>
          <span className="chip-count">{themeCounts[theme]}</span>
        </button>
      ))}
    </div>
  );
}
