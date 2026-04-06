import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

function getDb() {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getFirestore(app);
}

const STARS_DOC = 'config/stars';

import { verifyAuth } from './_auth.js';

export default async function handler(req, res) {
  if (!verifyAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getDb();
  const ref = doc(db, 'config', 'stars');

  if (req.method === 'GET') {
    const snap = await getDoc(ref);
    const ids = snap.exists() ? snap.data().ids || [] : [];
    return res.status(200).json(ids);
  }

  if (req.method === 'POST') {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'Missing ids array' });
    }
    await setDoc(ref, { ids });
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
