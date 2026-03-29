import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface Props {
    item: any;
}

export default function LowStockCard({ item }: Props) {
    const { colors } = useTheme();

    return (
        <View style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <MaterialCommunityIcons name="alert" size={24} color="#EF4444" />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.nama_barang}</Text>
                <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>{item.kode_barang}</Text>
            </View>
            <View style={[styles.stockBadge, { backgroundColor: item.stok <= 5 ? '#FEE2E2' : '#FEF3C7' }]}>
                <Text style={[styles.stockText, { color: item.stok <= 5 ? '#DC2626' : '#D97706' }]}>Stok: {item.stok}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    listItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    itemName: { fontSize: 15, fontWeight: '700', marginBottom: 5, letterSpacing: 0.2 },
    itemDetail: { fontSize: 11, opacity: 0.65, letterSpacing: 0.2 },
    stockBadge: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
    stockText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
});
