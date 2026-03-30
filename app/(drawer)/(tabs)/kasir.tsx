import { useTheme } from '@/context/ThemeContext';
import { Product, useShop } from '@/context/ShopContext';
import { MechanicDB, getMechanics } from '@/database/db';
import { getMechanicsSupa, getStoreSettingsSupa } from '@/services/supabaseService';
import { generateReceiptHtml } from '@/utils/receiptHtml';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import React, { useEffect, useState, useCallback } from 'react';
import { Alert, Dimensions, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import CartModal from '@/components/modals/CartModal';
import CheckoutSuccessModal from '@/components/modals/CheckoutSuccessModal';

const { width } = Dimensions.get('window');

export default function KasirScreen() {
    const { products, cart, addToCart, categories, paymentMethod, serviceFee, refreshData } = useShop();
    const navigation = useNavigation();
    const { colors } = useTheme();

    const [mechanicsList, setMechanicsList] = useState<MechanicDB[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('Semua');
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastTransactionId, setLastTransactionId] = useState<string>('');
    const [isScannerVisible, setIsScannerVisible] = useState(false);

    useEffect(() => {
        const loadMechanics = async () => {
            try {
                const remote = await getMechanicsSupa();
                if (remote && remote.length > 0) {
                    setMechanicsList(remote);
                    return;
                }
            } catch (supaErr) {
                console.log("Remote mechanics fail, falling back to local:", supaErr);
            }

            try {
                const local = await getMechanics();
                setMechanicsList(local || []);
            } catch (err) {
                console.error("Local mechanics load error:", err);
                setMechanicsList([]);
            }
        };
        loadMechanics();
    }, []);

    // Refresh products whenever user enters the Kasir screen
    useFocusEffect(
        useCallback(() => {
            refreshData();
        }, [])
    );

    useEffect(() => {
        if (categories.length > 0 && activeCategory === 'Semua') {
            // Keep it at 'Semua' by default to show everything
        }
    }, [categories]);

    useEffect(() => {
        if (activeCategory !== 'Semua' && activeCategory && categories.length > 0) {
            const exists = categories.find(c => c.name === activeCategory);
            if (!exists) {
                setActiveCategory('Semua');
            }
        }
    }, [categories, activeCategory]);

    const filteredProducts = activeCategory === 'Semua' 
        ? products 
        : products.filter(p => p.category === activeCategory);
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleBarcodeScanned = (data: string) => {
        setIsScannerVisible(false);
        const product = products.find(p => p.barcode === data || p.id === data);
        if (product) {
            addToCart(product);
            Alert.alert("Berhasil", `${product.name} ditambahkan ke keranjang.`);
        } else {
            Alert.alert("Produk Tidak Ditemukan", `Barcode: ${data} belum terdaftar.`);
        }
    };

    const handleCheckoutSuccess = (transactionId: string) => {
        setLastTransactionId(transactionId);
        setIsCartVisible(false);
        setShowSuccessModal(true);
    };

    const printReceipt = async () => {
        if (!lastTransactionId) return;

        let settings = null;
        try {
            settings = await getStoreSettingsSupa();
        } catch (e) {
            console.warn("Failed to fetch store settings for receipt, using defaults");
        }

        const now = new Date();
        const html = generateReceiptHtml(lastTransactionId, now, cart, totalAmount, serviceFee, paymentMethod, settings);

        try {
            await Print.printAsync({ html });
        } catch (error) {
            Alert.alert('Error', 'Gagal mencetak struk');
        }
    };

    const renderCategory = ({ item }: { item: any }) => {
        const isActive = activeCategory === item.name;
        let iconName: keyof typeof Ionicons.glyphMap = 'pricetag-outline';
        if (item.name.toLowerCase().includes('service')) iconName = 'construct-outline';
        else if (item.name.toLowerCase().includes('oli')) iconName = 'water-outline';
        else if (item.name.toLowerCase().includes('ban')) iconName = 'disc-outline';
        else if (item.name.toLowerCase().includes('sparepart')) iconName = 'cog-outline';

        return (
            <TouchableOpacity
                style={[styles.glassPill, { backgroundColor: isActive ? colors.pillActive : colors.pill, borderColor: colors.cardBorder }]}
                onPress={() => setActiveCategory(item.name)}
                activeOpacity={0.8}
            >
                <Ionicons name={iconName} size={14} color={isActive ? '#FFFFFF' : colors.text} style={{ marginRight: 8 }} />
                <Text style={[styles.categoryText, { color: isActive ? '#FFFFFF' : colors.text }]}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    const getCategoryIcon = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('service') || cat.includes('jasa')) return { name: 'construct', color: '#f59e0b' };
        if (cat.includes('oli') || cat.includes('oil')) return { name: 'water', color: '#10b981' };
        if (cat.includes('ban') || cat.includes('tire')) return { name: 'disc', color: '#6366f1' };
        if (cat.includes('sparepart') || cat.includes('part')) return { name: 'cog', color: '#8b5cf6' };
        if (cat.includes('aki') || cat.includes('battery')) return { name: 'battery-charging', color: '#ef4444' };
        if (cat.includes('filter')) return { name: 'funnel', color: '#14b8a6' };
        if (cat.includes('lampu') || cat.includes('light')) return { name: 'bulb', color: '#f59e0b' };
        return { name: 'cube', color: '#06b6d4' };
    };

    const renderProduct = ({ item }: { item: Product }) => {
        const categoryIcon = getCategoryIcon(item.category);

        return (
            <TouchableOpacity
                style={[styles.glassCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                activeOpacity={0.8}
                onPress={() => addToCart(item)}
            >
                <View style={styles.imageContainer}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.productImage} />
                    ) : (
                        <View style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: `${categoryIcon.color}15`,
                            overflow: 'hidden'
                        }}>
                            <View style={{ position: 'absolute', opacity: 0.1, transform: [{ rotate: '-15deg' }, { scale: 1.5 }] }}>
                                <Ionicons name={categoryIcon.name as any} size={120} color={categoryIcon.color} />
                            </View>
                            <View style={[styles.categoryIconBox, { backgroundColor: `${categoryIcon.color}25` }]}>
                                <Ionicons name={categoryIcon.name as any} size={32} color={categoryIcon.color} />
                            </View>
                        </View>
                    )}
                    {item.stock <= 5 && !item.category.includes('Service') && (
                        <View style={[styles.stockBadge, { backgroundColor: colors.danger }]}>
                            <Text style={styles.stockText}>Sisa {item.stock}</Text>
                        </View>
                    )}
                    <View style={[styles.categoryBadge, { backgroundColor: categoryIcon.color }]}>
                        <Ionicons name={categoryIcon.name as any} size={12} color="#FFF" />
                    </View>
                </View>
                <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                    <Text style={[styles.productPrice, { color: colors.text }]}>Rp {item.price.toLocaleString()}</Text>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={() => addToCart(item)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>


                <Text style={[styles.headerTitle, { color: colors.text }]}>Kasir</Text>
                
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity 
                        style={[styles.glassButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]} 
                        onPress={() => setIsScannerVisible(true)}
                    >
                        <Ionicons name="barcode-outline" size={20} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.glassButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]} onPress={() => setIsCartVisible(true)}>
                        <View>
                            <Ionicons name="cart-outline" size={20} color={colors.text} />
                            {cart.length > 0 && (
                                <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                                    <Text style={styles.badgeText}>{cart.reduce((s, i) => s + i.quantity, 0)}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={filteredProducts}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 160 }}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                ListHeaderComponent={
                    <View style={styles.categoriesSection}>
                        <FlatList
                            data={[{ id: 0, name: 'Semua' }, ...categories]}
                            renderItem={renderCategory}
                            keyExtractor={item => item.id.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                }
                ListEmptyComponent={
                    <View style={{ width: '100%', padding: 40, alignItems: 'center' }}>
                        <Ionicons name="cube-outline" size={80} color={colors.textSecondary} />
                        <Text style={{ marginTop: 16, color: colors.textSecondary, fontSize: 16 }}>Tidak ada produk</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.productWrapper}>
                        {renderProduct({ item })}
                    </View>
                )}
            />

            {cart.length > 0 && (
                <TouchableOpacity
                    style={[styles.floatingCartBar, { backgroundColor: colors.text }]}
                    onPress={() => setIsCartVisible(true)}
                    activeOpacity={0.9}
                >
                    <View style={styles.cartBarLeft}>
                        <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
                            <Ionicons name="cart" size={18} color="#FFF" />
                        </View>
                        <Text style={[styles.cartBarText, { color: colors.card }]}>
                            {cart.reduce((sum, item) => sum + item.quantity, 0)} item{cart.length > 1 ? 's' : ''} dipilih
                        </Text>
                    </View>
                    <Text style={[styles.cartBarPrice, { color: colors.card }]}>
                        Rp {totalAmount.toLocaleString()}
                    </Text>
                </TouchableOpacity>
            )}

            <CartModal 
                visible={isCartVisible}
                onClose={() => setIsCartVisible(false)}
                mechanicsList={mechanicsList}
                onCheckoutSuccess={handleCheckoutSuccess}
            />

            <CheckoutSuccessModal 
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                onPrint={printReceipt}
            />

            <BarcodeScannerModal 
                isVisible={isScannerVisible}
                onClose={() => setIsScannerVisible(false)}
                onScanned={handleBarcodeScanned}
            />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10, zIndex: 10 },
    glassButton: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '600' },
    categoriesSection: { marginBottom: 20 },
    glassPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, borderWidth: 1, marginRight: 10 },
    categoryText: { fontSize: 13, fontWeight: '500' },
    productWrapper: { width: (width - 44) / 2, marginBottom: 16 },
    glassCard: { borderRadius: 12, padding: 8, borderWidth: 1 },
    imageContainer: { height: 110, borderRadius: 12, backgroundColor: '#F1F5F9', marginBottom: 12, overflow: 'hidden' },
    productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    stockBadge: { position: 'absolute', top: 5, left: 5, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
    stockText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
    productInfo: { paddingHorizontal: 4, paddingBottom: 4 },
    productName: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
    productPrice: { fontSize: 13, fontWeight: '600' },
    addButton: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    badge: { position: 'absolute', top: -5, right: -5, borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
    badgeText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
    categoryBadge: { position: 'absolute', bottom: 8, right: 8, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FFF' },
    categoryIconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    
    floatingCartBar: { position: 'absolute', bottom: 100, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6 },
    cartBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cartBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    cartBarText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
    cartBarPrice: { fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
});
