import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDEyKNqRvvFNNKXx1cT0RElQfvxL-I48VY",
  authDomain: "ecommercefirebasereact.firebaseapp.com",
  projectId: "ecommercefirebasereact",
  storageBucket: "ecommercefirebasereact.firebasestorage.app",
  messagingSenderId: "122556819707",
  appId: "1:122556819707:web:36bece96d243c0be60e85e",
  measurementId: "G-SYMJN5TX6M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
