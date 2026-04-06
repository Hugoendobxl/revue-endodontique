import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAo4SNkKqk814E6yeL4KmV8KB0tSADCpwI",
  authDomain: "revue-endodontique.firebaseapp.com",
  projectId: "revue-endodontique",
  storageBucket: "revue-endodontique.firebasestorage.app",
  messagingSenderId: "207865903610",
  appId: "1:207865903610:web:0d5cf53113c13010eecc43"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
