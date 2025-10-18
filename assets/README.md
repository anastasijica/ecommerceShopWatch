# Assets Directory

Ovaj direktorijum sadrži sve statičke fajlove za aplikaciju.

## Potrebni fajlovi

Za potpunu funkcionalnost aplikacije, dodajte sledeće fajlove:

- `icon.png` - App ikona (1024x1024px)
- `splash.png` - Splash screen slika
- `adaptive-icon.png` - Android adaptive icon
- `favicon.png` - Web favicon

## Generisanje ikona

Možete koristiti Expo CLI za generisanje ikona:

```bash
npx expo install expo-splash-screen
npx expo install expo-app-loading
```

Ili koristiti online alate kao što su:

- [App Icon Generator](https://appicon.co/)
- [Expo Icon Generator](https://docs.expo.dev/guides/app-icons/)

## Placeholder slike

Aplikacija koristi placeholder slike za proizvode kada nema sliku:

- Format: `https://via.placeholder.com/300x200?text=Product+Name`
- Možete zameniti sa vašim slikama

