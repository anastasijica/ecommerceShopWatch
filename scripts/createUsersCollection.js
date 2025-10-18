const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

// Firebase config
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
const db = getFirestore(app);

// Sample users data
const sampleUsers = [
  {
    uid: 'admin-user-001',
    email: 'admin@example.com',
    displayName: 'Admin Korisnik',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: 'customer-user-001',
    email: 'customer@example.com',
    displayName: 'Test Korisnik',
    role: 'customer',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

async function createUsersCollection() {
  try {
    console.log('🌱 Kreiranje users kolekcije...');
    
    for (const user of sampleUsers) {
      await setDoc(doc(db, 'users', user.uid), user);
      console.log(`✅ Kreiran korisnik: ${user.displayName} (${user.email})`);
    }
    
    console.log('🎉 Uspešno kreirana users kolekcija!');
    console.log(`📊 Ukupno kreirano: ${sampleUsers.length} korisnika`);
    
  } catch (error) {
    console.error('❌ Greška pri kreiranju users kolekcije:', error);
  }
}

// Pokreni skript
createUsersCollection();
