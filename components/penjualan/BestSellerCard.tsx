import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

interface Props {
    item: any;
}

export default function BestSellerCard({ item }: Props) {
    const { colors } = useTheme();

    return (
        <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.rankBadge}>
                <Ionicons name="trophy" size={16} color="#FFD700" />
            </View>
            <Text style={[styles.productName, { color: colors.text }]}>{item.nama_barang}</Text>
            <Text style={[styles.productCode, { color: colors.textSecondary }]}>{item.kode_barang}</Text>
            <View style={styles.productStats}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Terjual</Text>
                    <Text style={[styles.statValue, { color: colors.primary }]}>{item.total_sold}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Revenue</Text>
                    <Text style={[styles.statValue, { color: colors.primary }]}>Rp {(item.total_revenue || 0).toLocaleString()}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    productCard: { flex: 1, minWidth: (width - 44) / 2, borderRadius: 18, padding: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
    rankBadge: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
    productName: { fontSize: 15, fontWeight: '700', marginBottom: 4, lineHeight: 20, letterSpacing: 0.2 },
    productCode: { fontSize: 11, marginBottom: 14, opacity: 0.6, letterSpacing: 0.3 },
    productStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
    statLabel: { fontSize: 10, marginBottom: 5, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
    statValue: { fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
});
