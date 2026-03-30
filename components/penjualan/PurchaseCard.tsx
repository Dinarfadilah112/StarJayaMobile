import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PurchaseCard({ item }: { item: any }) {
    return (
        <View style={styles.card}>
            <View style={styles.iconBox}>
                <Ionicons name="cart-outline" size={24} color="#F59E0B" />
            </View>
            <View style={styles.content}>
                <Text style={styles.supplier}>{item.supplier || "Supplier Umum"}</Text>
                <Text style={styles.tanggal}>{new Date(item.tanggal).toLocaleDateString('id-ID')}</Text>
                <Text style={styles.id}>#{item.id}</Text>
            </View>
            <Text style={styles.nominal}>- Rp {item.total_harga.toLocaleString()}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderRadius: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFFBEB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    content: { flex: 1 },
    supplier: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    tanggal: { fontSize: 12, color: '#64748B', marginTop: 2 },
    id: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
    nominal: { fontSize: 16, fontWeight: '800', color: '#F59E0B' }
});
