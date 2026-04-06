import { useMemo } from 'react';

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function MonthNav({ articles, activeYear, activeMonth, onSelectYear, onSelectMonth }) {
  const { years, monthsWithData } = useMemo(() => {
    const yrs = new Set();
    const mwd = {};
    articles.forEach(a => {
      const [y, m] = a.month.split('-');
      yrs.add(y);
      if (!mwd[y]) mwd[y] = new Set();
      mwd[y].add(m);
    });
    return {
      years: [...yrs].sort().reverse(),
      monthsWithData: mwd,
    };
  }, [articles]);

  return (
    <nav className="month-nav">
      <div className="month-nav-inner">
        <div className="year-tabs">
          <button
            className={`year-tab ${!activeYear ? 'active' : ''}`}
            onClick={() => onSelectYear(null)}
          >
            Tous
          </button>
          {years.map(y => (
            <button
              key={y}
              className={`year-tab ${activeYear === y ? 'active' : ''}`}
              onClick={() => onSelectYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
        {activeYear && (
          <div className="month-pills">
            {MONTH_LABELS.map((label, i) => {
              const m = String(i + 1).padStart(2, '0');
              const hasData = monthsWithData[activeYear]?.has(m);
              const isActive = activeMonth === m;
              return (
                <button
                  key={m}
                  className={`month-pill ${isActive ? 'active' : ''} ${hasData ? 'has-data' : 'disabled'}`}
                  onClick={() => hasData && onSelectMonth(isActive ? null : m)}
                  disabled={!hasData}
                >
                  {label}
                  {hasData && <span className="month-dot" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
