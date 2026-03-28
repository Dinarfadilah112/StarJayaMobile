import { Product, useShop } from '@/context/ShopContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GudangScreen() {
    const navigation = useNavigation();
    const { products } = useShop();
    const { colors, theme } = useTheme();

    const inventoryItems = products.filter(p => p.category !== 'Service');

    const totalAsset = inventoryItems.reduce((sum, item) => sum + (item.price * item.stock), 0);
    const lowStockCount = inventoryItems.filter(p => p.stock <= 5).length;

    const renderItem = ({ item }: { item: Product }) => {
        const isLowStock = item.stock <= 5;
        return (
            <View style={[styles.glassItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={[styles.iconBox, { backgroundColor: isLowStock ? (theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2') : (theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5') }]}>
                    <MaterialCommunityIcons
                        name={isLowStock ? "alert-circle-outline" : "cube-outline"}
                        size={24}
                        color={isLowStock ? colors.danger : colors.success}
                    />
                </View>
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.itemStock, { color: colors.textSecondary }]}>Stok: {item.stock} Unit</Text>
                    <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>@ Rp {item.price.toLocaleString()}</Text>
                </View>
                <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.blob1, { backgroundColor: colors.blob1 }]} />
            <View style={[styles.blob2, { backgroundColor: colors.blob2 }]} />

            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.glassButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}
                    onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                >
                    <Ionicons name="menu-outline" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Gudang Barang</Text>
                <TouchableOpacity style={[styles.glassButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                    <Ionicons name="add" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Aset</Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>Rp {(totalAsset / 1000000).toFixed(1)} jt</Text>
                    </View>
                    <View>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Item Low Stock</Text>
                        <Text style={[styles.summaryValue, { color: lowStockCount > 0 ? colors.danger : colors.success }]}>
                            {lowStockCount} Item
                        </Text>
                    </View>
                </View>

                <FlatList
                    data={inventoryItems}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    blob1: { position: 'absolute', top: -100, right: -50, width: 300, height: 300, borderRadius: 150, opacity: 0.5 },
    blob2: { position: 'absolute', bottom: 100, left: -50, width: 200, height: 200, borderRadius: 100, opacity: 0.5 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, marginTop: 10, zIndex: 10 },
    glassButton: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    content: { flex: 1, padding: 20 },
    summaryCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderRadius: 20, marginBottom: 24, borderWidth: 1 },
    summaryLabel: { fontSize: 12, marginBottom: 4 },
    summaryValue: { fontSize: 20, fontWeight: 'bold' },
    glassItem: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1 },
    iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '600' },
    itemStock: { fontSize: 14 },
    itemPrice: { fontSize: 12 },
    actionBtn: { padding: 8 }
});
