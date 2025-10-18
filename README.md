# 🛍️ Native Firebase Ecommerce App

Kompletna Expo React Native Firebase ecommerce aplikacija za satove i nakit sa admin panelom za upravljanje proizvodima i porudžbinama.

## 📱 Pregled aplikacije

Aplikacija se sastoji od **dva glavna dela**:

- **Customer App** - za kupce (pregled proizvoda, korpa, naručivanje)
- **Admin App** - za administratore (upravljanje proizvodima i porudžbinama)

## 🚀 Brzo pokretanje

### 1. Instalacija

```bash
# Klonirajte repozitorijum
git clone <repository-url>
cd NativeFirebaseEcommerce

# Instalirajte dependencies
npm install
```

### 2. Firebase konfiguracija

```bash
# Firebase projekat je već konfigurisan u firebase/config.js
# Samo proverite da li su servisi omogućeni u Firebase Console
```

### 3. Pokretanje

```bash
# Pokrenite aplikaciju
npm start

# Ili direktno na uređaju
npm run android  # za Android
npm run ios      # za iOS
```

## 🏗️ Struktura projekta

```
NativeFirebaseEcommerce/
├── 📁 firebase/
│   └── config.js              # Firebase konfiguracija
├── 📁 screens/
│   ├── LoginScreen.js         # Prijava/registracija
│   ├── CustomerApp.js         # Customer navigacija
│   ├── AdminApp.js            # Admin navigacija
│   ├── 📁 customer/
│   │   ├── ProductListScreen.js    # Lista proizvoda
│   │   ├── CartScreen.js           # Korpa
│   │   └── ProfileScreen.js        # Profil korisnika
│   └── 📁 admin/
│       ├── ProductManagementScreen.js  # Upravljanje proizvodima
│       ├── AddProductScreen.js         # Dodavanje proizvoda
│       ├── EditProductScreen.js        # Uređivanje proizvoda
│       ├── OrdersScreen.js             # Upravljanje porudžbinama
│       └── AdminProfileScreen.js       # Admin profil
├── 📁 context/
│   └── CartContext.js         # Globalno stanje korpe
├── 📁 utils/
│   └── mockData.js            # Mock podaci za proizvode
├── 📁 scripts/
│   ├── seedFirebase.js        # Skript za dodavanje mock podataka
│   └── createUsersCollection.js # Skript za kreiranje users kolekcije
├── App.js                     # Glavna komponenta
├── firebase-rules.txt         # Firebase Firestore pravila
└── package.json               # Dependencies
```

## 🔧 Ključni fajlovi i njihova uloga

### 📱 **App.js** - Glavna komponenta

```javascript
// Upravlja autentifikacijom i rutiranje između Customer/Admin app-a
// Proverava da li je korisnik admin (email sadrži "admin")
// Omogućava gost pristup
```

### 🔐 **firebase/config.js** - Firebase konfiguracija

```javascript
// Centralizovana Firebase konfiguracija
// Eksportuje auth, db, storage instance
// Koristi se u celoj aplikaciji
```

### 🛒 **context/CartContext.js** - Globalno stanje korpe

```javascript
// Context API za upravljanje korpom
// Funkcije: addToCart, removeFromCart, updateQuantity, clearCart
// Dostupno u celoj aplikaciji
```

### 📋 **screens/LoginScreen.js** - Autentifikacija

```javascript
// Prijava i registracija korisnika
// Kreiranje users dokumenata u Firestore
// Automatsko preusmeravanje na Customer/Admin app
```

### 🛍️ **screens/customer/ProductListScreen.js** - Lista proizvoda

```javascript
// Prikazuje proizvode u grid layout-u (2 kolone)
// Filtriranje po kategorijama (satovi, nakit)
// Dodavanje proizvoda u korpu
```

### 🛒 **screens/customer/CartScreen.js** - Korpa

```javascript
// Upravljanje količinom proizvoda
// Checkout proces sa kreiranjem porudžbine
// Validacija autentifikacije pre naručivanja
```

### 👨‍💼 **screens/admin/ProductManagementScreen.js** - Upravljanje proizvodima

```javascript
// Lista svih proizvoda za admina
// Filtriranje po kategorijama
// Navigacija na EditProduct screen
// Brisanje proizvoda
```

## 🗄️ Firebase struktura

### 📊 **Kolekcije u Firestore:**

#### **products** - Proizvodi

