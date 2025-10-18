const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc } = require('firebase/firestore');
const { mockProducts } = require('../utils/mockData.js');

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

async function clearExistingProducts() {
  try {
    console.log('🗑️  Brišem postojeće proizvode...');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    let deletedCount = 0;
    
    for (const productDoc of productsSnapshot.docs) {
      await deleteDoc(doc(db, 'products', productDoc.id));
      deletedCount++;
    }
    
    console.log(`✅ Obrisano ${deletedCount} postojećih proizvoda`);
  } catch (error) {
    console.error('❌ Greška pri brisanju postojećih proizvoda:', error);
    throw error;
  }
}

async function seedFirebase() {
  try {
    console.log('🌱 Počinje dodavanje mock podataka u Firebase...');
    console.log(`📊 Ukupno proizvoda za dodavanje: ${mockProducts.length}`);
    
    // Prvo obriši postojeće proizvode
    await clearExistingProducts();
    
    // Zatim dodaj nove proizvode sa specifičnim ID-jem
    let addedCount = 0;
    for (const product of mockProducts) {
      await setDoc(doc(db, 'products', product.id), {
        ...product,
        createdAt: new Date(),
      });
      addedCount++;
      console.log(`✅ (${addedCount}/${mockProducts.length}) Dodat proizvod: ${product.name} (ID: ${product.id})`);
    }
    
    console.log('🎉 Uspešno dodano svih proizvoda u Firebase!');
    console.log(`📊 Ukupno dodano: ${addedCount} proizvoda`);
    console.log('💡 Možete sada da testirate aplikaciju sa mock podacima!');
    
  } catch (error) {
    console.error('❌ Greška pri dodavanju podataka:', error);
    console.error('💡 Proverite da li su Firebase pravila ispravno postavljena');
  }
}

// Pokreni skript
seedFirebase();
