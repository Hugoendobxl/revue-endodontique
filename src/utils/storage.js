import { initialArticles } from '../data/initialArticles';

function authHeaders(extra = {}) {
  const token = localStorage.getItem('endo-token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

// ===== ARTICLES =====

export async function loadArticles() {
  const res = await fetch('/api/articles', { headers: authHeaders() });
  if (!res.ok) throw new Error('Unauthorized');
  const articles = await res.json();
  if (articles.length === 0) {
    await seedArticles();
    return [...initialArticles];
  }
  return articles;
}

async function seedArticles() {
  await fetch('/api/articles', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ articles: initialArticles }),
  });
}

export async function addArticles(newArticles, existingArticles) {
  const existingDois = new Set(existingArticles.map(a => a.doi).filter(Boolean));
  const existingTitles = new Set(existingArticles.map(a => a.title.substring(0, 60)));

  const unique = newArticles.filter(a => {
    if (a.doi && existingDois.has(a.doi)) return false;
    if (existingTitles.has(a.title.substring(0, 60))) return false;
    return true;
  });

  if (unique.length > 0) {
    await fetch('/api/articles', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ articles: unique }),
    });
  }

  return { added: unique.length, total: existingArticles.length + unique.length, addedArticles: unique };
}

export async function updateArticle(id, fields) {
  await fetch('/api/articles', {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ id, fields }),
  });
}

// ===== STARS =====

export async function loadStars() {
  const res = await fetch('/api/stars', { headers: authHeaders() });
  if (!res.ok) throw new Error('Unauthorized');
  return await res.json();
}

export async function toggleStar(id, currentStars) {
  const idx = currentStars.indexOf(id);
  const newStars = [...currentStars];
  if (idx === -1) {
    newStars.push(id);
  } else {
    newStars.splice(idx, 1);
  }
  await fetch('/api/stars', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ids: newStars }),
  });
  return newStars;
}
