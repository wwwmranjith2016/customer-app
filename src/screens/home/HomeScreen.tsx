import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import productService from '../../services/product.service';
import { Product } from '../../types';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useCart } from '../../contexts/CartContext';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const CAROUSEL_IMAGES = [
  'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800',
  'https://images.unsplash.com/photo-1588347818036-4c0b5e5e5e5e?w=800',
  'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800',
];

const CATEGORIES = [
  { id: 'chicken', name: 'Chicken', icon: '🐔' },
  { id: 'mutton', name: 'Mutton', icon: '🐏' },
  { id: 'egg', name: 'Egg', icon: '🥚' },
  { id: 'fish', name: 'Fish', icon: '🐟' },
];

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { getItemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('chicken');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        x: currentImageIndex * width,
        animated: true,
      });
    }
  }, [currentImageIndex]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const filteredProducts = products.filter(
    (product) => product.category.toLowerCase() === selectedCategory
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>₹{item.price}/{item.unit}</Text>
          {!item.available && (
            <Text style={styles.unavailable}>Out of Stock</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Icon name="cart-outline" size={24} color="#000" />
          {getItemCount() > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{getItemCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, getItemCount()]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
        >
          {CAROUSEL_IMAGES.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.carouselImage}
            />
          ))}
        </ScrollView>

        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesRow}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View
                  style={[
                    styles.categoryCircle,
                    selectedCategory === category.id && styles.categoryCircleActive,
                  ]}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                </View>
                <Text
                  style={[
                    styles.categoryName,
                    selectedCategory === category.id && styles.categoryNameActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.productsContainer}>
          <Text style={styles.sectionTitle}>
            {CATEGORIES.find((c) => c.id === selectedCategory)?.name} Products
          </Text>
          <View style={styles.productsGrid}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => (
                <View key={item.id} style={styles.productCardWrapper}>
                  {renderProduct({ item })}
                </View>
              ))
            ) : (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>
                  No {selectedCategory} products available
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  carousel: {
    height: 200,
  },
  carouselImage: {
    width: width,
    height: 200,
    resizeMode: 'cover',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  categoryItem: {
    alignItems: 'center',
    width: 80,
  },
  categoryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  categoryCircleActive: {
    backgroundColor: '#fff5f5',
    borderColor: '#e74c3c',
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  categoryNameActive: {
    color: '#e74c3c',
  },
  productsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 11,
    color: '#666',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  unavailable: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  cartButton: {
    marginRight: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default HomeScreen;
