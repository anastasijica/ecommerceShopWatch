# 🚀 Brzo pokretanje aplikacije

## ✅ Aplikacija je spremna!

### **Kako da testirate aplikaciju:**

#### **1. Mobilna verzija (preporučeno)**

1. **Instalirajte Expo Go** na telefon:

   - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Skenirajte QR kod** koji se prikazuje u terminalu

3. **Aplikacija će se otvoriti** na vašem telefonu

#### **2. Web verzija**

- Otvorite browser i idite na: `http://localhost:8081`

---

## 🔐 Testiranje funkcionalnosti

### **Admin App (Administrator)**

**Kredencijali:**

- Email: `admin@example.com`
- Password: `admin123`

**Funkcionalnosti:**

- ✅ Dodavanje proizvoda
- ✅ Upravljanje proizvodima
- ✅ Pregled porudžbina
- ✅ Ažuriranje statusa porudžbina

### **User App (Kupac)**

**Opcije:**

- Kliknite "Nastavi kao gost"
- Ili se prijavite sa bilo kojim email-om (bez "admin")

**Funkcionalnosti:**

- ✅ Pregled proizvoda
- ✅ Dodavanje u korpu
- ✅ Checkout proces
- ✅ Profil korisnika

---

## 🎯 Test scenario

### **Korak 1: Admin setup**

1. Prijavite se kao admin
2. Idite na "Dodaj proizvod"
3. Dodajte nekoliko proizvoda za testiranje

### **Korak 2: User testiranje**

1. Odjavite se ili pokrenite aplikaciju ponovo
2. Nastavite kao gost
3. Pregledajte proizvode koje ste dodali
4. Dodajte proizvode u korpu
5. Napravite porudžbinu

### **Korak 3: Admin upravljanje**

1. Prijavite se ponovo kao admin
2. Idite na "Porudžbine"
3. Proverite da li se porudžbina prikazuje
4. Ažurirajte status porudžbine

---

## 🔧 Firebase Setup (ako nije već urađeno)

1. **Idite na [Firebase Console](https://console.firebase.google.com/)**
2. **Kreirajte projekat** ili koristite postojeći
3. **Omogućite Authentication** (Email/Password)
4. **Kreirajte Firestore Database** (test mode)
5. **Ažurirajte `firebase/config.js`** sa vašim podacima

---

## 📱 Troubleshooting

### **Ako aplikacija ne radi:**

1. **Proverite Firebase konfiguraciju**
2. **Restartujte aplikaciju:** `npx expo start --clear`
3. **Koristite mobilnu verziju** umesto web

### **Ako ne možete da se prijavite:**

1. **Kreirajte admin korisnika** u Firebase Console
2. **Email:** admin@example.com
3. **Password:** admin123

---

## 🎉 Uspješno!

Aplikacija je potpuno funkcionalna ecommerce aplikacija sa:

- **Admin panelom** za upravljanje proizvodima
- **User aplikacijom** za kupovinu
- **Firebase backend-om** za podatke
- **Modernim UI-om** sa React Native Paper

**Srećno sa testiranjem!** 🛒✨
