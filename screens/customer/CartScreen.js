import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { useCart } from '../../context/CartContext';

export default function CartScreen({ navigation }) {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Korpa je prazna', 'Dodajte proizvode u korpu pre nego što nastavite sa kupovinom');
      return;
    }

    // Optional: Check if user is logged in (commented out to allow guests)
    // if (!auth.currentUser) {
    //   Alert.alert(
    //     'Potrebna je prijava',
    //     'Morate se prijaviti da biste mogli da napravite porudžbinu.',
    //     [
    //       { text: 'Otkaži', style: 'cancel' },
    //       { 
    //         text: 'Prijavi se', 
    //         onPress: () => navigation.navigate('Login')
    //       }
    //     ]
    //   );
    //   return;
    // }

    Alert.alert(
      'Potvrda kupovine',
      `Ukupna cena: ${getTotalPrice()} RSD\n\nDa li želite da nastavite sa kupovinom?`,
      [
        { text: 'Otkaži', style: 'cancel' },
        { 
          text: 'Potvrdi', 
          onPress: async () => {
            try {
              // Create order in Firestore
              const orderData = {
                items: cartItems,
                totalAmount: getTotalPrice(),
                customerEmail: auth.currentUser?.email || 'guest@example.com',
                customerId: auth.currentUser?.uid || 'guest',
                customerName: auth.currentUser?.displayName || 'Gost korisnik',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              await addDoc(collection(db, 'orders'), orderData);
              
              clearCart();
              Alert.alert('Uspešno', 'Vaša porudžbina je poslata!');
            } catch (error) {
              console.error('Error creating order:', error);
              if (error.code === 'permission-denied') {
                Alert.alert(
                  'Greška dozvola', 
                  'Nije moguće kreirati porudžbinu. Molimo kontaktirajte administratora ili pokušajte ponovo kasnije.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Greška', 'Nije moguće poslati porudžbinu. Pokušajte ponovo.');
              }
            }
          }
        }
      ]
    );
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image 
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/80' }} 
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price} RSD</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantity}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeFromCart(item.id)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Vaša korpa je prazna</Text>
        <Text style={styles.emptySubtext}>Dodajte proizvode da nastavite sa kupovinom</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.checkoutContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Ukupno: {getTotalPrice()} RSD</Text>
        </View>
        
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Nastavi sa kupovinom</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    padding: 15,
  },
  cartItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#007AFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#ff4444',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkoutContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalContainer: {
    marginBottom: 15,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
