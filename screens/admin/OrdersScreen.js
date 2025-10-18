import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const ordersCollection = collection(db, 'orders');
      const ordersSnapshot = await getDocs(ordersCollection);
      const ordersList = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort orders by date (newest first)
      ordersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(ordersList);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Greška', 'Nije moguće učitati porudžbine');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date() }
          : order
      ));
      
      Alert.alert('Uspešno', 'Status porudžbine je ažuriran');
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert('Greška', 'Nije moguće ažurirati status porudžbine');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9500';
      case 'processing': return '#007AFF';
      case 'shipped': return '#34c759';
      case 'delivered': return '#30d158';
      case 'cancelled': return '#ff3b30';
      default: return '#8e8e93';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Na čekanju';
      case 'processing': return 'U obradi';
      case 'shipped': return 'Poslato';
      case 'delivered': return 'Dostavljeno';
      case 'cancelled': return 'Otkazano';
      default: return 'Nepoznato';
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Porudžbina #{item.id.slice(-8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.orderDate}>
        {new Date(item.createdAt).toLocaleDateString('sr-RS')} - {new Date(item.createdAt).toLocaleTimeString('sr-RS')}
      </Text>
      
      <Text style={styles.customerInfo}>
        Kupac: {item.customerEmail || 'Gost korisnik'}
      </Text>
      
      <Text style={styles.totalAmount}>
        Ukupno: {item.totalAmount} RSD
      </Text>
      
      <View style={styles.itemsContainer}>
        <Text style={styles.itemsTitle}>Proizvodi:</Text>
        {item.items.map((product, index) => (
          <Text key={index} style={styles.itemText}>
            • {product.name} x{product.quantity} - {product.price * product.quantity} RSD
          </Text>
        ))}
      </View>
      
      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.processButton]}
            onPress={() => updateOrderStatus(item.id, 'processing')}
          >
            <Text style={styles.actionButtonText}>U obradi</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => updateOrderStatus(item.id, 'cancelled')}
          >
            <Text style={styles.actionButtonText}>Otkaži</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {item.status === 'processing' && (
        <TouchableOpacity 
          style={[styles.actionButton, styles.shipButton]}
          onPress={() => updateOrderStatus(item.id, 'shipped')}
        >
          <Text style={styles.actionButtonText}>Označi kao poslato</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Učitavanje porudžbina...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nema porudžbina</Text>
        <Text style={styles.emptySubtext}>Porudžbine će se prikazati ovde kada ih korisnici naprave</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  customerInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  itemsContainer: {
    marginBottom: 15,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  processButton: {
    backgroundColor: '#007AFF',
  },
  shipButton: {
    backgroundColor: '#34c759',
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

