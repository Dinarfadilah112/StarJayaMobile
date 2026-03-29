import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface Props {
    item: any;
}

export default function SlowMoverCard({ item }: Props) {
    const { colors } = useTheme();

    return (
        <View style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <MaterialCommunityIcons name="alert-circle" size={24} color="#F59E0B" />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.nama_barang}</Text>
                <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>{item.kode_barang}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.itemValue, { color: colors.text }]}>Terjual: {item.total_sold}</Text>
                <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>Stok: {item.stok}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    listItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    itemName: { fontSize: 15, fontWeight: '700', marginBottom: 5, letterSpacing: 0.2 },
    itemDetail: { fontSize: 11, opacity: 0.65, letterSpacing: 0.2 },
    itemValue: { fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
});
