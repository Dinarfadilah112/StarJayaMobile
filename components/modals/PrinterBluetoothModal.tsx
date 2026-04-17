import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, FlatList, Alert, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useShop, Transaction } from '@/context/ShopContext';
import { getTransactionDetails } from '@/database/db';
import * as Print from 'expo-print';
import * as IntentLauncher from 'expo-intent-launcher';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function PrinterBluetoothModal({ visible, onClose }: Props) {
    const { transactions, shopInfo } = useShop();
    const [paperSize, setPaperSize] = useState<'58mm' | '80mm'>('58mm');
    const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
    const [receiptItems, setReceiptItems] = useState<any[]>([]);

    // Get only the 10 most recent transactions for history
    const historyTransactions = transactions.slice(0, 10);

    const formatRupiah = (num: number) => 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    const handleOpenBluetoothSettings = async () => {
        if (Platform.OS === 'android') {
            try {
                await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.BLUETOOTH_SETTINGS);
            } catch (error) {
                Alert.alert("Gagal", "Tidak dapat membuka pengaturan Bluetooth secara otomatis. Buka manual di Setting HP Anda.");
            }
        } else {
            Linking.openURL('App-Prefs:root=Bluetooth');
        }
    };
    
    const generateReceiptHtml = (trx: Transaction, items: any[]) => {
        const d = new Date();
        const printDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
        const totalItems = items.reduce((sum, item) => sum + item.jumlah, 0);

        // Responsive width based on selected paper size (58mm ~ 48mm print width, 80mm ~ 72mm)
        // 58mm -> ~ 180px, 80mm -> ~ 260px width
        const printWidth = paperSize === '58mm' ? '180px' : '260px';
        const fontSizePx = paperSize === '58mm' ? '12px' : '14px';
        const titleSizePx = paperSize === '58mm' ? '16px' : '20px';

        const mapItems = items.map(item => `
            <tr>
                <td style="text-align: left; padding: 2px 0; font-size: ${fontSizePx}; fonr-family: monospace;">${item.nama_barang}</td>
                <td style="text-align: center; font-size: ${fontSizePx}; font-family: monospace;">${item.jumlah}</td>
                <td style="text-align: right; font-size: ${fontSizePx}; font-family: monospace;">Rp ${(item.subtotal || 0).toLocaleString()}</td>
            </tr>
        `).join('');

        return `
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                </head>
                <body style="font-family: monospace; text-align: center; color: black; margin: 0; padding: 10px; width: ${printWidth}; box-sizing: border-box;">
                    <h2 style="margin: 0; font-size: ${titleSizePx}; font-weight: bold; text-transform: uppercase">${shopInfo?.name || 'STAR JAYA BENGKEL'}</h2>
                    <div style="border-bottom: 2px solid black; margin: 4px 0;"></div>
                    <div style="font-size: ${fontSizePx}; font-family: monospace;">${shopInfo?.address || 'Alamat Belum Diatur'}</div>
                    <div style="font-size: ${fontSizePx}; font-family: monospace;">${shopInfo?.phone || '-'}</div>
                    <div style="border-bottom: 1px dashed black; margin: 4px 0;"></div>
                    
                    <div style="text-align: left; font-size: ${fontSizePx}; font-family: monospace;">No: ${trx.id}</div>
                    <div style="border-bottom: 1px dashed black; margin: 4px 0;"></div>
                    
                    <table style="width: 100%; border-collapse: collapse; font-family: monospace;">
                        ${mapItems}
                    </table>
                    
                    <div style="border-bottom: 1px dotted black; margin: 6px 0;"></div>
                    
                    <div style="display: flex; justify-content: space-between; font-size: ${fontSizePx}; font-family: monospace;">
                        <span>Total Item</span>
                        <span>${totalItems}</span>
                    </div>
                    
                    <div style="border-bottom: 1px dashed black; margin: 4px 0;"></div>
                    
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: ${fontSizePx}; font-family: monospace;">
                        <span>TOTAL TAGIHAN</span>
                        <span>${formatRupiah(trx.total)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: ${fontSizePx}; font-family: monospace;">
                        <span>Metode</span>
                        <span>${trx.paymentMethod || 'Tunai'}</span>
                    </div>
                    
                    <div style="border-bottom: 1px dashed black; margin: 4px 0;"></div>
                    <div style="font-size: ${fontSizePx}; margin: 4px 0; font-family: monospace;">Tgl. Cetak: ${printDate}</div>
                    <div style="border-bottom: 1px dashed black; margin: 4px 0;"></div>
                    
                    <div style="font-weight: bold; font-size: ${fontSizePx}; font-family: monospace;">TERIMA KASIH</div>
                    <div style="font-size: ${fontSizePx}; font-family: monospace; margin-top: 4px;">NOTE: ${shopInfo?.footer_note || 'Barang tidak dapat ditukar'}</div>
                </body>
            </html>
        `;
    };

    const handlePrintClick = async (trx: Transaction) => {
        try {
            // Because the print gets triggered directly or from the history list, we must query items if empty
            let itemsToPrint = receiptItems;
            if (itemsToPrint.length === 0 || selectedTrx?.id !== trx.id) {
                const details = await getTransactionDetails(trx.id) as any;
                itemsToPrint = details;
            }
            const htmlString = generateReceiptHtml(trx, itemsToPrint);
            
            await Print.printAsync({
                html: htmlString,
                orientation: Print.Orientation.portrait
            });
            // If Android, it will open the default system print spooler!
            // Thus, apps like RawBT or Bluetooth Print services can intercept this PDF & send to thermal printer directly.
        } catch (error) {
            Alert.alert("Gagal Mencetak", "Terjadi kesalahan saat mencoba mencetak struk.");
            console.error(error);
        }
    };

    const handlePreviewReceipt = async (trx: Transaction) => {
        const details = await getTransactionDetails(trx.id) as any;
        setReceiptItems(details);
        setSelectedTrx(trx);
    };

    const dmyDate = (iso: string) => {
        const d = new Date(iso);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const renderHistoryItem = ({ item }: { item: Transaction }) => (
        <TouchableOpacity 
            style={styles.historyCard}
            onPress={() => handlePreviewReceipt(item)}
            activeOpacity={0.7}
        >
            <View style={{ flex: 1 }}>
                <Text style={styles.trxId}>{item.id}</Text>
                <Text style={styles.trxDate}>{dmyDate(item.date)}</Text>
                <Text style={styles.trxTotal}>{formatRupiah(item.total)}</Text>
            </View>
            <View style={styles.printBtn}>
                <Ionicons name="eye" size={16} color="#FFFFFF" />
                <Text style={styles.printBtnText}>Lihat</Text>
            </View>
        </TouchableOpacity>
    );

    const renderReceiptPreviewOverlay = () => {
        if (!selectedTrx) return null;
        const totalItems = receiptItems.reduce((sum, item) => sum + item.jumlah, 0);

        return (
            <Modal visible={!!selectedTrx} transparent animationType="fade">
                <View style={styles.modalOverlayCentered}>
                    <View style={styles.previewCard}>
                        {/* Header */}
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                            <Text style={styles.modalTitle}>Preview Struk</Text>
                            <TouchableOpacity onPress={() => setSelectedTrx(null)}>
                                <Ionicons name="close-circle" size={28} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                        
                        {/* The Receipt Paper */}
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{alignItems: 'center', paddingBottom: 20}}>
                            <View style={[styles.receiptPaper, { width: paperSize === '58mm' ? 240 : 320 }]}>
                                <Text style={styles.receiptStoreName}>{shopInfo?.name || 'STAR JAYA BENGKEL'}</Text>
                                <View style={styles.receiptHeaderLine} />
                                
                                <Text style={styles.receiptAddress}>{shopInfo?.address || 'Alamat Belum Diatur'}</Text>
                                <Text style={styles.receiptPhone}>{shopInfo?.phone || '-'}</Text>
                                
                                <View style={styles.receiptDashedLine} />
                                <Text style={styles.receiptTrxNo}>{selectedTrx.id}</Text>
                                <View style={styles.receiptDashedLine} />
                                
                                {receiptItems.map((item, idx) => (
                                    <View key={idx} style={styles.receiptItemRow}>
                                        <Text style={styles.receiptItemName}>{item.nama_barang}</Text>
                                        <Text style={styles.receiptItemQty}>{item.jumlah}</Text>
                                        <Text style={styles.receiptItemPrice}>Rp {(item.subtotal || 0).toLocaleString()}</Text>
                                    </View>
                                ))}
                                
                                <View style={styles.receiptDottedLine} />
                                
                                <View style={styles.receiptSummaryRow}>
                                    <Text style={styles.receiptSummaryText}>Total Item</Text>
                                    <Text style={styles.receiptSummaryValue}>{totalItems}</Text>
                                </View>
                                
                                <View style={styles.receiptDashedLine} />
                                <View style={styles.receiptSummaryRow}>
                                    <Text style={[styles.receiptSummaryText, {fontWeight: '900', fontSize: 12}]}>TOTAL TAGIHAN</Text>
                                    <Text style={[styles.receiptSummaryValue, {fontWeight: '900', fontSize: 12}]}>{formatRupiah(selectedTrx.total)}</Text>
                                </View>
                                
                                <View style={styles.receiptSummaryRow}>
                                    <Text style={styles.receiptSummaryText}>Metode</Text>
                                    <Text style={styles.receiptSummaryValue}>{selectedTrx.paymentMethod || 'Tunai'}</Text>
                                </View>
                                
                                <View style={styles.receiptDashedLine} />
                                <Text style={[styles.receiptCenterText, {marginVertical: 4}]}>Tgl. Cetak: {new Date().toLocaleString('id-ID')}</Text>
                                <View style={styles.receiptDashedLine} />
                                
                                <Text style={styles.receiptFooterBold}>TERIMA KASIH</Text>
                                
                                <View style={{marginTop: 15}}>
                                    <Text style={styles.receiptNote}>
                                        <Text style={{fontWeight: '900'}}>NOTE : </Text>
                                        {shopInfo?.footer_note || 'Barang yang sudah dibeli tidak dapat ditukar'}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>

                        <TouchableOpacity 
                            style={[styles.primaryBtn, { marginTop: 16 }]}
                            onPress={() => {
                                handlePrintClick(selectedTrx);
                                setSelectedTrx(null);
                            }}
                        >
                            <Ionicons name="print" size={20} color="#FFFFFF" style={{marginRight: 8}}/>
                            <Text style={styles.primaryBtnText}>Cetak Sekarang</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Pengaturan Printer</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>

                    {/* Paper Size Selector */}
                    <Text style={styles.sectionLabel}>Ukuran Kertas Printer</Text>
                    <View style={styles.segmentContainer}>
                        <TouchableOpacity 
                            style={[styles.segmentBtn, paperSize === '58mm' && styles.segmentBtnActive]}
                            onPress={() => setPaperSize('58mm')}
                        >
                            <Text style={[styles.segmentText, paperSize === '58mm' && styles.segmentTextActive]}>Kertas 58mm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.segmentBtn, paperSize === '80mm' && styles.segmentBtnActive]}
                            onPress={() => setPaperSize('80mm')}
                        >
                            <Text style={[styles.segmentText, paperSize === '80mm' && styles.segmentTextActive]}>Kertas 80mm</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Printer Connection Status (Dummy) */}
                    <View style={styles.connBox}>
                        <Ionicons name="bluetooth" size={24} color="#3B82F6" />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={styles.connTitle}>Sinkronisasi Bluetooth</Text>
                            <Text style={styles.connStatus}>Melalui Sistem HP Anda</Text>
                        </View>
                        <TouchableOpacity style={styles.scanBtn} onPress={handleOpenBluetoothSettings}>
                            <Text style={styles.scanBtnText}>Pasangkan</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Print History List */}
                    <Text style={[styles.sectionLabel, { marginTop: 24, marginBottom: 8 }]}>Histori Cetak Terakhir</Text>
                    {historyTransactions.length > 0 ? (
                        <FlatList 
                            data={historyTransactions}
                            keyExtractor={(item) => item.id}
                            renderItem={renderHistoryItem}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
                            <Text style={styles.emptyText}>Belum ada riwayat transaksi</Text>
                        </View>
                    )}
                </View>
            </View>
            
            {/* The Receipts nested preview */}
            {renderReceiptPreviewOverlay()}
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
    modalOverlayCentered: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, height: '85%', paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
    
    previewCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, maxHeight: '85%' },
    
    sectionLabel: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 12 },
    
    segmentContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 20 },
    segmentBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
    segmentBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    segmentText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    segmentTextActive: { color: '#0F172A', fontWeight: '800' },
    
    connBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#BFDBFE' },
    connTitle: { fontSize: 12, fontWeight: '600', color: '#3B82F6' },
    connStatus: { fontSize: 14, fontWeight: '800', color: '#1E3A8A' },
    scanBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    scanBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },

    historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    trxId: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
    trxDate: { fontSize: 12, color: '#64748B', marginBottom: 6 },
    trxTotal: { fontSize: 14, fontWeight: '700', color: '#10B981' },
    
    printBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    printBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12, marginLeft: 6 },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    emptyText: { marginTop: 12, fontSize: 14, color: '#94A3B8', fontWeight: '500' },
    
    primaryBtn: { flexDirection: 'row', backgroundColor: '#2563EB', padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

    // Receipt Paper Styling
    receiptPaper: { backgroundColor: '#FFFFFF', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, borderWidth: 1, borderColor: '#E2E8F0' },
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
    receiptNote: { fontSize: 9, color: '#000', textAlign: 'center', lineHeight: 12, fontWeight: '500' }
});
