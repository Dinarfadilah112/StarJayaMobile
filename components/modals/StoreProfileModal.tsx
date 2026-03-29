import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useShop } from '@/context/ShopContext';
import { updateShopSettings } from '@/database/db';
import { updateStoreSettingsSupa } from '@/services/supabaseService';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function StoreProfileModal({ visible, onClose }: Props) {
    const { shopInfo, refreshData } = useShop();

    const [storeName, setStoreName] = useState('mOTO Workshop');
    const [storeAddress, setStoreAddress] = useState('');
    const [storePhone, setStorePhone] = useState('');
    const [receiptFooter, setReceiptFooter] = useState('');

    useEffect(() => {
        if (shopInfo) {
            setStoreName(shopInfo.name);
            setStoreAddress(shopInfo.address || '');
            setStorePhone(shopInfo.phone || '');
            setReceiptFooter(shopInfo.footer_note || '');
        }
    }, [shopInfo, visible]);

    const handleSaveStore = async () => {
        try {
            updateShopSettings({
                name: storeName,
                address: storeAddress,
                phone: storePhone,
                footer_note: receiptFooter
            });

            try {
                await updateStoreSettingsSupa({
                    store_name: storeName,
                    store_address: storeAddress,
                    store_phone: storePhone,
                    receipt_footer: receiptFooter
                });
            } catch (e) {
                console.log("Cloud sync failed, saved locally.");
            }

            refreshData();
            Alert.alert("Sukses", "Pengaturan Toko berhasil disimpan.");
            onClose();
        } catch (e) {
            Alert.alert("Error", "Gagal menyimpan pengaturan.");
        }
    };

    const ReceiptPreview = () => (
        <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Live Preview Struk</Text>
            <View style={styles.receiptPaper}>
                <View style={styles.receiptContent}>
                    {/* Header */}
                    <Text style={styles.receiptStoreName}>{storeName || 'STAR JAYA BENGKEL'}</Text>
                    <View style={styles.receiptHeaderLine} />
                    
                    <Text style={styles.receiptAddress}>
                        {storeAddress || 'QJMQ+JG3, JL. SEKNEG RAYA, RT.009/RW.003, PANUNGGANGAN UTARA, KEC. PINANG, KOTA TANGERANG, BANTEN 15143'}
                    </Text>
                    <Text style={styles.receiptPhone}>{storePhone || '087780790668'}</Text>
                    
                    <View style={styles.receiptDashedLine} />
                    <Text style={styles.receiptTrxNo}>No: TRX-1774285106</Text>
                    <View style={styles.receiptDashedLine} />
                    
                    {/* Items Table */}
                    <View style={styles.receiptItemRow}>
                        <Text style={styles.receiptItemName}>1 GREASE</Text>
                        <Text style={styles.receiptItemQty}>1</Text>
                        <Text style={styles.receiptItemPrice}>1</Text>
                    </View>
                    <View style={styles.receiptItemRow}>
                        <Text style={styles.receiptItemName}>1 MANGKOK GANDA</Text>
                        <Text style={styles.receiptItemQty}>1</Text>
                        <Text style={styles.receiptItemPrice}>1</Text>
                    </View>
                    <View style={styles.receiptDottedLine} />
                    
                    {/* Summary */}
                    <View style={styles.receiptSummaryRow}>
                        <Text style={styles.receiptSummaryText}>Total Item</Text>
                        <Text style={styles.receiptSummaryValue}>2</Text>
                    </View>
                    <View style={styles.receiptSummaryRow}>
                        <Text style={styles.receiptSummaryText}>Total Belanja</Text>
                        <Text style={[styles.receiptSummaryValue, {fontWeight: '900'}]}>2</Text>
                    </View>
                    <View style={styles.receiptSummaryRow}>
                        <Text style={styles.receiptSummaryText}>Jasa / Service</Text>
                        <Text style={styles.receiptSummaryValue}>0</Text>
                    </View>
                    
                    <View style={styles.receiptDashedLine} />
                    <View style={styles.receiptSummaryRow}>
                        <Text style={[styles.receiptSummaryText, {fontWeight: '900', fontSize: 12}]}>TOTAL TAGIHAN</Text>
                        <Text style={[styles.receiptSummaryValue, {fontWeight: '900', fontSize: 12}]}>2</Text>
                    </View>
                    
                    <View style={styles.receiptSummaryRow}>
                        <Text style={styles.receiptSummaryText}>Tunai</Text>
                        <Text style={styles.receiptSummaryValue}>2</Text>
                    </View>
                    <View style={styles.receiptSummaryRow}>
                        <Text style={styles.receiptSummaryText}>Kembalian</Text>
                        <Text style={styles.receiptSummaryValue}>0</Text>
                    </View>
                    
                    <View style={styles.receiptDashedLine} />
                    <Text style={[styles.receiptCenterText, {marginVertical: 4}]}>Tgl. Cetak: 23-03-2026 23:58:45</Text>
                    <View style={styles.receiptDashedLine} />
                    
                    {/* Footer */}
                    <Text style={styles.receiptFooterBold}>TERIMA KASIH</Text>
                    <Text style={styles.receiptFooterBold}>Silakan Datang Kembali</Text>
                    
                    <View style={{marginTop: 15}}>
                        <Text style={styles.receiptNote}>
                            <Text style={{fontWeight: '900'}}>NOTE : </Text>
                            {receiptFooter || 'JIKA ADA KOMPLAIN/KERUSAKAN SPAREPART (ITEM) SERTAKAN STRUK PEMBELIAN, JIKA TIDAK ADA BUKTI STRUK PEMBELIAN KAMI ANGGAP HANGUS'}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Profil Toko</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <ReceiptPreview />

                        <View style={{ marginTop: 20 }}>
                            <Text style={styles.label}>Nama Toko</Text>
                            <TextInput
                                style={styles.inputBox}
                                value={storeName} onChangeText={setStoreName} placeholderTextColor="#94A3B8"
                            />

                            <Text style={styles.label}>Alamat Lengkap (di Struk)</Text>
                            <TextInput
                                style={[styles.inputBox, { height: 60, textAlignVertical: 'top' }]}
                                multiline
                                value={storeAddress} onChangeText={setStoreAddress} placeholderTextColor="#94A3B8"
                            />

                            <Text style={styles.label}>Nomor Telepon</Text>
                            <TextInput
                                style={styles.inputBox}
                                keyboardType="phone-pad"
                                value={storePhone} onChangeText={setStorePhone} placeholderTextColor="#94A3B8"
                            />

                            <Text style={styles.label}>Pesan Footer Struk (Catatan Bawah)</Text>
                            <TextInput
                                style={styles.inputBox}
                                value={receiptFooter} onChangeText={setReceiptFooter} placeholderTextColor="#94A3B8"
                            />
                        </View>

                        <TouchableOpacity onPress={handleSaveStore} style={[styles.primaryBtn, { marginTop: 24 }]}>
                            <Text style={styles.primaryBtnText}>Simpan Pengaturan Toko</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%', paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
    
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8, marginTop: 16 },
    inputBox: { borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, fontSize: 16, color: '#0F172A' },

    primaryBtn: { backgroundColor: '#2563EB', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 32 },
    primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

    // Receipt Preview Styles
    previewContainer: { backgroundColor: '#F1F5F9', borderRadius: 24, padding: 16, marginBottom: 10 },
    previewTitle: { fontSize: 12, fontWeight: '800', color: '#64748B', marginBottom: 12, textTransform: 'uppercase', textAlign: 'center' },
    receiptPaper: { backgroundColor: '#FFFFFF', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    receiptContent: { alignItems: 'center' },
    
    receiptStoreName: { fontSize: 20, fontWeight: '900', color: '#000', textAlign: 'center', textTransform: 'uppercase' },
    receiptHeaderLine: { height: 4, backgroundColor: '#000', width: '100%', marginTop: 2, marginBottom: 12 },
    receiptAddress: { fontSize: 9, color: '#000', textAlign: 'center', fontWeight: '500', lineHeight: 12, marginBottom: 2 },
    receiptPhone: { fontSize: 9, color: '#000', textAlign: 'center', fontWeight: '500', marginBottom: 8 },
    
    receiptDashedLine: { height: 1.5, borderStyle: 'dotted', borderWidth: 1, borderColor: '#000', width: '100%', marginVertical: 6 },
    receiptDottedLine: { height: 1, borderStyle: 'dotted', borderWidth: 1, borderColor: '#ccc', width: '100%', marginVertical: 8 },
    
    receiptTrxNo: { fontSize: 10, color: '#000', alignSelf: 'flex-start', fontWeight: '500' },
    
    receiptItemRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 6 },
    receiptItemName: { fontSize: 11, fontWeight: '900', color: '#000', flex: 2, textTransform: 'uppercase' },
    receiptItemQty: { fontSize: 11, color: '#000', flex: 1, textAlign: 'center' },
    receiptItemPrice: { fontSize: 11, color: '#000', flex: 1, textAlign: 'right' },
    
    receiptSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 4 },
    receiptSummaryText: { fontSize: 11, color: '#000' },
    receiptSummaryValue: { fontSize: 11, color: '#000', textAlign: 'right' },
    
    receiptCenterText: { fontSize: 10, color: '#000', textAlign: 'center' },
    receiptFooterBold: { fontSize: 12, fontWeight: '900', color: '#000', textAlign: 'center', textTransform: 'uppercase' },
    receiptNote: { fontSize: 9, color: '#000', textAlign: 'center', lineHeight: 12, fontWeight: '500' },
});
