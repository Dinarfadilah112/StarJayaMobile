import NotificationBell from '@/components/NotificationBell';
import { useNotifications } from '@/context/NotificationContext';
import { Product, useShop } from '@/context/ShopContext';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, FlatList, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, LayoutAnimation } from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import AddProductModal from '@/components/modals/AddProductModal';
import EditProductModal from '@/components/modals/EditProductModal';
import ManageCategoryModal from '@/components/modals/ManageCategoryModal';

export default function GudangScreen() {
    const navigation = useNavigation();
    const { products, categories, deleteProductData } = useShop();
    const { colors } = useTheme();
    const { isOwner } = useUser();
    const params = useLocalSearchParams();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [catModalVisible, setCatModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSearchScanning, setIsSearchScanning] = useState(false);
    const [showLowStockOnly, setShowLowStockOnly] = useState(params.filter === 'low_stock');

    // FAB States
    const [showFabMenu, setShowFabMenu] = useState(false);
    const [fabAnimation] = useState(new Animated.Value(0));

    useEffect(() => {
        if (params.filter === 'low_stock') {
            setShowLowStockOnly(true);
        }
    }, [params.filter]);

    const toggleFab = () => {
        const toValue = showFabMenu ? 0 : 1;
        setShowFabMenu(!showFabMenu);
        Animated.spring(fabAnimation, {
            toValue,
            useNativeDriver: true,
            friction: 5,
            tension: 40
        }).start();
    };

    const fabRotation = fabAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg']
    });

    const inventoryItems = products.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory ? item.category === activeCategory : true;
        const matchesLowStock = showLowStockOnly ? item.stock <= 5 && !item.category.includes('Service') : true;
        return matchesSearch && matchesCategory && matchesLowStock;
    });

    const handleSearchScanned = (data: string) => {
        setSearchQuery(data);
        setIsSearchScanning(false);
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Hapus Produk',
            `Apakah Anda yakin ingin menghapus ${name}?`,
            [
                { text: 'Batal', style: 'cancel' },
                { 
                    text: 'Hapus', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteProductData(id);
                        } catch (error) {
                            Alert.alert('Error', 'Gagal menghapus produk');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Product }) => {
        const isLowStock = item.stock <= 5 && !item.category.includes('Service');
        
        return (
            <Swipeable
                renderRightActions={() => (
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity 
                            onPress={() => {
                                setEditingProduct(item);
                                setEditModalVisible(true);
                            }}
                            style={{ backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', width: 70, height: '100%', marginBottom: 12, borderRadius: 16, marginLeft: 8 }}
                        >
                            <Ionicons name="pencil" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => handleDelete(item.id, item.name)}
                            style={{ backgroundColor: colors.danger, justifyContent: 'center', alignItems: 'center', width: 70, height: '100%', marginBottom: 12, borderRadius: 16, marginLeft: 8 }}
                        >
                            <Ionicons name="trash" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
            >
                <View style={[styles.glassItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                        <MaterialCommunityIcons 
                            name={item.category.includes('Service') ? 'wrench' : 'package-variant'} 
                            size={20} 
                            color={colors.primary} 
                        />
                    </View>
                    
                    <View style={styles.itemInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                            {item.rack && (
                                <View style={[styles.rackBadge, { backgroundColor: colors.pill, borderColor: colors.primary + '30' }]}>
                                    <Ionicons name="location-outline" size={10} color={colors.primary} />
                                    <Text style={[styles.rackText, { color: colors.primary }]}>{item.rack}</Text>
                                </View>
                            )}
                        </View>
                        
                        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 2 }}>
                            <View style={[styles.codeBadge, { backgroundColor: colors.pill }]}>
                                <Text style={[styles.codeText, { color: colors.textSecondary }]}>{item.id}</Text>
                            </View>
                            <Text style={[styles.brandText, { color: colors.textSecondary }]}>• {item.category}</Text>
                        </View>
                    </View>

                    <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                        <View style={[styles.stockBadge, { 
                            backgroundColor: isLowStock ? colors.danger + '15' : colors.success + '15',
                            borderColor: isLowStock ? colors.danger + '30' : colors.success + '30'
                        }]}>
                            <Ionicons 
                                name={isLowStock ? 'alert-circle' : 'cube-outline'} 
                                size={14} 
                                color={isLowStock ? colors.danger : colors.success} 
                            />
                            <Text style={[styles.stockText, { color: isLowStock ? colors.danger : colors.success }]}>
                                {item.stock} {item.unit}
                            </Text>
                        </View>
                        <Text style={[styles.itemPrice, { color: colors.text }]}>Rp {item.price.toLocaleString('id-ID')}</Text>
                        {isOwner && (
                            <Text style={[styles.buyPriceText, { color: colors.textSecondary }]}>
                                Beli: Rp {item.buyPrice?.toLocaleString('id-ID') || 0}
                            </Text>
                        )}
                    </View>
                </View>
            </Swipeable>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.blob1, { backgroundColor: colors.blob1 }]} />
            <View style={[styles.blob2, { backgroundColor: colors.blob2 }]} />
            <GestureHandlerRootView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flex: 1, marginHorizontal: 16 }}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Data Gudang</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{inventoryItems.length} Produk • {categories.length} Kategori</Text>
                    </View>

                    <NotificationBell />

                    {!isOwner && <View style={{ width: 44 }} />}
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    {showLowStockOnly && (
                        <View style={[styles.lowStockBanner, { backgroundColor: colors.danger + '15', borderColor: colors.danger + '30' }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="alert-circle" size={20} color={colors.danger} />
                                <Text style={[styles.lowStockBannerText, { color: colors.danger }]}>Filter: Stok Menipis (≤ 5)</Text>
                            </View>
                            <TouchableOpacity onPress={() => { setShowLowStockOnly(false); router.setParams({ filter: undefined }); }}>
                                <Ionicons name="close-circle" size={20} color={colors.danger} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Search Bar */}
                    <View style={[styles.searchContainer, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                        <Ionicons name="search-outline" size={22} color={colors.textSecondary} style={{ marginRight: 10 }} />
                        <TextInput
                            placeholder="Cari berdasarkan kode, nama..."
                            placeholderTextColor={colors.textSecondary}
                            style={{ flex: 1, color: colors.text, fontSize: 15 }}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4, backgroundColor: colors.textSecondary + '20', borderRadius: 12 }}>
                                    <Ionicons name="close" size={16} color={colors.textSecondary} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={() => setIsSearchScanning(true)} style={{ padding: 6, backgroundColor: colors.primary + '20', borderRadius: 8 }}>
                                <Ionicons name="barcode-outline" size={18} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Category Filter */}
                    <View style={{ marginBottom: 15 }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {['Semua', ...categories.map(c => c.name)].map((categoryName, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setActiveCategory(categoryName === 'Semua' ? null : categoryName)}
                                    style={[
                                        styles.filterPill,
                                        { 
                                            backgroundColor: (activeCategory === categoryName || (activeCategory === null && categoryName === 'Semua')) 
                                                ? colors.primary 
                                                : colors.pill,
                                            borderColor: (activeCategory === categoryName || (activeCategory === null && categoryName === 'Semua'))
                                                ? colors.primary
                                                : colors.cardBorder
                                        }
                                    ]}
                                >
                                    <Text style={{ 
                                        color: (activeCategory === categoryName || (activeCategory === null && categoryName === 'Semua'))
                                            ? 'white' 
                                            : colors.textSecondary,
                                        fontSize: 12,
                                        fontWeight: '600'
                                    }}>
                                        {categoryName}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <FlatList
                        data={inventoryItems}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', marginTop: 50, padding: 20 }}>
                                <MaterialCommunityIcons name="package-variant" size={80} color={colors.textSecondary + '15'} />
                                <Text style={{ color: colors.textSecondary, marginTop: 16, fontSize: 16, fontWeight: '600' }}>
                                    {searchQuery ? 'Produk tidak ditemukan' : 'Gudang masih kosong'}
                                </Text>
                                {!searchQuery && isOwner && (
                                    <TouchableOpacity 
                                        onPress={() => setModalVisible(true)}
                                        style={{ marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                                    >
                                        <Ionicons name="add-circle" size={20} color="white" />
                                        <Text style={{ color: 'white', fontSize: 15, fontWeight: '700' }}>Tambah Barang Pertama</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        }
                    />
                </View>

                {/* Modals */}
                <AddProductModal 
                    visible={modalVisible} 
                    onClose={() => setModalVisible(false)} 
                    onOpenCategoryManager={() => setCatModalVisible(true)}
                />
                
                <EditProductModal 
                    visible={editModalVisible} 
                    onClose={() => setEditModalVisible(false)} 
                    editingProduct={editingProduct}
                    onOpenCategoryManager={() => setCatModalVisible(true)}
                />

                <ManageCategoryModal 
                    visible={catModalVisible} 
                    onClose={() => setCatModalVisible(false)} 
                />

                <BarcodeScannerModal 
                    isVisible={isSearchScanning}
                    onClose={() => setIsSearchScanning(false)}
                    onScanned={handleSearchScanned}
                />
            </GestureHandlerRootView>

            {/* Floating Action Button */}
            {isOwner && (
                <>
                    {showFabMenu && (
                        <TouchableOpacity 
                            activeOpacity={1} 
                            style={styles.fabBackdrop} 
                            onPress={toggleFab} 
                        />
                    )}
                    
                    <View style={styles.fabContainer}>
                        {showFabMenu && (
                            <View style={styles.fabMenu}>
                                <TouchableOpacity 
                                    style={[styles.fabMenuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                                    onPress={() => { toggleFab(); setCatModalVisible(true); }}
                                >
                                    <Text style={[styles.fabMenuText, { color: colors.text }]}>Tambah Kategori</Text>
                                    <View style={[styles.fabMenuIcon, { backgroundColor: '#8b5cf6' }]}>
                                        <MaterialCommunityIcons name="tag-plus-outline" size={20} color="white" />
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[styles.fabMenuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                                    onPress={() => { toggleFab(); setModalVisible(true); }}
                                >
                                    <Text style={[styles.fabMenuText, { color: colors.text }]}>Tambah Barang</Text>
                                    <View style={[styles.fabMenuIcon, { backgroundColor: colors.primary }]}>
                                        <MaterialCommunityIcons name="package-variant-plus" size={20} color="white" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                        
                        <TouchableOpacity
                            style={[styles.fabMain, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                            onPress={toggleFab}
                            activeOpacity={0.8}
                        >
                            <Animated.View style={{ transform: [{ rotate: fabRotation }] }}>
                                <Ionicons name="add" size={28} color="white" />
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    blob1: { position: 'absolute', top: -100, right: -50, width: 300, height: 300, borderRadius: 150, opacity: 0.5 },
    blob2: { position: 'absolute', bottom: 100, left: -50, width: 200, height: 200, borderRadius: 100, opacity: 0.5 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, marginTop: 10, zIndex: 10 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    headerSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
    content: { flex: 1, padding: 16, paddingTop: 10 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, paddingHorizontal: 14, marginBottom: 14, borderWidth: 1 },
    filterPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, marginRight: 10, borderWidth: 1 },
    glassItem: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 10, borderRadius: 14, borderWidth: 1 },
    iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
    rackBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, marginLeft: 8 },
    rackText: { fontSize: 10, fontWeight: '600', marginLeft: 2 },
    codeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    codeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
    brandText: { fontSize: 11, fontWeight: '500' },
    stockBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
    stockText: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
    itemPrice: { fontSize: 14, fontWeight: 'bold' },
    buyPriceText: { fontSize: 11, marginTop: 2 },
    lowStockBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 14, marginBottom: 16, borderWidth: 1 },
    lowStockBannerText: { fontSize: 13, fontWeight: '700', marginLeft: 8 },
    fabContainer: { position: 'absolute', bottom: 110, right: 30, alignItems: 'flex-end', zIndex: 999 },
    fabMain: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    fabBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 998 },
    fabMenu: { marginBottom: 16, gap: 12, alignItems: 'flex-end' },
    fabMenuItem: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingLeft: 16, borderRadius: 16, borderWidth: 1, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    fabMenuText: { fontSize: 13, fontWeight: '700', marginRight: 12 },
    fabMenuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});
