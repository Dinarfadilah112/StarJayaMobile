import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Alert, Linking, Platform, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useShop } from '@/context/ShopContext';
import { updateShopSettings } from '@/database/db';
import { updateStoreSettingsSupa } from '@/services/supabaseService';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import * as Print from 'expo-print';
import * as IntentLauncher from 'expo-intent-launcher';
import { generateReceiptHtml } from '@/utils/receiptHtml';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function StoreProfileModal({ visible, onClose }: Props) {
    const { shopInfo, refreshData, transactions } = useShop();
    const lastTrx = transactions[0];

    const [storeName, setStoreName] = useState('');
    const [storeAddress, setStoreAddress] = useState('');
    const [storePhone, setStorePhone] = useState('');
    const [receiptFooter, setReceiptFooter] = useState('');
    const [logoUri, setLogoUri] = useState<string | null>(null);
    const [fontSize, setFontSize] = useState(11);
    const [receiptColor, setReceiptColor] = useState('#000000');
    const [paperSize, setPaperSize] = useState<'58mm' | '80mm'>('58mm');

    useEffect(() => {
        if (shopInfo) {
            setStoreName(shopInfo.name);
            setStoreAddress(shopInfo.address || '');
            setStorePhone(shopInfo.phone || '');
            setReceiptFooter(shopInfo.footer_note || '');
            setLogoUri(shopInfo.logo_uri || null);
            setFontSize(shopInfo.receipt_font_size || 11);
            setReceiptColor(shopInfo.receipt_color || '#000000');
            setPaperSize(shopInfo.paper_size || '58mm');
        }
    }, [shopInfo, visible]);

    const pickLogo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setLogoUri(result.assets[0].uri);
        }
    };

    const handleSaveStore = async () => {
        try {
            await updateShopSettings({
                name: storeName,
                address: storeAddress,
                phone: storePhone,
                footer_note: receiptFooter,
                logo_uri: logoUri || undefined,
                receipt_font_size: fontSize,
                receipt_color: receiptColor,
                paper_size: paperSize
            });

            try {
                await updateStoreSettingsSupa({
                    name: storeName,
                    address: storeAddress,
                    phone: storePhone,
                    footer_note: receiptFooter,
                    logo_uri: logoUri || undefined,
                    receipt_font_size: fontSize,
                    receipt_color: receiptColor,
                    paper_size: paperSize
                });
            } catch (supaErr) {}

            await refreshData();
            Alert.alert("Berhasil", "Pengaturan telah diperbarui.");
            onClose();
        } catch (error) {
            console.error('Error saving store info:', error);
        }
    };

    const handleOpenBluetooth = async () => {
        if (Platform.OS === 'android') {
            try {
                await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.BLUETOOTH_SETTINGS);
            } catch (error) {
                Alert.alert("Gagal", "Buka pengaturan Bluetooth secara manual.");
            }
        } else {
            Linking.openURL('App-Prefs:root=Bluetooth');
        }
    };

    const handlePrintTest = async () => {
        const dummyCart = [{ name: 'TES STRUK STARJAYA', quantity: 1, price: 5000 }];
        const html = generateReceiptHtml(
            lastTrx?.id || 'TRX-TEST-01',
            new Date(),
            dummyCart,
            5000,
            0,
            'Tunai',
            {
                store_name: storeName,
                store_address: storeAddress,
                store_phone: storePhone,
                receipt_footer: receiptFooter,
                logo_uri: logoUri || undefined,
                receipt_font_size: fontSize,
                receipt_color: receiptColor,
                paper_size: paperSize
            }
        );

        try {
            await Print.printAsync({ html });
        } catch (error) {
            Alert.alert('Gagal', 'Printer tidak terdeteksi.');
        }
    };

    const formatRupiah = (num: number) => 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const ReceiptPreview = () => (
        <View style={styles.previewContainer}>
            <View style={styles.previewBadge}>
                <Ionicons name="eye" size={12} color="#64748B" />
                <Text style={styles.previewBadgeText}>LIVE PREVIEW ({paperSize})</Text>
            </View>
            <View style={[
                styles.receiptPaper, 
                { 
                    borderColor: receiptColor + '40',
                    width: paperSize === '80mm' ? '100%' : '78%',
                    alignSelf: 'center'
                }
            ]}>
                <View style={styles.receiptContent}>
                    {logoUri ? (
                        <Image source={{ uri: logoUri }} style={{ width: 44, height: 44, marginBottom: 4 }} contentFit="contain" />
                    ) : (
                        <View style={[styles.dummyLogo, { borderColor: receiptColor + '20' }]}>
                            <Ionicons name="business" size={20} color={receiptColor + '40'} />
                        </View>
                    )}
                    <Text style={[styles.receiptStoreName, { color: receiptColor, fontSize: fontSize * 1.8 }]}>
                        {storeName || 'STAR JAYA BENGKEL'}
                    </Text>
                    <View style={[styles.receiptHeaderLine, { backgroundColor: receiptColor }]} />
                    
                    <Text style={[styles.receiptAddress, { color: receiptColor, fontSize: fontSize * 0.8 }]}>
                        {storeAddress || 'Alamat Toko Belum Diatur...'}
                    </Text>
                    <Text style={[styles.receiptPhone, { color: receiptColor, fontSize: fontSize * 0.8 }]}>
                        {storePhone || 'No. HP Belum Diatur'}
                    </Text>
                    
                    <View style={[styles.receiptDashedLine, { borderColor: receiptColor }]} />
                    <Text style={[styles.receiptTrxNo, { color: receiptColor, fontSize: fontSize * 0.9 }]}>No: {lastTrx?.id || 'TRX-12345678'}</Text>
                    <View style={[styles.receiptDashedLine, { borderColor: receiptColor }]} />
                    
                    <View style={styles.receiptItemRow}>
                        <Text style={[styles.receiptItemName, { color: receiptColor, fontSize: fontSize }]}>ITEM CONTOH A</Text>
                        <Text style={[styles.receiptItemQty, { color: receiptColor, fontSize: fontSize }]}>1</Text>
                        <Text style={[styles.receiptItemPrice, { color: receiptColor, fontSize: fontSize }]}>{formatRupiah(15000)}</Text>
                    </View>
                    <View style={styles.receiptDottedLine} />
                    
                    <View style={styles.receiptSummaryRow}>
                        <Text style={[styles.receiptSummaryText, { color: receiptColor, fontWeight: '900', fontSize: fontSize + 2 }]}>TOTAL</Text>
                        <Text style={[styles.receiptSummaryValue, { color: receiptColor, fontWeight: '900', fontSize: fontSize + 2 }]}>{formatRupiah(15000)}</Text>
                    </View>
                    
                    <View style={[styles.receiptDashedLine, { borderColor: receiptColor }]} />
                    <Text style={[styles.receiptFooterBold, { color: receiptColor, fontSize: fontSize + 1 }]}>TERIMA KASIH</Text>

                    <View style={{ marginTop: 8 }}>
                        <Text style={[styles.receiptNote, { color: receiptColor, fontSize: fontSize * 0.75 }]}>
                            <Text style={{ fontWeight: '900' }}>NOTE : </Text>
                            {receiptFooter || 'Catatan struk akan muncul di sini...'}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: '#F8FAFC' }]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Desain & Pengaturan Struk</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                        <ReceiptPreview />

                        <View style={styles.btnRow}>
                            <TouchableOpacity style={[styles.utilityBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]} onPress={handleOpenBluetooth}>
                                <Ionicons name="bluetooth" size={18} color="#2563EB" />
                                <Text style={[styles.utilityBtnText, { color: '#2563EB' }]}>Hubungkan</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.utilityBtn, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]} onPress={handlePrintTest}>
                                <Ionicons name="print" size={18} color="#16A34A" />
                                <Text style={[styles.utilityBtnText, { color: '#16A34A' }]}>Tes Print</Text>
                            </TouchableOpacity>
                        </View>

                        {/* --- Section 1: Branding --- */}
                        <View style={styles.formSection}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="business" size={18} color="#1E293B" />
                                <Text style={styles.sectionTitle}>Identitas Toko</Text>
                            </View>

                            <Text style={styles.fieldLabel}>Nama Toko</Text>
                            <TextInput style={styles.input} value={storeName} onChangeText={setStoreName} placeholder="Masukkan nama toko..." />

                            <Text style={styles.fieldLabel}>Alamat Toko</Text>
                            <TextInput style={[styles.input, { height: 80 }]} value={storeAddress} onChangeText={setStoreAddress} placeholder="Alamat lengkap..." multiline />

                            <Text style={styles.fieldLabel}>Nomor Kontak</Text>
                            <TextInput style={styles.input} value={storePhone} onChangeText={setStorePhone} placeholder="No. HP / WhatsApp..." keyboardType="phone-pad" />
                        </View>

                        {/* --- Section 2: Receipt Style --- */}
                        <View style={styles.formSection}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="color-palette" size={18} color="#1E293B" />
                                <Text style={styles.sectionTitle}>Gaya & Tampilan</Text>
                            </View>

                            <TouchableOpacity style={styles.logoPicker} onPress={pickLogo}>
                                <View style={styles.logoIcon}>
                                    <Ionicons name="image-outline" size={24} color="#64748B" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.logoTitle}>{logoUri ? 'Ganti Logo' : 'Tambah Logo'}</Text>
                                    <Text style={styles.logoSubtext}>{logoUri ? 'Logo tersimpan secara lokal' : 'Opsional (Rasio 1:1)'}</Text>
                                </View>
                                {logoUri && <Ionicons name="checkmark-circle" size={24} color="#10B981" />}
                            </TouchableOpacity>

                            <Text style={styles.fieldLabel}>Catatan Bawah (Footer)</Text>
                            <TextInput style={styles.input} value={receiptFooter} onChangeText={setReceiptFooter} placeholder="Pesan ucapan terima kasih..." />

                            <View style={styles.optionRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.fieldLabel}>Ukuran Font</Text>
                                    <View style={styles.pillRow}>
                                        {[9, 11, 13].map((s) => (
                                            <TouchableOpacity key={s} onPress={() => setFontSize(s)} style={[styles.pill, fontSize === s && styles.pillActive]}>
                                                <Text style={[styles.pillText, fontSize === s && styles.pillTextActive]}>{s === 9 ? 'S' : s === 11 ? 'M' : 'L'}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.fieldLabel}>Warna Aksen</Text>
                                    <View style={styles.pillRow}>
                                        {['#000000', '#2563EB', '#10B981'].map((c) => (
                                            <TouchableOpacity key={c} onPress={() => setReceiptColor(c)} style={[styles.colorDot, { backgroundColor: c, borderWidth: receiptColor === c ? 2 : 0, borderColor: '#CBD5E1' }]} />
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.fieldLabel}>Ukuran Kertas Printer</Text>
                            <View style={styles.pillRow}>
                                {['58mm', '80mm'].map((size) => (
                                    <TouchableOpacity key={size} onPress={() => setPaperSize(size as any)} style={[styles.pill, { flex: 1 }, paperSize === size && styles.pillActive]}>
                                        <Text style={[styles.pillText, paperSize === size && styles.pillTextActive]}>Thermal {size}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity onPress={handleSaveStore} style={styles.saveBtn}>
                            <Text style={styles.saveBtnText}>Simpan Semua Perubahan</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, height: '94%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    closeBtn: { padding: 4 },

    previewContainer: { marginBottom: 16 },
    previewBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: -12, zIndex: 10, borderWidth: 1.5, borderColor: '#E2E8F0' },
    previewBadgeText: { fontSize: 10, fontWeight: '800', color: '#64748B', marginLeft: 6, letterSpacing: 0.5 },
    receiptPaper: { backgroundColor: '#FFFFFF', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8, borderWidth: 1, borderRadius: 4 },
    receiptContent: { alignItems: 'center' },
    dummyLogo: { width: 44, height: 44, borderRadius: 22, borderStyle: 'dashed', borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    receiptStoreName: { fontWeight: '900', textAlign: 'center', textTransform: 'uppercase' },
    receiptHeaderLine: { height: 3, width: '100%', marginTop: 2, marginBottom: 8 },
    receiptAddress: { textAlign: 'center', fontWeight: '500', marginBottom: 2 },
    receiptPhone: { textAlign: 'center', fontWeight: '500', marginBottom: 4 },
    receiptDashedLine: { height: 1, borderStyle: 'dashed', borderWidth: 0.5, width: '100%', marginVertical: 4 },
    receiptDottedLine: { height: 1.5, borderStyle: 'dotted', borderWidth: 1, borderColor: '#ccc', width: '100%', marginVertical: 8 },
    receiptTrxNo: { alignSelf: 'flex-start', fontWeight: '500' },
    receiptItemRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 4 },
    receiptItemName: { fontWeight: '900', flex: 2, textTransform: 'uppercase' },
    receiptItemQty: { flex: 1, textAlign: 'center' },
    receiptItemPrice: { flex: 1, textAlign: 'right' },
    receiptSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 6 },
    receiptSummaryText: { flex: 1 },
    receiptSummaryValue: { flex: 1, textAlign: 'right' },
    receiptFooterBold: { fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', marginTop: 10 },
    receiptNote: { textAlign: 'center', marginTop: 8, lineHeight: 12 },

    btnRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    utilityBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 16, borderWidth: 1.5 },
    utilityBtnText: { marginLeft: 8, fontSize: 13, fontWeight: '800' },

    formSection: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginLeft: 8 },
    fieldLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 14, fontSize: 14, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
    
    logoPicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 14, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#CBD5E1', marginBottom: 16 },
    logoIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
    logoTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    logoSubtext: { fontSize: 11, color: '#94A3B8' },

    optionRow: { flexDirection: 'row', marginBottom: 16 },
    pillRow: { flexDirection: 'row', gap: 8 },
    pill: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
    pillActive: { backgroundColor: '#2563EB' },
    pillText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    pillTextActive: { color: '#FFFFFF' },
    colorDot: { width: 34, height: 34, borderRadius: 10 },

    saveBtn: { backgroundColor: '#0F172A', padding: 18, borderRadius: 20, alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});
