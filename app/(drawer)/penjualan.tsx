import { useShop } from '@/context/ShopContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function PenjualanScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('Harian');
    const { transactions } = useShop();
    const { colors, theme } = useTheme();

    const tabs = ['Harian', 'Mingguan', 'Bulanan'];

    const productSales: { [key: string]: number } = {};
    transactions.forEach(t => {
        t.items.forEach(item => {
            productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
        });
    });

    const sortedProducts = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

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
                <Text style={[styles.headerTitle, { color: colors.text }]}>Laporan Penjualan</Text>
                <TouchableOpacity style={[styles.glassButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                    <Ionicons name="download-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.tabContainer, { backgroundColor: colors.pill }]}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tabItem, activeTab === tab && { backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF', shadowColor: '#000' }]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, { color: activeTab === tab ? colors.text : colors.textSecondary }]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Tren Pendapatan</Text>
                    <View style={styles.chartPlaceholder}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: colors.textSecondary, marginBottom: 10 }}>Total Transaksi: {transactions.length}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 10 }}>
                                {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                                    <View key={i} style={{ width: 20, height: h, backgroundColor: colors.primary, borderRadius: 4 }} />
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Produk Terlaris</Text>
                <View style={[styles.listContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    {sortedProducts.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: colors.textSecondary }}>Belum ada penjualan.</Text>
                        </View>
                    ) : (
                        sortedProducts.map(([name, count], index) => (
                            <View key={name} style={styles.rowItem}>
                                <View style={[styles.rankBadge, { backgroundColor: index === 0 ? '#F59E0B' : (index === 1 ? '#9CA3AF' : '#D1D5DB') }]}>
                                    <Text style={styles.rankText}>{index + 1}</Text>
                                </View>
                                <Text style={[styles.productName, { color: colors.text }]}>{name}</Text>
                                <Text style={[styles.salesCount, { color: colors.textSecondary }]}>{count} terjual</Text>
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
    blob1: { position: 'absolute', top: -50, left: -50, width: 250, height: 250, borderRadius: 125, opacity: 0.4 },
    blob2: { position: 'absolute', bottom: -50, right: -50, width: 300, height: 300, borderRadius: 150, opacity: 0.4 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, marginTop: 10, zIndex: 10 },
    glassButton: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    content: { padding: 24 },
    tabContainer: { flexDirection: 'row', borderRadius: 16, padding: 4, marginBottom: 24 },
    tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    tabText: { fontSize: 14, fontWeight: '500' },
    chartCard: { borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16 },
    cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 20 },
    chartPlaceholder: { height: 150, paddingHorizontal: 10 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
    listContainer: { borderRadius: 24, padding: 16, borderWidth: 1 },
    rowItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    rankBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    rankText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    productName: { flex: 1, fontSize: 14, fontWeight: '500' },
    salesCount: { fontSize: 12 },
});
