import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import admin screens
import ProductManagementScreen from './admin/ProductManagementScreen';
import AddProductScreen from './admin/AddProductScreen';
import EditProductScreen from './admin/EditProductScreen';
import OrdersScreen from './admin/OrdersScreen';
import AdminProfileScreen from './admin/AdminProfileScreen';
// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ProductsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProductList" 
        component={ProductManagementScreen}
        options={{ title: 'Proizvodi', headerShown: false }}
      />
      <Stack.Screen 
        name="EditProduct" 
        component={EditProductScreen}
        options={{ title: 'Izmeni  proizvod' }}
      />
    </Stack.Navigator>
  );
}

export default function AdminApp() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Products') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'AddProduct') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Products" 
        component={ProductsStack}
        options={{ title: 'Proizvodi' }}
      />
      <Tab.Screen 
        name="AddProduct" 
        component={AddProductScreen}
        options={{ title: 'Dodaj proizvod' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{ title: 'Porudžbine' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={AdminProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

