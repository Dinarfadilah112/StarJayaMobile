import { useTheme } from '@/context/ThemeContext';
import { useShop } from '@/context/ShopContext';
import { getAnalyticsDataSupa, getLowStockProductsSupa, getTransactionsSupa } from '@/services/supabaseService';
import { formatDate, formatDateShort, getThisMonth, getThisWeek, getToday } from '@/utils/dateUtils';
import { exportToCSV, exportToExcel, exportToPDF, generateReportHTML } from '@/utils/exportUtils';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DrawerActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Extracted Components
import PeriodModal, { PeriodType } from '@/components/modals/PeriodModal';
import ExportModal from '@/components/modals/ExportModal';
import TransactionCard from '@/components/penjualan/TransactionCard';
import BestSellerCard from '@/components/penjualan/BestSellerCard';
import SlowMoverCard from '@/components/penjualan/SlowMoverCard';
import LowStockCard from '@/components/penjualan/LowStockCard';

type TabType = 'Riwayat' | 'Terlaris' | 'Jarang Keluar' | 'Stok Menipis';

export default function PenjualanScreen() {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { shopInfo } = useShop();

    const [activeTab, setActiveTab] = useState<TabType>('Riwayat');
    const [period, setPeriod] = useState<PeriodType>('today');
    const [customStartDate, setCustomStartDate] = useState(new Date());
    const [customEndDate, setCustomEndDate] = useState(new Date());
    
    // UI Modals States
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);

    // Data states
    const [transactions, setTransactions] = useState<any[]>([]);
    const [bestSellers, setBestSellers] = useState<any[]>([]);
    const [slowMovers, setSlowMovers] = useState<any[]>([]);
    const [lowStock, setLowStock] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);

    const tabs: TabType[] = ['Riwayat', 'Terlaris', 'Jarang Keluar', 'Stok Menipis'];

    const getDateRange = () => {
        switch (period) {
            case 'today': return getToday();
            case 'week': return getThisWeek();
            case 'month': return getThisMonth();
            case 'custom':
                return {
                    start: customStartDate.toISOString(),
                    end: customEndDate.toISOString(),
                    label: 'Custom'
                };
        }
    };

    const loadData = async () => {
        setIsLoading(true);
        try {
            const range = getDateRange();

            // 1. Transactions
            const txns = await getTransactionsSupa();
            const filteredTxns = txns.filter((t: any) => {
                const txnDate = new Date(t.tanggal_transaksi).getTime();
                const startDate = new Date(range.start).getTime();
                const endDate = new Date(range.end).getTime();
                return txnDate >= startDate && txnDate <= endDate;
            });
            setTransactions(filteredTxns);

            // 2. Fetch Pre-aggregated Analytics
            const analyticsData = await getAnalyticsDataSupa(range.start, range.end);
            
            if (analyticsData.summary) {
                setSummary(analyticsData.summary);
            } else {
                const totalRevenue = filteredTxns.reduce((sum, t) => sum + (t.total_harga || 0), 0);
                setSummary({
                    total_transactions: filteredTxns.length,
                    total_revenue: totalRevenue
                });
            }

            setBestSellers(analyticsData.bestSellers || []);
            setSlowMovers(analyticsData.slowMovers || []);

            // 3. Low Stock 
            const lowStockItems = await getLowStockProductsSupa(5);
            setLowStock(lowStockItems);

        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Error', 'Gagal memuat data laporan');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [period, customStartDate, customEndDate])
    );

    const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
        try {
            setShowExportModal(false);
            setIsLoading(true);

            const range = getDateRange();
            const timestamp = new Date().getTime();
            let data: any[] = [];
            let filename = '';
            let title = '';

            if (activeTab === 'Riwayat') {
                if (transactions.length === 0) return Alert.alert('Tidak Ada Data', 'Tidak ada transaksi untuk di-export');
                data = transactions.map(t => ({
                    'ID Transaksi': t.id_transaksi,
                    'Tanggal': formatDate(t.tanggal_transaksi),
                    'Total': t.total_harga,
                    'Metode Bayar': t.payment_method || 'Tunai',
                    'Biaya Jasa': t.service_fee || 0
                }));
                filename = `Riwayat_Penjualan_${timestamp}`;
                title = 'Laporan Riwayat Penjualan';
            } else if (activeTab === 'Terlaris') {
                if (bestSellers.length === 0) return Alert.alert('Tidak Ada Data', 'Tidak ada produk terlaris untuk di-export');
                data = bestSellers.map(p => ({
                    'Kode': p.kode_barang,
                    'Nama Produk': p.nama_barang,
                    'Terjual': p.total_sold,
                    'Revenue': p.total_revenue || 0,
                    'Stok Tersisa': p.current_stock || 0
                }));
                filename = `Produk_Terlaris_${timestamp}`;
                title = 'Laporan Produk Terlaris';
            } else if (activeTab === 'Jarang Keluar') {
                if (slowMovers.length === 0) return Alert.alert('Tidak Ada Data', 'Tidak ada produk slow moving untuk di-export');
                data = slowMovers.map(p => ({
                    'Kode': p.kode_barang,
                    'Nama Produk': p.nama_barang,
                    'Terjual': p.total_sold,
                    'Stok': p.stok
                }));
                filename = `Produk_Slow_Moving_${timestamp}`;
                title = 'Laporan Produk Jarang Keluar';
            } else if (activeTab === 'Stok Menipis') {
                if (lowStock.length === 0) return Alert.alert('Tidak Ada Data', 'Semua stok aman!');
                data = lowStock.map(p => ({
                    'Kode': p.kode_barang,
                    'Nama Produk': p.nama_barang,
                    'Stok': p.stok,
                    'Harga': p.harga_jual
                }));
                filename = `Stok_Menipis_${timestamp}`;
                title = 'Laporan Stok Menipis';
            }

            if (format === 'csv') {
                await exportToCSV(data, `${filename}.csv`, Object.keys(data[0]));
                Alert.alert('Sukses!', 'Laporan CSV berhasil di-export');
            } else if (format === 'excel') {
                await exportToExcel(data, `${filename}.xlsx`, 'Laporan');
                Alert.alert('Sukses!', 'Laporan Excel berhasil di-export');
            } else {
                const html = generateReportHTML(
                    title,
                    `${range.label} (${formatDateShort(range.start)} - ${formatDateShort(range.end)})`,
                    data,
                    Object.keys(data[0]).map(key => ({ key, label: key })),
                    shopInfo?.name
                );
                await exportToPDF(html, `${filename}.pdf`);
                Alert.alert('Sukses!', 'Laporan PDF berhasil dibuat dan siap dibagikan');
            }
        } catch (error: any) {
            console.error('Export error:', error);
            Alert.alert('Error', `Gagal export: ${error.message || 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderTabContent = () => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Memuat data...</Text>
                </View>
            );
        }

        switch (activeTab) {
            case 'Riwayat':
                return transactions.length > 0 ? (
                    <FlatList
                        key="riwayat-list"
                        data={transactions}
                        renderItem={({ item }) => <TransactionCard item={item} />}
                        keyExtractor={item => item.id_transaksi}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Tidak ada transaksi</Text>
                    </View>
                );

            case 'Terlaris':
                return bestSellers.length > 0 ? (
                    <FlatList
                        key="terlaris-grid"
                        data={bestSellers}
                        renderItem={({ item }) => <BestSellerCard item={item} />}
                        keyExtractor={(item, index) => index.toString()}
                        numColumns={2}
                        columnWrapperStyle={{ gap: 12 }}
                        contentContainerStyle={{ paddingBottom: 20, gap: 12 }}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="trending-up-outline" size={64} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Belum ada data penjualan</Text>
                    </View>
                );

            case 'Jarang Keluar':
                return slowMovers.length > 0 ? (
                    <FlatList
                        key="slow-movers-list"
                        data={slowMovers}
                        renderItem={({ item }) => <SlowMoverCard item={item} />}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{ paddingBottom: 20, gap: 10 }}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="analytics-outline" size={64} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Tidak ada data</Text>
                    </View>
                );

            case 'Stok Menipis':
                return lowStock.length > 0 ? (
                    <FlatList
                        key="low-stock-list"
                        data={lowStock}
                        renderItem={({ item }) => <LowStockCard item={item} />}
                        keyExtractor={item => item.kode_barang}
                        contentContainerStyle={{ paddingBottom: 20, gap: 10 }}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="checkmark-circle-outline" size={64} color="#10B981" />
                        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Semua stok aman!</Text>
                    </View>
                );
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={[styles.glassButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]} onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
                    <Ionicons name="menu-outline" size={24} color={colors.text} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: colors.text }]}>Laporan</Text>
                <TouchableOpacity style={[styles.glassButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]} onPress={() => setShowExportModal(true)}>
                    <Ionicons name="download-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Period Dropdown */}
            <TouchableOpacity
                style={[styles.periodDropdown, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => setShowPeriodModal(true)}
            >
                <View style={{ flex: 1 }}>
                    <Text style={[styles.periodLabel, { color: colors.textSecondary }]}>Periode</Text>
                    <Text style={[styles.periodValue, { color: colors.text }]}>
                        {period === 'today' ? 'Hari Ini' :
                            period === 'week' ? 'Minggu Ini' :
                                period === 'month' ? 'Bulan Ini' :
                                    `${formatDateShort(customStartDate.toISOString())} - ${formatDateShort(customEndDate.toISOString())}`}
                    </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color={colors.text} />
            </TouchableOpacity>

            {/* Summary Card */}
            {summary && (
                <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Transaksi</Text>
                        <Text style={styles.summaryValue}>{summary.total_transactions || 0}</Text>
                    </View>
                    <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Revenue</Text>
                        <Text style={styles.summaryValue}>Rp {(summary.total_revenue || 0).toLocaleString()}</Text>
                    </View>
                </View>
            )}

            {/* Tab Navigation */}
            <View style={[styles.tabContainer, { backgroundColor: colors.pill }]}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && [styles.activeTab, { backgroundColor: colors.primary }]]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, { color: activeTab === tab ? '#FFF' : colors.textSecondary }]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tab Content */}
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
                {renderTabContent()}
            </View>

            {/* Native Date Pickers */}
            {showStartPicker && (
                <DateTimePicker
                    value={customStartDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                        setShowStartPicker(false);
                        if (date) {
                            setCustomStartDate(date);
                            setShowEndPicker(true);
                        }
                    }}
                />
            )}
            {showEndPicker && (
                <DateTimePicker
                    value={customEndDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                        setShowEndPicker(false);
                        if (date) setCustomEndDate(date);
                    }}
                />
            )}

            {/* Extracted Modals */}
            <PeriodModal 
                visible={showPeriodModal} 
                onClose={() => setShowPeriodModal(false)}
                currentPeriod={period}
                onSelectPeriod={(p) => {
                    setPeriod(p);
                    setShowPeriodModal(false);
                }}
                onCustomRangeSelect={() => setShowStartPicker(true)}
            />

            <ExportModal 
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
                onExport={handleExport}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, paddingTop: 8 },
    glassButton: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    headerTitle: { fontSize: 20, fontWeight: '700', letterSpacing: 0.3 },

    periodDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 12,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
    },
    periodLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4, letterSpacing: 0.3, textTransform: 'uppercase' },
    periodValue: { fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },

    summaryCard: { marginHorizontal: 16, marginTop: 4, marginBottom: 16, padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-around', shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 },
    summaryItem: { alignItems: 'center', flex: 1 },
    summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: 6, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
    summaryValue: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: 0.3 },
    summaryDivider: { width: 1, height: '80%', alignSelf: 'center' },

    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 4,
        backgroundColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2
    },
    tab: { flex: 1, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
    activeTab: { shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
    tabText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2, textAlign: 'center', lineHeight: 14 },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
});
