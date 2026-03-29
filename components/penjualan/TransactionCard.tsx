import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { formatDate } from '@/utils/dateUtils';
import { getTransactionDetailsSupa } from '@/services/supabaseService';

interface Props {
    item: any;
}

export default function TransactionCard({ item }: Props) {
    const { colors } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const [details, setDetails] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handlePress = async () => {
        if (!isExpanded && details.length === 0) {
            setLoading(true);
            try {
                const fetched = await getTransactionDetailsSupa(item.id_transaksi);
                setDetails(fetched);
            } catch (e) {
                console.error("Failed to load details", e);
            } finally {
                setLoading(false);
            }
        }
        setIsExpanded(!isExpanded);
    };

    return (
        <TouchableOpacity
            style={[styles.transactionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.transactionHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.transactionId, { color: colors.text }]}>{item.id_transaksi}</Text>
                    <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>{formatDate(item.tanggal_transaksi)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.transactionTotal, { color: colors.primary }]}>Rp {item.total_harga.toLocaleString()}</Text>
                    <Text style={[styles.paymentMethod, { color: colors.textSecondary }]}>{item.payment_method || 'Tunai'}</Text>
                </View>
            </View>

            {isExpanded && (
                <View style={[styles.transactionDetails, { borderTopColor: colors.cardBorder }]}>
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 10 }} />
                    ) : (
                        <>
                            <View style={{ marginBottom: 8 }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 }}>JENIS BARANG / JASA</Text>
                            </View>
                            {details.map((detail: any, index: number) => (
                                <View key={index} style={styles.detailRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.detailItemName, { color: colors.text }]}>{detail.nama_barang}</Text>
                                        <Text style={[styles.detailItemCode, { color: colors.textSecondary }]}>{detail.kode_barang || '-'}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[styles.detailItemPrice, { color: colors.text }]}>Rp {(detail.harga_satuan * detail.jumlah).toLocaleString()}</Text>
                                        <Text style={[styles.detailItemQty, { color: colors.textSecondary }]}>{detail.jumlah} x Rp {detail.harga_satuan.toLocaleString()}</Text>
                                    </View>
                                </View>
                            ))}
                            {item.service_fee > 0 && (
                                <View style={[styles.detailRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.cardBorder, borderStyle: 'dashed' }]}>
                                    <Text style={[styles.detailItemName, { color: colors.textSecondary, fontWeight: '600' }]}>Biaya Jasa</Text>
                                    <Text style={[styles.detailItemPrice, { color: colors.text }]}>Rp {item.service_fee.toLocaleString()}</Text>
                                </View>
                            )}
                            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.cardBorder }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>Subtotal</Text>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>Rp {(item.total_harga - (item.service_fee || 0)).toLocaleString()}</Text>
                                </View>
                                {item.service_fee > 0 && (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>Service Fee</Text>
                                        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>Rp {item.service_fee.toLocaleString()}</Text>
                                    </View>
                                )}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Total</Text>
                                    <Text style={{ fontSize: 16, fontWeight: '800', color: colors.primary }}>Rp {item.total_harga.toLocaleString()}</Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    transactionCard: { marginBottom: 12, borderRadius: 16, padding: 18, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
    transactionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    transactionId: { fontSize: 14, fontWeight: '700', marginBottom: 6, letterSpacing: 0.2 },
    transactionDate: { fontSize: 12, opacity: 0.7 },
    transactionTotal: { fontSize: 18, fontWeight: '800', letterSpacing: 0.3 },
    paymentMethod: { fontSize: 11, marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: 'rgba(14, 165, 233, 0.1)', overflow: 'hidden', alignSelf: 'flex-end' },
    transactionDetails: { marginTop: 14, paddingTop: 14, borderTopWidth: 1 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' },
    detailItemName: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
    detailItemCode: { fontSize: 11, opacity: 0.7 },
    detailItemPrice: { fontSize: 13, fontWeight: '700' },
    detailItemQty: { fontSize: 11, opacity: 0.7, marginTop: 2 },
});
