import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Mock Data
const CATEGORIES = [
  { id: '1', name: 'Service', icon: 'wrench-outline' },
  { id: '2', name: 'Oli', icon: 'water-outline' },
  { id: '3', name: 'Ban', icon: 'disc-outline' },
  { id: '4', name: 'Sparepart', icon: 'cog-outline' },
  { id: '5', name: 'Aksesoris', icon: 'sunglasses-outline' },
];

const PRODUCTS = [
  {
    id: '1',
    name: 'Ganti Oli MPX2',
    price: 'Rp 45.000',
    description: 'Oli mesin matic terbaik',
    image: 'https://placehold.co/400x400/10B981/FFFFFF/png?text=Oli+MPX2',
  },
  {
    id: '2',
    name: 'Service Ringan',
    price: 'Rp 35.000',
    description: 'Pengecekan 15 poin',
    image: 'https://placehold.co/400x400/3B82F6/FFFFFF/png?text=Service',
  },
  {
    id: '3',
    name: 'Kampas Rem',
    price: 'Rp 65.000',
    description: 'Depan / Belakang',
    image: 'https://placehold.co/400x400/F59E0B/FFFFFF/png?text=Kampas',
  },
  {
    id: '4',
    name: 'Ban Tubeless',
    price: 'Rp 210.000',
    description: 'Ring 14 IRC/FDR',
    image: 'https://placehold.co/400x400/EF4444/FFFFFF/png?text=Ban',
  },
];

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState('Service');

  const renderCategory = ({ item }: { item: any }) => {
    const isActive = activeCategory === item.name;
    return (
      <TouchableOpacity
        style={[styles.glassPill, isActive && styles.glassPillActive]}
        onPress={() => setActiveCategory(item.name)}
      >
        <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.glassCard} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <TouchableOpacity style={styles.glassFavoriteBtn}>
          <Ionicons name="heart-outline" size={20} color="#1F1F1F" />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDesc} numberOfLines={1}>{item.description}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{item.price}</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background Blobs for Glassmorphism Effect */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.glassButton}>
          <Ionicons name="grid-outline" size={24} color="#1F1F1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kasir Utama</Text>
        <TouchableOpacity style={styles.glassButton}>
          <Ionicons name="cart-outline" size={24} color="#1F1F1F" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Modern Glass Headline Area */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Bengkel <Text style={styles.italicSerif}>Modern</Text>
          </Text>
          <Text style={styles.heroStart}>
            Solusi Servis & Sparepart Terpercaya
          </Text>
        </View>

        {/* Glass Categories */}
        <View style={styles.categoriesSection}>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategory}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 0 }}
          />
        </View>

        {/* Product Grid */}
        <View style={styles.productsGrid}>
          {PRODUCTS.map((prod) => (
            <View key={prod.id} style={styles.productWrapper}>
              {renderProduct({ item: prod })}
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F2', // Soft Off-White Background
    paddingHorizontal: 20,
  },
  // Background Blobs
  blob1: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FCD34D', // Yellow/Gold
    opacity: 0.4,
  },
  blob2: {
    position: 'absolute',
    top: 100,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#F87171', // Red/Orange
    opacity: 0.2,
  },
  blob3: {
    position: 'absolute',
    bottom: 50,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#60A5FA', // Blue
    opacity: 0.15,
  },

  // Glass Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
    zIndex: 10,
  },
  glassButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Glassy
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },

  // Hero
  heroSection: {
    marginBottom: 30,
    paddingHorizontal: 4,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '300',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  italicSerif: {
    fontStyle: 'italic',
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  heroStart: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    maxWidth: '80%',
  },

  // Categories
  categoriesSection: {
    marginBottom: 30,
  },
  glassPill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.35)', // Glassy
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    marginRight: 10,
  },
  glassPillActive: {
    backgroundColor: '#1F2937', // Active is solid dark
    borderColor: '#1F2937',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },

  // Grid
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: (width - 50) / 2,
    marginBottom: 20,
  },
  glassCard: {
    borderRadius: 24,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.55)', // Stronger Glass
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#BDC3C7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  imageContainer: {
    height: 130,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  glassFavoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)', // Works on web, ignored on native
  },
  productInfo: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
