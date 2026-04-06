import { initialArticles } from '../data/initialArticles';

const ARTICLES_KEY = 'endo-articles';
const STARS_KEY = 'endo-stars';

export function getArticles() {
  const stored = localStorage.getItem(ARTICLES_KEY);
  if (!stored) {
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(initialArticles));
    return initialArticles;
  }
  return JSON.parse(stored);
}

export function saveArticles(articles) {
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
}

export function addArticles(newArticles) {
  const existing = getArticles();
  const existingDois = new Set(existing.map(a => a.doi).filter(Boolean));
  const existingTitles = new Set(existing.map(a => a.title.substring(0, 60)));

  const unique = newArticles.filter(a => {
    if (a.doi && existingDois.has(a.doi)) return false;
    if (existingTitles.has(a.title.substring(0, 60))) return false;
    return true;
  });

  const merged = [...existing, ...unique];
  saveArticles(merged);
  return { added: unique.length, total: merged.length };
}

export function getStars() {
  const stored = localStorage.getItem(STARS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function toggleStar(id) {
  const stars = getStars();
  const idx = stars.indexOf(id);
  if (idx === -1) {
    stars.push(id);
  } else {
    stars.splice(idx, 1);
  }
  localStorage.setItem(STARS_KEY, JSON.stringify(stars));
  return stars;
}
