import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

function getDb() {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getFirestore(app);
}

export default async function handler(req, res) {
  const db = getDb();

  if (req.method === 'GET') {
    const snap = await getDocs(collection(db, 'articles'));
    const articles = snap.docs.map(d => d.data());
    return res.status(200).json(articles);
  }

  if (req.method === 'POST') {
    const { articles } = req.body;
    if (!articles || !Array.isArray(articles)) {
      return res.status(400).json({ error: 'Missing articles array' });
    }
    const batch = writeBatch(db);
    for (const article of articles) {
      batch.set(doc(db, 'articles', article.id), article);
    }
    await batch.commit();
    return res.status(200).json({ added: articles.length });
  }

  if (req.method === 'PATCH') {
    const { id, fields } = req.body;
    if (!id || !fields) {
      return res.status(400).json({ error: 'Missing id or fields' });
    }
    const { updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'articles', id), fields);
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
