import { Product, useShop } from '@/context/ShopContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const CATEGORIES = [
    { id: '1', name: 'Service', icon: 'wrench-outline' },
    { id: '2', name: 'Oli', icon: 'water-outline' },
    { id: '3', name: 'Ban', icon: 'disc-outline' },
    { id: '4', name: 'Sparepart', icon: 'cog-outline' },
];

export default function KasirScreen() {
    const [activeCategory, setActiveCategory] = useState('Service');
    const [isCartVisible, setIsCartVisible] = useState(false);

    const navigation = useNavigation();
    const { products, cart, addToCart, removeFromCart, checkout } = useShop();
    const { colors, theme } = useTheme();

    const filteredProducts = products.filter(p => p.category === activeCategory || (activeCategory === 'Sparepart' && (p.category !== 'Service' && p.category !== 'Oli' && p.category !== 'Ban')));

    const renderCategory = ({ item }: { item: any }) => {
        const isActive = activeCategory === item.name;
        return (
            <TouchableOpacity
                style={[styles.glassPill, { backgroundColor: isActive ? colors.pillActive : colors.pill, borderColor: colors.cardBorder }]}
                onPress={() => setActiveCategory(item.name)}
            >
                <Text style={[styles.categoryText, { color: isActive ? '#FFFFFF' : colors.text }]}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={[styles.glassCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            activeOpacity={0.8}
            onPress={() => addToCart(item)}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                {item.stock <= 5 && item.category !== 'Service' && (
                    <View style={[styles.stockBadge, { backgroundColor: colors.danger }]}>
                        <Text style={styles.stockText}>Sisa {item.stock}</Text>
                    </View>
                )}
            </View>
            <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.productPrice, { color: colors.text }]}>Rp {item.price.toLocaleString()}</Text>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={() => addToCart(item)}>
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const handleCheckout = () => {
        Alert.alert(
            "Konfirmasi Pembayaran",
            `Total: Rp ${cart.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}`,
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Bayar", onPress: () => {
                        checkout();
                        setIsCartVisible(false);
                        Alert.alert("Sukses", "Transaksi berhasil disimpan!");
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.blob1, { backgroundColor: colors.blob1 }]} />
            <View style={[styles.blob2, { backgroundColor: colors.blob2 }]} />

            <View style={styles.header}>
                <TouchableOpacity style={[styles.glassButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]} onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
                    <Ionicons name="menu-outline" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Kasir</Text>
                <TouchableOpacity style={[styles.glassButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]} onPress={() => setIsCartVisible(true)}>
                    <View>
                        <Ionicons name="cart-outline" size={24} color={colors.text} />
                        {cart.length > 0 && (
                            <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                                <Text style={styles.badgeText}>{cart.reduce((s, i) => s + i.quantity, 0)}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.heroSection}>
                    <Text style={[styles.heroTitle, { color: colors.text }]}>Bengkel <Text style={styles.italicSerif}>Modern</Text></Text>
                    <Text style={[styles.heroStart, { color: colors.textSecondary }]}>Pilih kategori barang dibawah.</Text>
                </View>

                <View style={styles.categoriesSection}>
                    <FlatList
                        data={CATEGORIES}
                        renderItem={renderCategory}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    />
                </View>

                <View style={styles.productsGrid}>
                    {filteredProducts.map((prod) => (
                        <View key={prod.id} style={styles.productWrapper}>
                            {renderProduct({ item: prod })}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Cart Modal */}
            <Modal visible={isCartVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF' }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Keranjang Belanja</Text>
                            <TouchableOpacity onPress={() => setIsCartVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ maxHeight: height * 0.5 }}>
                            {cart.length === 0 ? (
                                <Text style={{ textAlign: 'center', margin: 20, color: colors.textSecondary }}>Keranjang Kosong</Text>
                            ) : (
                                cart.map((item) => (
                                    <View key={item.id} style={[styles.cartItem, { borderBottomColor: colors.cardBorder }]}>
                                        <Text style={{ flex: 1, fontWeight: '500', color: colors.text }}>{item.name} x{item.quantity}</Text>
                                        <Text style={{ fontWeight: '600', color: colors.text }}>Rp {(item.price * item.quantity).toLocaleString()}</Text>
                                        <TouchableOpacity onPress={() => removeFromCart(item.id)} style={{ marginLeft: 10 }}>
                                            <Ionicons name="trash-outline" size={20} color={colors.danger} />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </ScrollView>

                        <View style={[styles.modalFooter, { borderTopColor: colors.cardBorder }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>Total</Text>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>Rp {cart.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.checkoutBtn, { backgroundColor: colors.primary }, cart.length === 0 && { opacity: 0.5 }]}
                                onPress={handleCheckout}
                                disabled={cart.length === 0}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Bayar Sekarang</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20 },
    blob1: { position: 'absolute', top: -50, left: -50, width: 200, height: 200, borderRadius: 100, opacity: 0.5 },
    blob2: { position: 'absolute', top: 100, right: -80, width: 250, height: 250, borderRadius: 125, opacity: 0.3 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 10, zIndex: 10 },
    glassButton: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '600' },
    heroSection: { marginBottom: 30, paddingHorizontal: 4 },
    heroTitle: { fontSize: 36, fontWeight: '300' },
    italicSerif: { fontStyle: 'italic', fontWeight: '400', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    heroStart: { marginTop: 8, fontSize: 14 },
    categoriesSection: { marginBottom: 30 },
    glassPill: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, borderWidth: 1, marginRight: 10 },
    categoryText: { fontSize: 14, fontWeight: '500' },
    productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    productWrapper: { width: (width - 50) / 2, marginBottom: 20 },
    glassCard: { borderRadius: 24, padding: 10, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
    imageContainer: { height: 130, borderRadius: 20, backgroundColor: '#F1F5F9', marginBottom: 12, overflow: 'hidden' },
    productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    stockBadge: { position: 'absolute', top: 5, left: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    stockText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    productInfo: { paddingHorizontal: 4, paddingBottom: 4 },
    productName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    productPrice: { fontSize: 14, fontWeight: '600' },
    addButton: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    badge: { position: 'absolute', top: -5, right: -5, borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, minHeight: 400 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, paddingBottom: 15 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    modalFooter: { marginTop: 20, borderTopWidth: 1, paddingTop: 20 },
    checkoutBtn: { padding: 16, borderRadius: 16, alignItems: 'center' },
});