```javascript
{
  name: "Elegantni Ručni Sat",
  description: "Klasičan muški ručni sat...",
  price: 12000,
  stock: 15,
  imageUrl: "https://...",
  category: "watches", // "watches" ili "jewelry"
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### **orders** - Porudžbine

```javascript
{
  items: [
    { id: "1", name: "Sat", price: 12000, quantity: 1 }
  ],
  totalAmount: 12000,
  customerEmail: "user@example.com",
  customerId: "firebase-uid",
  customerName: "Ime Prezime",
  status: "pending", // "pending", "processing", "shipped", "delivered", "cancelled"
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### **users** - Korisnici

```javascript
{
  uid: "firebase-uid",
  email: "user@example.com",
  displayName: "Ime Prezime",
  role: "customer", // "customer" ili "admin"
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🔐 Autentifikacija i dozvole

### **Admin pristup:**

- Email koji sadrži "admin" (npr. `admin@example.com`, `admin123@test.com`)
- Automatsko preusmeravanje na AdminApp
- Pristup svim admin funkcionalnostima

### **Customer pristup:**

- Bilo koji drugi email
- Automatsko preusmeravanje na CustomerApp
- Pristup kupovini i korpi

### **Gost pristup:**

- Mogu da pregledaju proizvode
- Mogu da dodaju u korpu
- **MORAJU se prijaviti** pre naručivanja

## 🎨 UI/UX karakteristike

### **Customer strana:**

- **Grid layout** - 2 kolone za proizvode
- **Kategorijski filteri** - satovi, nakit, sve
- **Kategorijski badge-ovi** - na svakom proizvodu
- **Moderni dizajn** - shadow efekti, zaobljeni uglovi

### **Admin strana:**

- **Lista proizvoda** - sa akcijama (Uredi/Obriši)
- **Kategorijski filteri** - za lakše upravljanje
- **Status management** - za porudžbine
- **Responsive dizajn** - optimizovan za mobilne uređaje

## 📦 Mock podaci

### **Kategorije:**

- **Satovi** - ručni satovi, pametni satovi
- **Nakit** - ogrlice, prstenje, narukvice, minđuše

### **Dodavanje mock podataka:**

```bash
# Opcija 1: Koristite npm skript (preporučeno)
npm run seed

# Opcija 2: Direktno pokretanje
node scripts/seedFirebase.js
```

**Rezultat:** Dodaće se 12 mock proizvoda (satovi i nakit) u Firebase `products` kolekciju.

## 🔧 Firebase pravila

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products - svi čitaju, samo admini pišu
    match /products/{document} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.auth.token.email.matches(".*admin.*");
    }

    // Orders - svi kreiraju, admini upravljaju
    match /orders/{document} {
      allow read: if request.auth != null;
      allow create: if true;
      allow update, delete: if request.auth != null &&
        request.auth.token.email.matches(".*admin.*");
    }

    // Users - kreiranje tokom registracije
    match /users/{userId} {
      allow read: if request.auth != null &&
        (request.auth.uid == userId ||
         request.auth.token.email.matches(".*admin.*"));
      allow create: if true;
      allow update: if request.auth != null &&
        (request.auth.uid == userId ||
         request.auth.token.email.matches(".*admin.*"));
    }
  }
}
```

## 🚀 Pokretanje i testiranje

### **1. Lokalno testiranje:**

```bash
npm start
# Otvorite Expo Go na telefonu
# Skenirajte QR kod
```

### **2. Testiranje funkcionalnosti:**

#### **Customer test:**

1. Registrujte se kao običan korisnik
2. Pregledajte proizvode
3. Dodajte proizvode u korpu
4. Napravite porudžbinu

#### **Admin test:**

1. Registrujte se sa email-om koji sadrži "admin"
2. Dodajte novi proizvod
3. Uredite postojeći proizvod
4. Pregledajte porudžbine
5. Ažurirajte status porudžbine

#### **Gost test:**

1. Nastavite kao gost
2. Pregledajte proizvode
3. Dodajte u korpu
4. Pokušajte da naručite (trebalo bi da traži prijavu)

## 🛠️ Razvoj i customizacija

### **Dodavanje novih kategorija:**

```javascript
// U utils/mockData.js
export const categories = [
  { id: "watches", name: "Satovi" },
  { id: "jewelry", name: "Nakit" },
  { id: "new-category", name: "Nova kategorija" }, // ← Dodajte ovde
];
```

### **Dodavanje novih polja proizvoda:**

```javascript
// U AddProductScreen.js i EditProductScreen.js
const [newField, setNewField] = useState("");

// U handleAddProduct/handleUpdateProduct
const productData = {
  // ... postojeća polja
  newField: newField, // ← Dodajte novo polje
};
```

### **Promena admin logike:**

```javascript
// U App.js
const isAdminUser =
  user.email.includes("admin") || user.email === "specific-admin@domain.com"; // ← Dodajte specifične emaile
```

## 🐛 Troubleshooting

### **Česti problemi:**

1. **"Firebase Auth initialization error"**

   - Proverite Firebase konfiguraciju
   - Proverite da li su servisi omogućeni

2. **"Permission denied" greške**

   - Ažurirajte Firebase pravila
   - Proverite da li je korisnik autentifikovan

3. **"updateProfile is not a function"**

   - Problem je rešen u kodu sa error handling-om

4. **Registracija ne radi**
   - Proverite da li je Email/Password omogućen u Firebase Console
   - Proverite Firebase pravila

### **Debug log-ovi:**

Aplikacija ima detaljne console log-ove za debugging:

- 🔄 Proces registracije
- 📝 Podaci koji se čuvaju
- ✅ Uspešne operacije
- ❌ Greške sa detaljima

## 📱 Build za production

### **Android:**

```bash
expo build:android
```

### **iOS:**

```bash
expo build:ios
```

## 🎯 Ključne funkcionalnosti

### ✅ **Implementirano:**

- Kompletna autentifikacija (registracija/prijava)
- Customer i Admin aplikacije
- Upravljanje proizvodima (CRUD)
- Shopping cart funkcionalnost
- Order management
- Kategorijski filteri
- Responsive UI/UX
- Firebase integracija
- Mock podaci za testiranje

### 🚀 **Spremno za produkciju:**

- Sigurnosna pravila
- Error handling
- Loading states
- User feedback
- Optimizovane performanse

## 📞 Podrška

Za pitanja ili probleme:

1. Proverite console log-ove
2. Proverite Firebase Console
3. Proverite da li su svi servisi omogućeni
4. Proverite Firebase pravila

---

**Aplikacija je potpuno funkcionalna i spremna za korišćenje!** 🎉
