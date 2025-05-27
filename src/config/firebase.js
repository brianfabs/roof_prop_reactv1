import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKGIcQ8AktI_beAawHh8WbBLKcfsIkf3A",
  authDomain: "roofing-sales-app-76397.firebaseapp.com",
  projectId: "roofing-sales-app-76397",
  storageBucket: "roofing-sales-app-76397.firebasestorage.app",
  messagingSenderId: "568368669108",
  appId: "1:568368669108:web:de2ee1b80b3cd082f3d2e1",
  measurementId: "G-YNSBK3CRLH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app; 