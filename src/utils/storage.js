import { db } from './firebase';
import {
  collection, doc, getDocs, getDoc, setDoc, deleteDoc, onSnapshot, writeBatch
} from 'firebase/firestore';
import { initialArticles } from '../data/initialArticles';

const ARTICLES_COL = 'articles';
const STARS_DOC = doc(db, 'config', 'stars');

// ===== ARTICLES =====

export async function loadArticles() {
  const snap = await getDocs(collection(db, ARTICLES_COL));
  if (snap.empty) {
    await seedArticles();
    return [...initialArticles];
  }
  return snap.docs.map(d => d.data());
}

async function seedArticles() {
  const batch = writeBatch(db);
  for (const article of initialArticles) {
    batch.set(doc(db, ARTICLES_COL, article.id), article);
  }
  await batch.commit();
}

export async function addArticles(newArticles, existingArticles) {
  const existingDois = new Set(existingArticles.map(a => a.doi).filter(Boolean));
  const existingTitles = new Set(existingArticles.map(a => a.title.substring(0, 60)));

  const unique = newArticles.filter(a => {
    if (a.doi && existingDois.has(a.doi)) return false;
    if (existingTitles.has(a.title.substring(0, 60))) return false;
    return true;
  });

  const batch = writeBatch(db);
  for (const article of unique) {
    batch.set(doc(db, ARTICLES_COL, article.id), article);
  }
  await batch.commit();

  return { added: unique.length, total: existingArticles.length + unique.length };
}

export function subscribeArticles(callback) {
  return onSnapshot(collection(db, ARTICLES_COL), (snap) => {
    const articles = snap.docs.map(d => d.data());
    callback(articles);
  });
}

// ===== STARS =====

export async function loadStars() {
  const snap = await getDoc(STARS_DOC);
  return snap.exists() ? snap.data().ids || [] : [];
}

export async function toggleStar(id, currentStars) {
  const idx = currentStars.indexOf(id);
  const newStars = [...currentStars];
  if (idx === -1) {
    newStars.push(id);
  } else {
    newStars.splice(idx, 1);
  }
  await setDoc(STARS_DOC, { ids: newStars });
  return newStars;
}

export function subscribeStars(callback) {
  return onSnapshot(STARS_DOC, (snap) => {
    callback(snap.exists() ? snap.data().ids || [] : []);
  });
}
