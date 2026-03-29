import NotificationBell from '@/components/NotificationBell';
import { useNotifications } from '@/context/NotificationContext';
import { Product, useShop } from '@/context/ShopContext';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, FlatList, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    const { user } = useUser();
    const { checkLowStock, notifyProductDelete } = useNotifications();
    const isOwner = user?.role === 'Owner';

    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [catModalVisible, setCatModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [isSearchScanning, setIsSearchScanning] = useState(false);

    // Filter State
    const { filter } = useLocalSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    useEffect(() => {
        if (filter === 'low_stock') {
            setShowLowStockOnly(true);
        }
    }, [filter]);

    const handleSearchScanned = (data: string) => {
        setIsSearchScanning(false);
        setSearchQuery(data);
    };

    // Filters
    const inventoryItems = products.filter(p => !p.category.includes('Service'));

    const filteredItems = inventoryItems.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.barcode && item.barcode.includes(searchQuery));
        const matchCat = activeCategory === null || item.categoryId === activeCategory;
        const matchLowStock = !showLowStockOnly || item.stock <= 5;
        return matchSearch && matchCat && matchLowStock;
    });

    useEffect(() => {
        if (inventoryItems.length > 0) {
            checkLowStock(inventoryItems);
        }
    }, [inventoryItems.length, products.length]);

    const handleEditProduct = (item: Product) => {
        setEditingProduct(item);
        setEditModalVisible(true);
    };

    const handleDeleteProduct = (item: Product) => {
        Alert.alert(
            "Hapus Produk",
            `Apakah Anda yakin ingin menghapus ${item.name}?`,
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus", style: "destructive", onPress: () => {
                        const productName = item.name;
                        deleteProductData(item.id);
                        notifyProductDelete(productName);
                        Alert.alert("Sukses", "Produk berhasil dihapus");
                    }
                }
            ]
        );
    };

    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, item: Product) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginLeft: 8 }}>
                <TouchableOpacity
                    onPress={() => handleEditProduct(item)}
                    style={{ backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', width: 70, height: '100%', borderRadius: 14, marginRight: 8 }}
                >
                    <Ionicons name="create" size={22} color="white" />
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: '600', marginTop: 4 }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDeleteProduct(item)}
                    style={{ backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', width: 70, height: '100%', borderRadius: 14 }}
                >
                    <Ionicons name="trash" size={22} color="white" />
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: '600', marginTop: 4 }}>Hapus</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderItem = ({ item }: { item: Product }) => {
        const isLowStock = item.stock <= 5;
        const categoryColor = isLowStock ? colors.danger : colors.success;
        const categoryBg = isLowStock ? '#FEE2E2' : '#DCFCE7';

        return (
            <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)} overshootRight={false}>
                <View style={[styles.glassItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={[styles.iconBox, { backgroundColor: categoryBg }]}>
                        <MaterialCommunityIcons name={isLowStock ? "alert-circle" : "package-variant"} size={26} color={categoryColor} />
                    </View>

                    <View style={styles.itemInfo}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <Text style={[styles.itemName, { color: colors.text, flex: 1 }]} numberOfLines={1}>{item.name}</Text>
                            {item.rack ? (
                                <View style={[styles.rackBadge, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                                    <Text style={{ fontSize: 8, fontWeight: '900', color: colors.primary, marginRight: 2 }}>RAK:</Text>
                                    <Text style={[styles.rackText, { color: colors.primary }]}>{item.rack}</Text>
                                </View>
                            ) : null}
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <View style={[styles.codeBadge, { backgroundColor: colors.pill }]}>
                                <Text style={[styles.codeText, { color: colors.textSecondary }]}>{item.id}</Text>
                            </View>
                            {!!item.brand && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                                    <MaterialCommunityIcons name="tag-outline" size={12} color={colors.textSecondary} />
                                    <Text style={[styles.brandText, { color: colors.textSecondary, marginLeft: 4 }]}>{item.brand}</Text>
                                </View>
                            )}
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={[styles.stockBadge, { backgroundColor: isLowStock ? colors.danger + '15' : colors.success + '15', borderColor: isLowStock ? colors.danger + '30' : colors.success + '30' }]}>
                                <MaterialCommunityIcons name={isLowStock ? "alert" : "check-circle"} size={14} color={categoryColor} />
                                <Text style={[styles.stockText, { color: categoryColor }]}>{item.stock} {item.unit}</Text>
                            </View>

                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[styles.itemPrice, { color: colors.primary }]}>
                                    {item.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }).replace(',00', '')}
                                </Text>
                                {isOwner && (item.buyPrice ?? 0) > 0 && (
                                    <Text style={[styles.buyPriceText, { color: colors.textSecondary }]}>
                                        Modal: {item.buyPrice?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }).replace(',00', '')}
                                    </Text>
                                )}
                            </View>
                        </View>
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
                    <TouchableOpacity style={[styles.glassButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]} onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
                        <Ionicons name="menu-outline" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={{ flex: 1, marginHorizontal: 16 }}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Data Gudang</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{inventoryItems.length} Produk • {categories.length} Kategori</Text>
                    </View>

                    <NotificationBell />

                    {isOwner ? (
                        <TouchableOpacity
                            style={[styles.glassButton, { backgroundColor: colors.primary, borderColor: colors.primary, marginLeft: 10 }]}
                            onPress={() => setModalVisible(true)}
                        >
                            <Ionicons name="add" size={24} color="#fff" />
                        </TouchableOpacity>
                    ) : <View style={{ width: 44 }} />}
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase' }}>Filter Kategori</Text>
                            {activeCategory !== null && (
                                <TouchableOpacity onPress={() => setActiveCategory(null)}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>Reset</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <TouchableOpacity
                                style={[styles.filterPill, { backgroundColor: activeCategory === null ? colors.primary : colors.card, borderColor: activeCategory === null ? colors.primary : colors.cardBorder }]}
                                onPress={() => setActiveCategory(null)}
                            >
                                <MaterialCommunityIcons name="view-grid-outline" size={16} color={activeCategory === null ? '#fff' : colors.text} />
                                <Text style={{ color: activeCategory === null ? '#fff' : colors.text, fontWeight: activeCategory === null ? '700' : '500', marginLeft: 6 }}>Semua</Text>
                            </TouchableOpacity>

                            {categories.map((cat) => {
                                const isActive = activeCategory === cat.id;
                                const itemCount = inventoryItems.filter(p => p.categoryId === cat.id).length;
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[styles.filterPill, { backgroundColor: isActive ? colors.primary : colors.card, borderColor: isActive ? colors.primary : colors.cardBorder }]}
                                        onPress={() => setActiveCategory(cat.id)}
                                    >
                                        <Text style={{ color: isActive ? '#fff' : colors.text, fontWeight: isActive ? '700' : '500' }}>{cat.name}</Text>
                                        <View style={{ backgroundColor: isActive ? '#ffffff30' : colors.pill, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 6 }}>
                                            <Text style={{ color: isActive ? '#fff' : colors.textSecondary, fontSize: 11, fontWeight: '700' }}>{itemCount}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    <FlatList
                        data={filteredItems}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', marginTop: 80, paddingHorizontal: 40 }}>
                                <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: colors.pill, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                                    <MaterialCommunityIcons name="package-variant-closed" size={60} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                                </View>
                                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
                                    {searchQuery || activeCategory !== null ? 'Barang Tidak Ditemukan' : 'Belum Ada Barang'}
                                </Text>
                                {!searchQuery && activeCategory === null && isOwner && (
                                    <TouchableOpacity
                                        style={{ marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                                        onPress={() => setModalVisible(true)}
                                    >
                                        <Ionicons name="add-circle" size={20} color="white" />
                                        <Text style={{ color: 'white', fontSize: 15, fontWeight: '700' }}>Tambah Barang Pertama</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        }
                    />
                </View>

                {/* Modals from extracted components */}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    blob1: { position: 'absolute', top: -100, right: -50, width: 300, height: 300, borderRadius: 150, opacity: 0.5 },
    blob2: { position: 'absolute', bottom: 100, left: -50, width: 200, height: 200, borderRadius: 100, opacity: 0.5 },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, marginTop: 10, zIndex: 10 },
    glassButton: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    headerSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },

    content: { flex: 1, padding: 20, paddingTop: 10 },

    searchContainer: { flexDirection: 'row', alignItems: 'center', height: 52, borderRadius: 14, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1 },
    filterPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1 },

    glassItem: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1 },
    iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    rackBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, marginLeft: 8 },
    rackText: { fontSize: 10, fontWeight: '600', marginLeft: 2 },
    codeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    codeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
    brandText: { fontSize: 11, fontWeight: '500' },
    stockBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
    stockText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
    itemPrice: { fontSize: 16, fontWeight: 'bold' },
    buyPriceText: { fontSize: 11, marginTop: 2 },

    lowStockBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 14, marginBottom: 16, borderWidth: 1 },
    lowStockBannerText: { fontSize: 14, fontWeight: '700', marginLeft: 8 },
});
