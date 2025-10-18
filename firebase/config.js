import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBFdFtA3GUBh7GCxtfd_peiDi5x6oZUOag",
  authDomain: "ecommerce-app-6fc03.firebaseapp.com",
  projectId: "ecommerce-app-6fc03",
  storageBucket: "ecommerce-app-6fc03.firebasestorage.app",
  messagingSenderId: "1051673128217",
  appId: "1:1051673128217:web:e65a6e9dbc45d3d1942988"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
