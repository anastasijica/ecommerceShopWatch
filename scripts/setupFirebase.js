

console.log(`
🔥 FIREBASE SETUP INSTRUCTIONS 🔥

1. KREIRANJE FIREBASE PROJEKTA:
   - Idite na https://console.firebase.google.com/
   - Kliknite "Create a project"
   - Unesite naziv projekta (npr. "native-ecommerce")
   - Omogućite Google Analytics (opciono)
   - Kliknite "Create project"

2. AUTHENTICATION SETUP:
   - U Firebase Console, idite na "Authentication"
   - Kliknite "Get started"
   - Idite na "Sign-in method" tab
   - Omogućite "Email/Password" provider
   - Kliknite "Save"

3. FIRESTORE DATABASE SETUP:
   - Idite na "Firestore Database"
   - Kliknite "Create database"
   - Izaberite "Start in test mode" (za development)
   - Izaberite lokaciju (najbližu vašoj)
   - Kliknite "Done"

4. STORAGE SETUP (opciono):
   - Idite na "Storage"
   - Kliknite "Get started"
   - Izaberite "Start in test mode"
   - Izaberite lokaciju
   - Kliknite "Next" i "Done"

5. WEB APP CONFIGURATION:
   - Idite na "Project settings" (zupčanik)
   - Scroll do "Your apps" sekcije
   - Kliknite na web ikonu (</>)
   - Unesite app nickname (npr. "Native Ecommerce")
   - Kliknite "Register app"
   - Kopirajte Firebase konfiguraciju

6. UPDATE CONFIG FILE:
   - Otvorite firebase/config.js
   - Zamenite placeholder vrednosti sa vašim Firebase config-om

7. SECURITY RULES (za production):
   
   Firestore Rules:
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       
       
       match /products/{document} {
         allow read: if true;
         allow write: if true; 
       }
       
       
       match /orders/{document} {
         allow read: if request.auth != null;
         allow create: if true; 
         allow update, delete: if request.auth != null && 
           request.auth.token.email.matches(".*admin.*");
       }
       
       // Users - dozvoli kreiranje tokom registracije
       match /users/{userId} {
         allow read: if request.auth != null && 
           (request.auth.uid == userId || 
            request.auth.token.email.matches(".*admin.*"));
         allow create: if true; 
         allow update: if request.auth != null && 
           (request.auth.uid == userId || 
            request.auth.token.email.matches(".*admin.*"));
         allow delete: if request.auth != null && 
           request.auth.token.email.matches(".*admin.*");
       }
     }
   }

   Storage Rules:
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null && 
           (request.auth.token.email.matches('.*admin.*') || 
            request.auth.token.email == 'admin@example.com');
       }
     }
   }

8. ADMIN USER CREATION:
   - U Authentication sekciji, idite na "Users" tab
   - Kliknite "Add user"
   - Email: admin@example.com
   - Password: admin123
   - Kliknite "Add user"

9. SAMPLE DATA:
   - Pokrenite aplikaciju
   - Prijavite se kao admin
   - Idite na "Dodaj proizvod" tab
   - Dodajte nekoliko proizvoda za testiranje

✅ SETUP COMPLETE!
`);

// Export za korišćenje u aplikaciji
export const firebaseSetupComplete = true;

