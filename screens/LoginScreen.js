import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Greška', 'Molimo unesite email i lozinku');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user is admin (you can modify this logic)
      const isAdmin = email.includes('admin') || email === 'admin@example.com';
      
      if (isAdmin) {
        navigation.replace('AdminApp');
      } else {
        navigation.replace('CustomerApp');
      }
    } catch (error) {
      Alert.alert('Greška pri prijavi', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Greška', 'Molimo popunite sva polja');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Greška', 'Lozinke se ne poklapaju');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Greška', 'Lozinka mora imati najmanje 6 karaktera');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Step 2: Update user profile with display name
      try {
        if (userCredential.user && userCredential.user.updateProfile) {
          await userCredential.user.updateProfile({
            displayName: name
          });
        }
      } catch (profileError) {
        // Continue with registration even if profile update fails
      }

      // Step 3: Create user document in Firestore
      try {
        const userData = {
          uid: userCredential.user.uid,
          email: email,
          displayName: name,
          createdAt: new Date(),
          updatedAt: new Date(),
          role: email.includes('admin') ? 'admin' : 'customer',
          isActive: true,
        };
        
        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      } catch (firestoreError) {
        // This is not critical - user can still use the app
      }

      // Registration successful - show success message
      Alert.alert('Uspešno', 'Nalog je kreiran! Sada se možete prijaviti.', [
        {
          text: 'OK',
          onPress: () => {
            setIsRegistering(false);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setName('');
          }
        }
      ]);
      
    } catch (error) {
      // Only show error if Firebase Authentication fails
      let errorMessage = 'Greška pri kreiranju naloga';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email je već u upotrebi';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Neispravan email format';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Lozinka je previše slaba';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Registracija nije dozvoljena. Kontaktirajte administratora.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Greška mreže. Proverite internet konekciju.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Previše pokušaja. Pokušajte kasnije.';
      }
      
      Alert.alert('Greška', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    navigation.replace('CustomerApp');
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>E-Commerce App</Text>
          <Text style={styles.subtitle}>
            {isRegistering ? 'Kreirajte novi nalog' : 'Prijavite se ili nastavite kao gost'}
          </Text>

          <View style={styles.form}>
            {isRegistering && (
              <TextInput
                style={styles.input}
                placeholder="Ime i prezime"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Lozinka"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {isRegistering && (
              <TextInput
                style={styles.input}
                placeholder="Potvrdite lozinku"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            )}

            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={isRegistering ? handleRegister : handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading 
                  ? (isRegistering ? 'Kreiranje...' : 'Prijavljivanje...') 
                  : (isRegistering ? 'Kreiraj nalog' : 'Prijavi se')
                }
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={toggleMode}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                {isRegistering ? 'Već imate nalog? Prijavite se' : 'Nemate nalog? Registrujte se'}
              </Text>
            </TouchableOpacity>

            {!isRegistering && (
              <TouchableOpacity 
                style={[styles.button, styles.guestButton]} 
                onPress={handleGuestLogin}
              >
                <Text style={[styles.buttonText, styles.guestButtonText]}>
                  Nastavi kao gost
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.adminInfo}>
            <Text style={styles.adminText}>
              Admin pristup: admin@example.com / 123456
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  form: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#d25f5fff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d25f5fff',
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#d25f5fff',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButtonText: {
    color: '#d25f5fff',
  },
  guestButtonText: {
    color: '#d25f5fff',
  },
  adminInfo: {
    alignItems: 'center',
  },
  adminText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

