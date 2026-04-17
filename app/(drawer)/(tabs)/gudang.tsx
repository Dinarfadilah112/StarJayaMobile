import { Product, useShop } from '@/context/ShopContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { Alert, Animated, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import AddProductModal from '@/components/modals/AddProductModal';
import EditProductModal from '@/components/modals/EditProductModal';
import ManageCategoryModal from '@/components/modals/ManageCategoryModal';

export default function GudangScreen() {
    const navigation = useNavigation();
    const { products, categories, refreshData, searchInWarehouse, shopInfo } = useShop();
    const { colors } = useTheme();
    const params = useLocalSearchParams();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(undefined);
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [catModalVisible, setCatModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSearchScanning, setIsSearchScanning] = useState(false);
    const [showLowStockOnly, setShowLowStockOnly] = useState(params.filter === 'low_stock');
    
    // 🏎️ PRO Performance: List from DB Search
    const [filteredItems, setFilteredItems] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [showFabMenu, setShowFabMenu] = useState(false);
    const [fabAnimation] = useState(new Animated.Value(0));

    /**
     * 🏎️ Debounced High-Performance DB Search
     */
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            performSearch();
        }, 300); // 300ms debounce
        return () => clearTimeout(delaySearch);
    }, [searchQuery, activeCategoryId, showLowStockOnly, products]);

    const performSearch = async () => {
        setIsLoading(true);
        try {
            const results = await searchInWarehouse(searchQuery, activeCategoryId, showLowStockOnly);
            setFilteredItems(results);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFab = () => {
        const toValue = showFabMenu ? 0 : 1;
        setShowFabMenu(!showFabMenu);
        Animated.spring(fabAnimation, { toValue, useNativeDriver: true, friction: 5, tension: 40 }).start();
    };

    const fabRotation = fabAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg']
    });

    const getBusinessIcon = () => {
        const type = shopInfo?.business_type || 'bengkel';
        switch (type) {
            case 'bengkel': return 'construct-outline';
            case 'ponsel': return 'phone-portrait-outline';
            default: return 'cube-outline';
        }
    };

    const renderItem = ({ item }: { item: Product }) => {
        const isLowStock = item.stock <= 5 && !item.category.includes('Service');
        return (
            <Swipeable
                renderRightActions={() => (
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity 
                            onPress={() => { setEditingProduct(item); setEditModalVisible(true); }}
                            style={[styles.swipeBtn, { backgroundColor: colors.primary }]}
                        >
                            <Ionicons name="pencil" size={22} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.swipeBtn, { backgroundColor: colors.danger }]}>
                            <Ionicons name="trash" size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
            >
                <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
                        <Ionicons name={item.category.includes('Service') ? 'build-outline' : getBusinessIcon()} size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '700' }}>#{item.id}</Text>
                            <Text style={{ fontSize: 11, color: colors.textSecondary, marginLeft: 8 }}>• {item.category}</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <View style={[styles.stockBadge, { backgroundColor: isLowStock ? colors.danger + '10' : colors.success + '10', borderColor: isLowStock ? colors.danger + '30' : colors.success + '30' }]}>
                            <Text style={{ fontSize: 11, fontWeight: '800', color: isLowStock ? colors.danger : colors.success }}>{item.stock} {item.unit || 'Stok'}</Text>
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text, marginTop: 4 }}>Rp {item.price.toLocaleString()}</Text>
                    </View>
                </View>
            </Swipeable>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Warehousing Center</Text>
                        <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>{filteredItems.length} Products Found</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Integrated Pro Search Bar */}
                    <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                        <TextInput
                            placeholder="Search by name, code or barcode..."
                            placeholderTextColor={colors.textSecondary}
                            style={{ flex: 1, color: colors.text, fontWeight: '600' }}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity onPress={() => setIsSearchScanning(true)} style={styles.scanBtn}>
                            <Ionicons name="barcode-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Category Scroll */}
                    <View style={{ marginBottom: 16 }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <TouchableOpacity
                                onPress={() => setActiveCategoryId(undefined)}
                                style={[styles.catPill, { backgroundColor: activeCategoryId === undefined ? colors.primary : colors.card, borderColor: colors.cardBorder }]}
                            >
                                <Text style={{ color: activeCategoryId === undefined ? 'white' : colors.textSecondary, fontWeight: '800', fontSize: 11 }}>ALL</Text>
                            </TouchableOpacity>
                            {categories.map(c => (
                                <TouchableOpacity
                                    key={c.id}
                                    onPress={() => setActiveCategoryId(c.id)}
                                    style={[styles.catPill, { backgroundColor: activeCategoryId === c.id ? colors.primary : colors.card, borderColor: colors.cardBorder }]}
                                >
                                    <Text style={{ color: activeCategoryId === c.id ? 'white' : colors.textSecondary, fontWeight: '800', fontSize: 11 }}>{c.name.toUpperCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <FlatList
                        data={filteredItems}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 150 }}
                        ListEmptyComponent={
                            <View style={styles.emptyView}>
                                <Ionicons name="search-outline" size={60} color={colors.textSecondary + '20'} />
                                <Text style={{ color: colors.textSecondary, marginTop: 16, fontWeight: '700' }}>No products match your search.</Text>
                            </View>
                        }
                    />
                </View>

                <AddProductModal visible={modalVisible} onClose={() => { setModalVisible(false); performSearch(); }} onOpenCategoryManager={() => setCatModalVisible(true)} />
                <EditProductModal visible={editModalVisible} onClose={() => { setEditModalVisible(false); performSearch(); }} editingProduct={editingProduct} onOpenCategoryManager={() => setCatModalVisible(true)} />
                <ManageCategoryModal visible={catModalVisible} onClose={() => { setCatModalVisible(false); performSearch(); }} />
                <BarcodeScannerModal isVisible={isSearchScanning} onClose={() => setIsSearchScanning(false)} onScanned={(d) => setSearchQuery(d)} />

                {/* FAB */}
                <View style={styles.fabContainer}>
                    {showFabMenu && (
                        <View style={{ marginBottom: 16, gap: 12, alignItems: 'flex-end' }}>
                            <TouchableOpacity 
                                style={[styles.fabMenuBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                                onPress={() => { toggleFab(); setModalVisible(true); }}
                            >
                                <Text style={{ fontSize: 12, fontWeight: '800', marginRight: 12, color: colors.text }}>New Product</Text>
                                <View style={[styles.miniFab, { backgroundColor: colors.success }]}><Ionicons name="add" size={18} color="white" /></View>
                            </TouchableOpacity>
                        </View>
                    )}
                    <TouchableOpacity style={[styles.fabMain, { backgroundColor: colors.primary }]} onPress={toggleFab}>
                        <Animated.View style={{ transform: [{ rotate: fabRotation }] }}><Ionicons name="add" size={30} color="white" /></Animated.View>
                    </TouchableOpacity>
                </View>
            </GestureHandlerRootView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 22, paddingVertical: 18 },
    headerTitle: { fontSize: 24, fontWeight: '900' },
    content: { flex: 1, paddingHorizontal: 18 },
    searchBar: { flexDirection: 'row', alignItems: 'center', height: 56, borderRadius: 24, paddingHorizontal: 16, marginBottom: 18, borderWidth: 1 },
    scanBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },
    catPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, marginRight: 10, borderWidth: 1 },
    itemCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1 },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    itemName: { fontSize: 15, fontWeight: '800' },
    stockBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
    swipeBtn: { width: 60, height: '88%', justifyContent: 'center', alignItems: 'center', borderRadius: 22, marginLeft: 10 },
    emptyView: { alignItems: 'center', marginTop: 60 },
    fabContainer: { position: 'absolute', bottom: 40, right: 26, alignItems: 'flex-end' },
    fabMain: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8 },
    fabMenuBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingLeft: 16, borderRadius: 20, borderWidth: 1 },
    miniFab: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});
