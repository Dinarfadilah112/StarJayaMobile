import { useTheme } from '@/context/ThemeContext';
import { useShop } from '@/context/ShopContext';
import { getTransactionsSupa } from '@/services/supabaseService';
import { getKeuanganSummary, getPengeluaran, getPembelian } from '@/database/db';
import { formatDate, formatDateShort, getThisMonth, getThisWeek, getToday, getMonthName } from '@/utils/dateUtils';
import { exportToCSV, exportToExcel, exportToPDF, generateReportHTML } from '@/utils/exportUtils';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Extracted Components
import PeriodModal, { PeriodType } from '@/components/modals/PeriodModal';
import ExportModal from '@/components/modals/ExportModal';
import TransactionCard from '@/components/penjualan/TransactionCard';
import ExpenseCard from '@/components/penjualan/ExpenseCard';
import PurchaseCard from '@/components/penjualan/PurchaseCard';

type TabType = 'Pemasukan' | 'Belanja Stok' | 'Operasional';

export default function PembukuanScreen() {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { shopInfo } = useShop();

    const [activeTab, setActiveTab] = useState<TabType>('Pemasukan');
    const [period, setPeriod] = useState<PeriodType>('today');
    const [customStartDate, setCustomStartDate] = useState(new Date());
    const [customEndDate, setCustomEndDate] = useState(new Date());
    
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);

    const [transactions, setTransactions] = useState<any[]>([]);
    const [purchases, setPurchases] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);

    const tabs: TabType[] = ['Pemasukan', 'Belanja Stok', 'Operasional'];

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

            // 1. Transactions (Pemasukan)
            const txns = await getTransactionsSupa();
            const filteredTxns = txns.filter((t: any) => {
                const txnDate = new Date(t.tanggal_transaksi).getTime();
                const startDate = new Date(range.start).getTime();
                const endDate = new Date(range.end).getTime();
                return txnDate >= startDate && txnDate <= endDate;
            });
            setTransactions(filteredTxns);

            // 2. Pembelian (Belanja Stok)
            const dbPurchases = await getPembelian(range.start, range.end);
            setPurchases(dbPurchases);

            // 3. Pengeluaran (Operasional)
            const dbExpenses = await getPengeluaran(range.start, range.end);
            setExpenses(dbExpenses);

            // 4. Summary Keuangan
            const finSummary = await getKeuanganSummary(range.start, range.end);
            setSummary(finSummary);

        } catch (error) {
            console.error('Error loading keuangan data:', error);
            Alert.alert('Error', 'Gagal memuat data pembukuan');
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
        Alert.alert('Info', 'Fitur export laporan sedang disesuaikan dengan skema pembukuan baru.');
        setShowExportModal(false);
    };

    const renderTabContent = () => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Menghitung Saldo...</Text>
                </View>
            );
        }

        switch (activeTab) {
            case 'Pemasukan':
                return transactions.length > 0 ? (
                    <FlatList
                        key="riwayat-list"
                        data={transactions}
                        renderItem={({ item }) => <TransactionCard item={item} />}
                        keyExtractor={item => item.id_transaksi}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="wallet-outline" size={64} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Belum ada pemasukan</Text>
                    </View>
                );

            case 'Belanja Stok':
                return purchases.length > 0 ? (
                    <FlatList
                        key="pembelian-list"
                        data={purchases}
                        renderItem={({ item }) => <PurchaseCard item={item} />}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Belum ada belanja stok</Text>
                    </View>
                );

            case 'Operasional':
                return expenses.length > 0 ? (
                    <FlatList
                        key="pengeluaran-list"
                        data={expenses}
                        renderItem={({ item }) => <ExpenseCard item={item} />}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Tidak ada pengeluaran</Text>
                    </View>
                );
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Pembukuan</Text>
                    <TouchableOpacity onPress={() => setShowPeriodModal(true)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Text style={{ color: colors.primary, fontWeight: '600' }}>
                        {period === 'today' ? 'Hari Ini' : period === 'week' ? 'Minggu Ini' : period === 'month' ? `Bulan Ini (${getMonthName()})` : 'Tanggal Custom'}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={[styles.glassButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]} onPress={() => setShowExportModal(true)}>
                    <Ionicons name="download-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Financial Summary Dashboard */}
            {summary && (
                <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
                    <Text style={styles.summaryLabelTop}>Total Saldo Bersih</Text>
                    <Text style={styles.summaryValueBig}>Rp {(summary.saldoBersih || 0).toLocaleString()}</Text>
                    
                    <View style={styles.flowContainer}>
                        <View style={styles.flowBox}>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                                <Ionicons name="arrow-down-circle" size={16} color="#4ADE80" />
                                <Text style={styles.flowLabel}> Uang Masuk</Text>
                            </View>
                            <Text style={styles.flowValue}>Rp {(summary.totalRevenue || 0).toLocaleString()}</Text>
                        </View>
                        <View style={styles.flowDivider} />
                        <View style={styles.flowBox}>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                                <Ionicons name="arrow-up-circle" size={16} color="#F87171" />
                                <Text style={styles.flowLabel}> Uang Keluar</Text>
                            </View>
                            <Text style={styles.flowValue}>Rp {(summary.totalKeluar || 0).toLocaleString()}</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Tab Navigation */}
            <View style={[styles.tabContainer, { backgroundColor: colors.pill }]}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && [styles.activeTab, { backgroundColor: colors.background }]]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, { color: activeTab === tab ? colors.text : colors.textSecondary }]}>{tab}</Text>
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

            {/* FAB + Menu */}
            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={() => Alert.alert('Segera Hadir', 'Fitur Form Tambah Pengeluaran & Belanja Stok akan kita buat selanjutnya!')}
            >
                <Ionicons name="add" size={32} color="#FFF" />
            </TouchableOpacity>

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
                currentPeriod={period}
                onSelectPeriod={setPeriod}
                onCustomRangeSelect={() => setShowStartPicker(true)}
                periodLabel={
                    period === 'today' ? 'Hari Ini' :
                    period === 'week' ? 'Minggu Ini' :
                    period === 'month' ? 'Bulan Ini' :
                    `${formatDateShort(customStartDate.toISOString())} - ${formatDateShort(customEndDate.toISOString())}`
                }
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
    glassButton: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    headerTitle: { fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },

    summaryCard: { marginHorizontal: 16, marginTop: 4, marginBottom: 16, padding: 16, borderRadius: 20, shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
    summaryLabelTop: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 8, fontWeight: '600', letterSpacing: 0.5, textAlign: 'center' },
    summaryValueBig: { fontSize: 26, fontWeight: '800', color: '#FFF', letterSpacing: 0.5, textAlign: 'center', marginBottom: 16 },
    
    flowContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 16, padding: 12 },
    flowBox: { flex: 1, alignItems: 'center' },
    flowDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
    flowLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600' },
    flowValue: { color: '#FFF', fontSize: 15, fontWeight: '700' },

    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 14,
        padding: 4,
        backgroundColor: '#1E293B',
    },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    activeTab: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    tabText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.2, textAlign: 'center' },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    
    fab: {
        position: 'absolute',
        bottom: 110,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0EA5E9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    }
});
