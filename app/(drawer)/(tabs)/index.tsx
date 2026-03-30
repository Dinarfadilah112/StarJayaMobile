import NotificationBell from '@/components/NotificationBell';
import { useShop } from '@/context/ShopContext';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { useNotifications } from '@/context/NotificationContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getMonthName } from '@/utils/dateUtils';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import CalculatorModal from '@/components/CalculatorModal';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const navigation = useNavigation();
    const { transactions = [], products = [], stats = { totalRevenue: 0, totalExpenses: 0, monthlyRevenue: 0, monthlyPurchases: 0, monthlyExpenses: 0 }, isSyncing = false } = useShop();
    const { colors } = useTheme();
    const { user } = useUser();

    const isOwner = user?.role === 'Owner';
    const [isCalcVisible, setIsCalcVisible] = useState(false);
    const [isScannerVisible, setIsScannerVisible] = useState(false);

    const currentMonth = getMonthName();
    const lowStockCount = products.filter(p => p.stock <= 5 && p.category !== 'Service').length;

    const formatRupiah = (num: number) => 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const handleBarcodeScanned = (data: string) => {
        setIsScannerVisible(false);
        const product = products.find(p => p.barcode === data || p.id === data);
        if (product) {
            Alert.alert("Produk Ditemukan", `${product.name}\n\nStok: ${product.stock}\nHarga: ${formatRupiah(product.price)}`);
        } else {
            Alert.alert("Tidak Ditemukan", "Produk tidak terdaftar.");
        }
    };

    const FinancialCard = ({ value, sub, color, bgColor, arrow, sub2, onPress }: any) => (
        <TouchableOpacity 
            onPress={onPress}
            activeOpacity={0.8}
            style={[styles.finCard, { backgroundColor: bgColor || colors.card }]}
        >
            <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={[styles.finSub, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }]}>{sub}</Text>
                    <Ionicons name="chevron-forward" size={12} color={colors.textSecondary + '30'} />
                </View>
                
                <View style={{ backgroundColor: 'transparent' }}>
                    <Text style={[styles.finValue, { color: color || colors.text }]} numberOfLines={1}>
                        {isOwner ? value : 'Rp ***'}
                    </Text>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        {arrow && <Ionicons name={arrow} size={11} color={color} style={{ marginRight: 3 }} />}
                        <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '600' }}>
                            {sub2 || (arrow === 'arrow-down' ? 'Pemasukan' : arrow === 'arrow-up' ? 'Pengeluaran' : 'Total')}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>Halo,</Text>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{user?.name || 'User'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isSyncing && <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 12 }} />}
                    <NotificationBell />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Financial Grid 2x3 */}
                <View style={styles.finGrid}>
                    <FinancialCard value={formatRupiah(stats.totalRevenue)} sub="Terima" color={colors.success} bgColor={colors.success + '10'} arrow="arrow-down" />
                    <FinancialCard value={formatRupiah(stats.totalExpenses)} sub="Bayar" color={colors.danger} bgColor={colors.danger + '10'} arrow="arrow-up" />
                    <FinancialCard value={formatRupiah(stats.monthlyRevenue)} sub={`Penjualan (${currentMonth})`} />
                    <FinancialCard value={formatRupiah(stats.monthlyPurchases)} sub={`Pembelian (${currentMonth})`} />
                    <FinancialCard value={formatRupiah(stats.monthlyExpenses)} sub={`Pengeluaran (${currentMonth})`} />
                    <FinancialCard value={formatRupiah(stats.totalRevenue - stats.totalExpenses)} sub="Total Saldo" sub2="Tunai & Bank" />
                </View>

                {/* Quick Actions row */}
                <View style={[styles.actionsRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <TouchableOpacity onPress={() => navigation.navigate('kasir' as never)} style={styles.actionIconWrapper}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}><Ionicons name="cart-outline" size={18} color={colors.primary} /></View>
                        <Text style={styles.actionLabel}>Kasir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsScannerVisible(true)} style={styles.actionIconWrapper}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.info + '15' }]}><Ionicons name="scan-outline" size={18} color={colors.info} /></View>
                        <Text style={styles.actionLabel}>Scan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsCalcVisible(true)} style={styles.actionIconWrapper}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.warning + '15' }]}><Ionicons name="calculator-outline" size={18} color={colors.warning} /></View>
                        <Text style={styles.actionLabel}>Hitung</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('gudang' as never)} style={styles.actionIconWrapper}>
                        <View style={[styles.actionIcon, { backgroundColor: '#8B5CF615' }]}><Ionicons name="cube-outline" size={18} color="#8B5CF6" /></View>
                        <Text style={styles.actionLabel}>Stok</Text>
                    </TouchableOpacity>
                </View>

                {/* Low Stock Alert */}
                <TouchableOpacity 
                    onPress={() => router.push({ pathname: '/gudang', params: { filter: 'low_stock' } })}
                    activeOpacity={0.7}
                    style={[
                        styles.notifDemo, 
                        { 
                            backgroundColor: lowStockCount > 0 ? colors.danger + '10' : colors.success + '10', 
                            borderColor: lowStockCount > 0 ? colors.danger + '30' : colors.success + '30',
                            marginBottom: 20
                        }
                    ]}
                >
                    <View style={[styles.notifIcon, { backgroundColor: lowStockCount > 0 ? colors.danger : colors.success }]}>
                        <Ionicons name={lowStockCount > 0 ? "warning" : "checkmark-circle"} size={16} color="#FFF" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.notifTitle, { color: lowStockCount > 0 ? colors.danger : colors.success }]}>
                            {lowStockCount > 0 ? 'Peringatan Stok Menipis' : 'Stok Produk Aman'}
                        </Text>
                        <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                            {lowStockCount > 0 
                                ? `Ada ${lowStockCount} item yang sisa stoknya 5 atau kurang. Segera restock!` 
                                : 'Semua item di gudang memiliki stok yang cukup untuk dijual.'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={lowStockCount > 0 ? colors.danger : colors.success} />
                </TouchableOpacity>

                <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.text }]}>Transaksi Terakhir</Text></View>
                <View style={[styles.listContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    {transactions.length === 0 ? (
                        <View style={{ padding: 40, alignItems: 'center' }}><Text style={{ color: colors.textSecondary }}>Belum ada transaksi.</Text></View>
                    ) : (
                        transactions.slice(0, 5).map((trx, index) => (
                            <View key={trx.id} style={[styles.listItem, { borderBottomColor: colors.cardBorder, borderBottomWidth: index === 4 || index === transactions.length - 1 ? 0 : 1 }]}>
                                <View style={[styles.listIcon, { backgroundColor: colors.success + '15' }]}><Ionicons name="arrow-down" size={16} color={colors.success} /></View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={[styles.listTitle, { color: colors.text }]}>Penjualan #{trx.id.slice(-4)}</Text>
                                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>{new Date(trx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                </View>
                                <Text style={{ fontWeight: '800', color: colors.success }}>{formatRupiah(trx.total)}</Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            <CalculatorModal isVisible={isCalcVisible} onClose={() => setIsCalcVisible(false)} />
            <BarcodeScannerModal isVisible={isScannerVisible} onClose={() => setIsScannerVisible(false)} onScanned={handleBarcodeScanned} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    menuBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 16, paddingBottom: 100 },
    
    finGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
    finCard: { width: (width - 44) / 2, padding: 14, borderRadius: 16, marginBottom: 12 },
    finValue: { fontSize: 16, fontWeight: '800' },
    finSub: { fontSize: 9, fontWeight: '700' },
    finSub2: { fontSize: 9, marginTop: 2, opacity: 0.7 },
    
    actionsRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
    actionIconWrapper: { alignItems: 'center', flex: 1 },
    actionIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    actionLabel: { fontSize: 10, fontWeight: '700' },

    notifDemo: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
    notifIcon: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    notifTitle: { fontSize: 12, fontWeight: '700' },
    proBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    
    alertBanner: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
    alertTitle: { fontSize: 12, fontWeight: '700' },
    
    sectionHeader: { marginBottom: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '800' },
    listContainer: { borderRadius: 16, borderWidth: 1, padding: 0, overflow: 'hidden' },
    listItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    listIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    listTitle: { fontSize: 13, fontWeight: '700' }
});
