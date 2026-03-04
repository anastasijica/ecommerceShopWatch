import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      if (productDoc.exists()) {
        setProduct({ id: productDoc.id, ...productDoc.data() });
      } else {
        Alert.alert('Greška', 'Proizvod nije pronađen');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Greška', 'Greška pri učitavanju proizvoda');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      Alert.alert(
        'Uspešno dodato',
        `${product.name} je dodato u korpu (${quantity} kom)`,
        [
          {
            text: 'Nastavi kupovinu',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Idi u korpu',
            onPress: () => navigation.navigate('Cart'),
          },
        ]
      );
    }
  };

  const getCategoryName = (categoryId) => {
    const categories = {
      watches: 'Satovi',
      necklaces: 'Ogrlice',
      rings: 'Prstenje',
      bracelets: 'Narukvice',
      earrings: 'Minđuše',
    };
    return categories[categoryId] || categoryId;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Učitavanje proizvoda...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Proizvod nije pronađen</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Nazad</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{getCategoryName(product.category)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.productName}>{product.name}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{product.price.toLocaleString()} RSD</Text>
          <View style={styles.stockContainer}>
            <Text style={styles.stockLabel}>Na stanju:</Text>
            <Text style={[styles.stock, { color: product.stock > 10 ? '#4CAF50' : product.stock > 0 ? '#FF9800' : '#F44336' }]}>
              {product.stock} kom
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Količina:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.quantityButton, quantity >= product.stock && styles.quantityButtonDisabled]}
              onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={quantity >= product.stock}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addToCartButton, product.stock === 0 && styles.addToCartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        >
          <Text style={styles.addToCartButtonText}>
            {product.stock === 0 ? 'Nema na stanju' : 'Dodaj u korpu'}
          </Text>
        </TouchableOpacity>

        <View style={styles.productInfo}>
          <Text style={styles.infoTitle}>Informacije o proizvodu</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kategorija:</Text>
            <Text style={styles.infoValue}>{getCategoryName(product.category)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID proizvoda:</Text>
            <Text style={styles.infoValue}>{product.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dodato:</Text>
            <Text style={styles.infoValue}>
              {product.createdAt?.toDate?.()?.toLocaleDateString('sr-RS') || 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#d25f5fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: 'white',
    marginBottom: 10,
  },
  productImage: {
    width: width,
    height: width * 0.8,
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    lineHeight: 30,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d25f5fff',
  },
  stockContainer: {
    alignItems: 'flex-end',
  },
  stockLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  stock: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 25,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#d25f5fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#ccc',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#d25f5fff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 25,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  productInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});
