import { useShop } from '@/context/ShopContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getMonthName } from '@/utils/dateUtils';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const navigation = useNavigation();
    const { 
        transactions = [], 
        products = [], 
        stats, 
        isSyncing = false,
        shopInfo
    } = useShop();
    const { colors } = useTheme();

    const [isScannerVisible, setIsScannerVisible] = useState(false);

    const currentMonth = getMonthName();
    const lowStockCount = products.filter(p => p.stock <= 5 && p.category !== 'Service').length;

    const formatRupiah = (num: number) => 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const handleBarcodeScanned = (data: string) => {
        setIsScannerVisible(false);
        const product = products.find(p => p.barcode === data || p.id === data);
        if (product) {
            Alert.alert("📦 Produk Ditemukan", `${product.name}\n\nStok: ${product.stock}\nHarga: ${formatRupiah(product.price)}`);
        } else {
            Alert.alert("❌ Tidak Ditemukan", "Produk tidak terdaftar di sistem.");
        }
    };

    const FinancialCard = ({ value, sub, color, bgColor, icon, onPress }: any) => (
        <TouchableOpacity 
            onPress={onPress}
            activeOpacity={0.8}
            style={[styles.finCard, { backgroundColor: bgColor || colors.card }]}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={[styles.miniIcon, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={14} color={color} />
                </View>
                <Ionicons name="chevron-forward" size={12} color={colors.textSecondary + '30'} />
            </View>
            <Text style={[styles.finSub, { color: colors.textSecondary }]}>{sub}</Text>
            <Text style={[styles.finValue, { color: color || colors.text }]} numberOfLines={1}>
                {formatRupiah(value)}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Workshop Engine</Text>
                    <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>{shopInfo?.name || 'Star Jaya Mobile'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isSyncing && <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 12 }} />}
                    <TouchableOpacity onPress={() => navigation.navigate('options' as never)} style={styles.settingsBtn}>
                        <Ionicons name="settings-sharp" size={22} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* 🚀 Main Executive Stats (Pre-aggregated) */}
                <View style={[styles.mainStats, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700' }}>LABA BERSIH ESTIMASI ({currentMonth})</Text>
                        <MaterialCommunityIcons name="finance" size={20} color="white" />
                    </View>
                    <Text style={styles.mainProfitValue}>{formatRupiah(stats?.profit || 0)}</Text>
                    <View style={styles.profitDivider} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={styles.profitSubLabel}>OMZET</Text>
                            <Text style={styles.profitSubValue}>{formatRupiah(stats?.revenue || 0)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.profitSubLabel}>MODAL TERJUAL</Text>
                            <Text style={styles.profitSubValue}>{formatRupiah(stats?.capital || 0)}</Text>
                        </View>
                    </View>
                </View>

                {/* Grid Stats */}
                <View style={styles.finGrid}>
                    <FinancialCard value={stats?.expense || 0} sub="Pengeluaran" color={colors.danger} icon="arrow-up-circle-outline" />
                    <FinancialCard value={stats?.purchase || 0} sub="Belanja Stok" color={colors.primary} icon="cart-outline" />
                </View>

                {/* Quick Actions row */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>KENDALI BENGKEL</Text>
                </View>
                <View style={[styles.actionsRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <TouchableOpacity onPress={() => navigation.navigate('kasir' as never)} style={styles.actionIconWrapper}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}><Ionicons name="cash-outline" size={20} color={colors.primary} /></View>
                        <Text style={styles.actionLabel}>Kasir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('gudang' as never)} style={styles.actionIconWrapper}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}><Ionicons name="cube-outline" size={20} color={colors.primary} /></View>
                        <Text style={styles.actionLabel}>Gudang</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('penjualan' as never)} style={styles.actionIconWrapper}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}><Ionicons name="bar-chart-outline" size={20} color={colors.primary} /></View>
                        <Text style={styles.actionLabel}>Laporan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsScannerVisible(true)} style={styles.actionIconWrapper}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}><Ionicons name="scan-outline" size={20} color={colors.primary} /></View>
                        <Text style={styles.actionLabel}>Cek Harga</Text>
                    </TouchableOpacity>
                </View>

                {/* Alerts */}
                {lowStockCount > 0 && (
                    <TouchableOpacity 
                        onPress={() => router.push({ pathname: '/gudang', params: { filter: 'low_stock' } })}
                        activeOpacity={0.7}
                        style={[styles.alertCard, { backgroundColor: colors.danger + '10', borderColor: colors.danger + '30' }]}
                    >
                        <Ionicons name="warning" size={20} color={colors.danger} />
                        <Text style={[styles.alertText, { color: colors.danger }]}>
                            Ada {lowStockCount} barang hampir habis! Segera belanja stok.
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.danger} />
                    </TouchableOpacity>
                )}

                <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.text }]}>AKTIVITAS TERAKHIR</Text></View>
                <View style={[styles.listContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    {transactions.length === 0 ? (
                        <View style={{ padding: 40, alignItems: 'center' }}><Text style={{ color: colors.textSecondary, fontSize: 12 }}>Data transaksi kosong.</Text></View>
                    ) : (
                        transactions.slice(0, 5).map((trx, index) => (
                            <View key={trx.id} style={[styles.listItem, { borderBottomColor: colors.cardBorder, borderBottomWidth: index === 4 || index === transactions.length - 1 ? 0 : 1 }]}>
                                <View style={[styles.listIcon, { backgroundColor: colors.success + '15' }]}><Ionicons name="receipt-outline" size={18} color={colors.success} /></View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={[styles.listTitle, { color: colors.text }]}>Penjualan #{trx.id.slice(-6)}</Text>
                                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>{new Date(trx.date).toLocaleDateString()} • {new Date(trx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                </View>
                                <Text style={{ fontWeight: '900', color: colors.text, fontSize: 15 }}>{formatRupiah(trx.total)}</Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            <BarcodeScannerModal isVisible={isScannerVisible} onClose={() => setIsScannerVisible(false)} onScanned={handleBarcodeScanned} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 20 },
    settingsBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 18, paddingBottom: 100 },
    
    // Pro Executive Stats
    mainStats: { padding: 22, borderRadius: 28, marginBottom: 20, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 12 },
    mainProfitValue: { fontSize: 32, fontWeight: '900', color: 'white', marginTop: 12 },
    profitDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 18 },
    profitSubLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 1 },
    profitSubValue: { fontSize: 15, color: 'white', fontWeight: '800', marginTop: 2 },

    finGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    finCard: { width: (width - 56) / 2, padding: 16, borderRadius: 24 },
    miniIcon: { width: 28, height: 28, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    finValue: { fontSize: 17, fontWeight: '900', marginTop: 4 },
    finSub: { fontSize: 11, fontWeight: '700', marginTop: 8 },
    
    actionsRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderRadius: 24, borderWidth: 1, marginBottom: 24 },
    actionIconWrapper: { alignItems: 'center', flex: 1 },
    actionIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    actionLabel: { fontSize: 11, fontWeight: '800' },

    alertCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 24, gap: 12 },
    alertText: { flex: 1, fontSize: 12, fontWeight: '700' },
    
    sectionHeader: { marginBottom: 12 },
    sectionTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1.5, opacity: 0.6 },
    listContainer: { borderRadius: 24, borderWidth: 1, padding: 0, overflow: 'hidden' },
    listItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    listIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    listTitle: { fontSize: 14, fontWeight: '800' }
});
