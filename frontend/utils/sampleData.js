import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const sampleProducts = [
  {
    name: 'iPhone 14 Pro',
    description: 'Najnoviji iPhone sa naprednim kamerama i A16 Bionic čipom',
    price: 120000,
    stock: 10,
    imageUrl: 'https://via.placeholder.com/300x200?text=iPhone+14+Pro',
  },
  {
    name: 'Samsung Galaxy S23',
    description: 'Android telefon sa odličnim performansama i kamerom',
    price: 95000,
    stock: 15,
    imageUrl: 'https://via.placeholder.com/300x200?text=Samsung+Galaxy+S23',
  },
  {
    name: 'MacBook Air M2',
    description: 'Laptop sa M2 čipom, savršen za posao i kreativne projekte',
    price: 180000,
    stock: 5,
    imageUrl: 'https://via.placeholder.com/300x200?text=MacBook+Air+M2',
  },
  {
    name: 'AirPods Pro',
    description: 'Bežične slušalice sa aktivnim prigušivanjem buke',
    price: 25000,
    stock: 20,
    imageUrl: 'https://via.placeholder.com/300x200?text=AirPods+Pro',
  },
  {
    name: 'iPad Air',
    description: 'Tablet sa M1 čipom, idealan za rad i zabavu',
    price: 75000,
    stock: 8,
    imageUrl: 'https://via.placeholder.com/300x200?text=iPad+Air',
  },
  {
    name: 'Apple Watch Series 8',
    description: 'Pametni sat sa naprednim zdravstvenim funkcijama',
    price: 45000,
    stock: 12,
    imageUrl: 'https://via.placeholder.com/300x200?text=Apple+Watch+Series+8',
  },
];

export const seedSampleData = async () => {
  try {
    console.log('Seeding sample data...');
    
    for (const product of sampleProducts) {
      await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: new Date(),
      });
    }
    
    console.log('Sample data seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding sample data:', error);
    return false;
  }
};

