import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyByfqtg7cffw6LbNO4eXEAUGSmBN2HWsJE",
  authDomain: "rahayu-asyhari.firebaseapp.com",
  projectId: "rahayu-asyhari",
  storageBucket: "rahayu-asyhari.firebasestorage.app",
  messagingSenderId: "503226709001",
  appId: "1:503226709001:web:8e404ad82ddddd6bd8b4d8",
  measurementId: "G-DJ2FLXEXBL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);