import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../firebase/config';
import { categories } from '../../utils/mockData';

export default function ProductManagementScreen() {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchProducts = async () => {
    try {
      const productsCollection = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Greška', 'Nije moguće učitati proizvode');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Nepoznato';
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handleDeleteProduct = (productId, productName) => {
    Alert.alert(
      'Obriši proizvod',
      `Da li ste sigurni da želite da obrišete "${productName}"?`,
      [
        { text: 'Otkaži', style: 'cancel' },
        { 
          text: 'Obriši', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'products', productId));
              setProducts(products.filter(product => product.id !== productId));
              Alert.alert('Uspešno', 'Proizvod je obrisan');
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Greška', 'Nije moguće obrisati proizvod');
            }
          }
        }
      ]
    );
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <Image 
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/100' }} 
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{getCategoryName(item.category)}</Text>
          </View>
        </View>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.productDetails}>
          <Text style={styles.productPrice}>{item.price.toLocaleString()} RSD</Text>
          <Text style={styles.productStock}>Zaliha: {item.stock || 0}</Text>
        </View>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            navigation.navigate('EditProduct', { productId: item.id });
          }}
        >
          <Text style={styles.actionButtonText}>Uredi</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(item.id, item.name)}
        >
          <Text style={styles.actionButtonText}>Obriši</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Učitavanje proizvoda...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filtriraj po kategoriji:</Text>
        <View style={styles.categoryFilter}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategory === 'all' && styles.selectedFilterButton
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[
              styles.filterButtonText,
              selectedCategory === 'all' && styles.selectedFilterButtonText
            ]}>
              Sve
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterButton,
                selectedCategory === category.id && styles.selectedFilterButton
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedCategory === category.id && styles.selectedFilterButtonText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {selectedCategory === 'all' 
                ? 'Nema proizvoda' 
                : `Nema proizvoda u kategoriji "${getCategoryName(selectedCategory)}"`}
            </Text>
          </View>
        }
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
  filterContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  categoryFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedFilterButton: {
    backgroundColor: '#d25f5fff',
    borderColor: '#d25f5fff',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  selectedFilterButtonText: {
    color: 'white',
  },
  listContainer: {
    padding: 15,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  categoryBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 10,
    color: '#1976d2',
    fontWeight: '600',
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#d25f5fff',
  },
  productStock: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 5,
    minWidth: 60,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#d25f5fff',
  },
  deleteButton: {
    backgroundColor: '#5a5656ff',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

