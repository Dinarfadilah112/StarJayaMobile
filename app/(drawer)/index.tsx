import { useShop } from '@/context/ShopContext';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Komponen Sparkline Sederhana (Visual Only)
const MiniChart = ({ color }: { color: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 30, gap: 4, opacity: 0.8 }}>
        {[20, 45, 30, 60, 40, 75, 55].map((h, i) => (
            <View key={i} style={{ width: 4, height: h * 0.4, backgroundColor: color, borderRadius: 2 }} />
        ))}
    </View>
);

export default function DashboardScreen() {
    const navigation = useNavigation();
    const { transactions, products } = useShop();
    const { colors, theme } = useTheme();
    const { user } = useUser();

    // Hitung Stat
    const totalRevenue = transactions.reduce((sum, trx) => sum + trx.total, 0);
    const totalTrx = transactions.length;
    const uniqueCustomers = new Set(transactions.map(t => t.id)).size;
    const lowStockCount = products.filter(p => p.stock <= 5 && p.category !== 'Service').length;

    const formatRupiah = (num: number) => 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const QuickAction = ({ icon, label, color, onPress }: any) => (
        <TouchableOpacity onPress={onPress} style={{ alignItems: 'center' }}>
            <View style={[styles.quickBtn, { backgroundColor: color + '20', borderColor: color }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <Text style={[styles.quickText, { color: colors.textSecondary }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Dynamic Background Blobs */}
            <View style={[styles.blob1, { backgroundColor: colors.blob1 }]} />
            <View style={[styles.blob2, { backgroundColor: colors.blob2 }]} />

            {/* Modern Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={[styles.menuBtn, { backgroundColor: colors.pill }]}
                        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                    >
                        <Ionicons name="grid-outline" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <View style={{ marginLeft: 16 }}>
                        <Text style={{ fontSize: 13, color: colors.textSecondary }}>Selamat Datang,</Text>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{user.name}</Text>
                    </View>
                </View>
                <TouchableOpacity style={[styles.notifBtn, { backgroundColor: colors.pill }]}>
                    <Ionicons name="notifications" size={20} color={colors.text} />
                    <View style={styles.redDot} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Hero Card */}
                <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
                    <View style={styles.heroContent}>
                        <Text style={styles.heroLabel}>Total Pendapatan</Text>
                        <Text style={styles.heroValue}>{formatRupiah(totalRevenue)}</Text>
                        <View style={styles.heroFooter}>
                            <View style={styles.badge}>
                                <Ionicons name="trending-up" size={12} color="#fff" />
                                <Text style={styles.badgeText}>+12.5%</Text>
                            </View>
                            <Text style={styles.heroSubText}>vs kemarin</Text>
                        </View>
                    </View>
                    <View style={styles.heroDecor}>
                        <MaterialCommunityIcons name="finance" size={80} color="rgba(255,255,255,0.2)" />
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionContainer}>
                    <QuickAction icon="scan-outline" label="Scan" color={colors.primary} />
                    <QuickAction icon="add-circle-outline" label="Produk" color={colors.success} onPress={() => navigation.navigate('gudang' as never)} />
                    <QuickAction icon="cart-outline" label="Kasir" color="#F59E0B" onPress={() => navigation.navigate('kasir' as never)} />
                    <QuickAction icon="stats-chart-outline" label="Laporan" color="#8B5CF6" onPress={() => navigation.navigate('penjualan' as never)} />
                </View>

                {/* Secondary Stats Grid */}
                <View style={styles.statsGrid}>
                    {/* Kartu Transaksi */}
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <View style={[styles.iconBox, { backgroundColor: colors.success + '20' }]}>
                                <MaterialCommunityIcons name="receipt" size={20} color={colors.success} />
                            </View>
                            <MiniChart color={colors.success} />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text }]}>{totalTrx}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Transaksi Hari Ini</Text>
                    </View>

                    {/* Kartu Pelanggan */}
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <View style={[styles.iconBox, { backgroundColor: '#F59E0B20' }]}>
                                <MaterialCommunityIcons name="account-group" size={20} color="#F59E0B" />
                            </View>
                            <MaterialCommunityIcons name="arrow-top-right" size={20} color="#F59E0B" />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text }]}>{uniqueCustomers}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pelanggan Aktif</Text>
                    </View>

                    {/* Kartu Stok (Full Width jika Perlu) */}
                    <View style={[styles.statCardFull, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.iconBox, { backgroundColor: colors.danger + '20', marginRight: 15 }]}>
                                <MaterialCommunityIcons name="alert-box" size={24} color={colors.danger} />
                            </View>
                            <View>
                                <Text style={[styles.statValue, { color: colors.text, fontSize: 18 }]}>{lowStockCount} Item</Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Stok Menipis Perlu Restock</Text>
                            </View>
                        </View>
                        <TouchableOpacity>
                            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Transactions List */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaksi Terakhir</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('penjualan' as never)}>
                        <Text style={{ color: colors.primary, fontWeight: '600' }}>Lihat Semua</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.listContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    {transactions.length === 0 ? (
                        <View style={{ padding: 30, alignItems: 'center' }}>
                            <Image
                                source={{ uri: 'https://img.icons8.com/clouds/200/empty-box.png' }}
                                style={{ width: 100, height: 100, opacity: 0.5, marginBottom: 10 }}
                            />
                            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>Belum ada transaksi hari ini.</Text>
                        </View>
                    ) : (
                        transactions.slice(0, 5).map((trx, index) => (
                            <View key={trx.id} style={[styles.listItem, { borderBottomColor: colors.cardBorder, borderBottomWidth: index === transactions.length - 1 ? 0 : 1 }]}>
                                <View style={[styles.listAvatar, { backgroundColor: colors.pillActive }]}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>#{trx.id.slice(-2)}</Text>
                                </View>
                                <View style={styles.listContent}>
                                    <Text style={[styles.listTitle, { color: colors.text }]}>Penjualan Umum</Text>
                                    <Text style={[styles.listSub, { color: colors.textSecondary }]}>{trx.items.length} Item • {new Date(trx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                </View>
                                <Text style={[styles.priceText, { color: colors.success }]}>{formatRupiah(trx.total)}</Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    blob1: { position: 'absolute', top: -100, left: -50, width: 300, height: 300, borderRadius: 150, opacity: 0.2 },
    blob2: { position: 'absolute', top: 100, right: -100, width: 250, height: 250, borderRadius: 125, opacity: 0.15 },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    menuBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    notifBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    redDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: '#fff' },

    content: { padding: 20, paddingTop: 5, paddingBottom: 100 },

    // Hero Card
    heroCard: { height: 160, borderRadius: 24, padding: 24, marginBottom: 24, overflow: 'hidden', shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    heroContent: { zIndex: 2 },
    heroLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '500', marginBottom: 8 },
    heroValue: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
    heroFooter: { flexDirection: 'row', alignItems: 'center' },
    badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, marginRight: 8 },
    badgeText: { color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 4 },
    heroSubText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
    heroDecor: { position: 'absolute', right: -10, bottom: -10, opacity: 0.5, transform: [{ rotate: '-10deg' }] },

    // Quick Actions
    quickActionContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 10 },
    quickBtn: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1 },
    quickText: { fontSize: 12, fontWeight: '500' },

    // Stats Grid
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
    statCard: { width: (width - 52) / 2, borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
    statCardFull: { width: '100%', borderRadius: 20, padding: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: '700', marginVertical: 4 },
    statLabel: { fontSize: 12 },

    // List
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    listContainer: { borderRadius: 24, padding: 4, borderWidth: 1, overflow: 'hidden' },
    listItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    listAvatar: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    listContent: { flex: 1 },
    listTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    listSub: { fontSize: 12 },
    priceText: { fontWeight: '700', fontSize: 14 }
});
