import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { categories } from '../../utils/mockData';

export default function EditProductScreen({ route, navigation }) {
  const { productId } = route.params;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('watches');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      if (productDoc.exists()) {
        const productData = productDoc.data();
        setName(productData.name || '');
        setDescription(productData.description || '');
        setPrice(productData.price?.toString() || '');
        setStock(productData.stock?.toString() || '');
        setImageUrl(productData.imageUrl || '');
        setCategory(productData.category || 'watches');
      } else {
        Alert.alert('Greška', 'Proizvod nije pronađen');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Greška', 'Nije moguće učitati proizvod');
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Greška', 'Potrebna je dozvola za pristup galeriji');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Greška', 'Nije moguće otvoriti galeriju. Možete uneti URL slike umesto toga.');
    }
  };

  const handleUpdateProduct = async () => {
    if (!name || !description || !price || !stock) {
      Alert.alert('Greška', 'Molimo popunite sva polja');
      return;
    }

    if (isNaN(price) || isNaN(stock)) {
      Alert.alert('Greška', 'Cena i zaliha moraju biti brojevi');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl: imageUrl || 'https://via.placeholder.com/300x200?text=No+Image',
        category: category,
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, 'products', productId), productData);
      
      Alert.alert('Uspešno', 'Proizvod je ažuriran!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Greška', 'Nije moguće ažurirati proizvod');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Učitavanje proizvoda...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Uredi proizvod</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Naziv proizvoda"
          value={name}
          onChangeText={setName}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Opis proizvoda"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Cena (RSD)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Zaliha"
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
        />

        <Text style={styles.sectionTitle}>Kategorija</Text>
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                category === cat.id && styles.selectedCategoryButton
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={[
                styles.categoryButtonText,
                category === cat.id && styles.selectedCategoryButtonText
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Slika proizvoda</Text>
        
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>Izaberi sliku iz galerije</Text>
        </TouchableOpacity>
        
        <Text style={styles.orText}>ILI</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Unesite URL slike"
          value={imageUrl}
          onChangeText={setImageUrl}
        />
        
        {imageUrl ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => setImageUrl('')}
            >
              <Text style={styles.removeImageText}>Ukloni sliku</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity 
          style={[styles.updateButton, loading && styles.disabledButton]} 
          onPress={handleUpdateProduct}
          disabled={loading}
        >
          <Text style={styles.updateButtonText}>
            {loading ? 'Ažuriranje...' : 'Ažuriraj proizvod'}
          </Text>
        </TouchableOpacity>
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
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  imageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
    fontWeight: 'bold',
  },
  imagePreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  removeImageButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  removeImageText: {
    color: 'white',
    fontSize: 14,
  },
  updateButton: {
    backgroundColor: '#34c759',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
});
