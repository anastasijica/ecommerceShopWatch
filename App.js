import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

// Import screens
import LoginScreen from './screens/LoginScreen';
import CustomerApp from './screens/CustomerApp';
import AdminApp from './screens/AdminApp';
import { CartProvider } from './context/CartContext';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Check if user is admin
        const isAdminUser = user.email.includes('admin') || user.email === 'admin@example.com';
        setIsAdmin(isAdminUser);
      } else {
        setIsAdmin(false);
      }
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Učitavanje...</Text>
      </View>
    );
  }

  return (
    <CartProvider>
      <PaperProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator 
            initialRouteName={user ? (isAdmin ? "AdminApp" : "CustomerApp") : "Login"}
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
            />
            <Stack.Screen 
              name="CustomerApp" 
              component={CustomerApp}
            />
            <Stack.Screen 
              name="AdminApp" 
              component={AdminApp}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
