import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ExpenseCard({ item }: { item: any }) {
    return (
        <View style={styles.card}>
            <View style={styles.iconBox}>
                <Ionicons name="receipt-outline" size={24} color="#EF4444" />
            </View>
            <View style={styles.content}>
                <Text style={styles.kategori}>{item.kategori}</Text>
                <Text style={styles.tanggal}>{new Date(item.tanggal).toLocaleDateString('id-ID')}</Text>
                {item.keterangan ? <Text style={styles.keterangan}>{item.keterangan}</Text> : null}
            </View>
            <Text style={styles.nominal}>- Rp {item.jumlah.toLocaleString()}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderRadius: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    content: { flex: 1 },
    kategori: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    tanggal: { fontSize: 12, color: '#64748B', marginTop: 2 },
    keterangan: { fontSize: 12, color: '#64748B', marginTop: 4, fontStyle: 'italic' },
    nominal: { fontSize: 16, fontWeight: '800', color: '#EF4444' }
});
