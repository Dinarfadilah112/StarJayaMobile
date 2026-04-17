import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useShop, Product } from '@/context/ShopContext';
import { addProductSupa } from '@/services/supabaseService';
import { BarangDB } from '@/database/db';
import { useTheme } from '@/context/ThemeContext';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';

interface Props {
    visible: boolean;
    onClose: () => void;
    onOpenCategoryManager: () => void;
}

export default function AddProductModal({ visible, onClose, onOpenCategoryManager }: Props) {
    const { colors } = useTheme();
    const { categories, refreshData } = useShop();
    const isOwner = true;

    const [scannerVisible, setScannerVisible] = useState(false);

    const [form, setForm] = useState({
        id: '',
        barcode: '',
        name: '',
        stock: '',
        price: '',
        buyPrice: '',
        categoryId: 1,
        rack: '',
        brand: '',
        unit: '',
    });

    const resetForm = () => {
        setForm({
            id: '', barcode: '', name: '', stock: '', price: '', buyPrice: '',
            categoryId: 1, rack: '', brand: '', unit: '',
        });
    };

    const handleAddProduct = () => {
        if (!form.id || !form.name || !form.price) {
            Alert.alert("Data Belum Lengkap", "Kode Barang, Nama, dan Harga Jual wajib diisi.");
            return;
        }

        const cat = categories.find(c => c.id === form.categoryId);

        const newProduct: BarangDB = {
            kode_barang: form.id,
            barcode: form.barcode,
            nama_barang: form.name,
            stok: parseInt(form.stock) || 0,
            harga_jual: parseInt(form.price) || 0,
            harga_beli: parseInt(form.buyPrice) || 0,
            id_kategori: form.categoryId,
            lokasi_rak: form.rack,
            merek: form.brand,
            satuan: form.unit
        };

        addProductSupa(newProduct).then(() => {
            refreshData();
            onClose();
            resetForm();
            Alert.alert("Sukses", "Produk berhasil ditambahkan!");
        });
    };

    const handleBarcodeScanned = (data: string) => {
        setScannerVisible(false);
        setForm(prev => ({ ...prev, barcode: data, id: data }));
    };

    const SectionLabel = ({ title }: { title: string }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 15 }}>
            <View style={{ width: 4, height: 16, backgroundColor: colors.primary, borderRadius: 2, marginRight: 8 }} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase' }}>{title}</Text>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
                <View style={[styles.modalHeaderBar, { borderBottomColor: colors.cardBorder }]}>
                    <Text style={[styles.modalSheetTitle, { color: colors.text }]}>Tambah Barang</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close-circle" size={30} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                    <SectionLabel title="Identitas Produk" />

                    {/* Barcode Section */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Barcode / Kode Scan</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={[styles.inputContainer, { flex: 1, backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                                <Ionicons name="barcode-outline" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
                                <TextInput
                                    placeholder="Scan atau ketik..."
                                    placeholderTextColor={colors.textSecondary}
                                    style={[styles.inputFlex, { color: colors.text }]}
                                    value={form.barcode} onChangeText={t => setForm({ ...form, barcode: t })}
                                />
                            </View>
                            <TouchableOpacity
                                style={[styles.scanBtn, { backgroundColor: colors.primary }]}
                                onPress={() => setScannerVisible(true)}
                            >
                                <Ionicons name="qr-code" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Kode & Nama */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Kode Barang Manual</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                            <MaterialCommunityIcons name="identifier" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
                            <TextInput
                                placeholder="Cth: OLI-MPX-01" placeholderTextColor={colors.textSecondary}
                                style={[styles.inputFlex, { color: colors.text }]}
                                value={form.id} onChangeText={t => setForm({ ...form, id: t })}
                            />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Nama Produk</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                            <MaterialCommunityIcons name="tag-text-outline" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
                            <TextInput
                                placeholder="Nama lengkap produk..." placeholderTextColor={colors.textSecondary}
                                style={[styles.inputFlex, { color: colors.text }]}
                                value={form.name} onChangeText={t => setForm({ ...form, name: t })}
                            />
                        </View>
                    </View>

                    <SectionLabel title="Kategorisasi" />
                    {/* Category */}
                    <View style={{ marginBottom: 15 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>Kategori</Text>
                            {isOwner && (
                                <TouchableOpacity onPress={onOpenCategoryManager}>
                                    <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>+ Kelola Kategori</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -5 }}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.catPill, {
                                        backgroundColor: form.categoryId === cat.id ? colors.primary : colors.pill,
                                        borderColor: form.categoryId === cat.id ? colors.primary : colors.cardBorder,
                                        borderWidth: 1
                                    }]}
                                    onPress={() => setForm({ ...form, categoryId: cat.id })}
                                >
                                    <Text style={{ color: form.categoryId === cat.id ? '#fff' : colors.textSecondary, fontWeight: '500' }}>{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.rowTwo}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: colors.text }]}>Merek</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                                <TextInput
                                    placeholder="Honda/Yamaha" placeholderTextColor={colors.textSecondary}
                                    style={[styles.inputFlex, { color: colors.text }]}
                                    value={form.brand} onChangeText={t => setForm({ ...form, brand: t })}
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: colors.text }]}>Lokasi Rak</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                                <TextInput
                                    placeholder="R-01" placeholderTextColor={colors.textSecondary}
                                    style={[styles.inputFlex, { color: colors.text }]}
                                    value={form.rack} onChangeText={t => setForm({ ...form, rack: t })}
                                />
                            </View>
                        </View>
                    </View>

                    <SectionLabel title="Stok & Harga" />
                    <View style={styles.rowTwo}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: colors.text }]}>Stok Awal</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                                <TextInput
                                    placeholder="0" placeholderTextColor={colors.textSecondary} keyboardType="numeric"
                                    style={[styles.inputFlex, { color: colors.text, fontWeight: 'bold' }]}
                                    value={form.stock} onChangeText={t => setForm({ ...form, stock: t })}
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: colors.text }]}>Satuan</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                                <TextInput
                                    placeholder="Pcs/Set" placeholderTextColor={colors.textSecondary}
                                    style={[styles.inputFlex, { color: colors.text }]}
                                    value={form.unit} onChangeText={t => setForm({ ...form, unit: t })}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.rowTwo}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: colors.text }]}>Harga Beli (Modal)</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                                <Text style={{ color: colors.textSecondary, marginRight: 4 }}>Rp</Text>
                                <TextInput
                                    placeholder="0" placeholderTextColor={colors.textSecondary} keyboardType="numeric"
                                    style={[styles.inputFlex, { color: colors.text }]}
                                    value={form.buyPrice} onChangeText={t => setForm({ ...form, buyPrice: t })}
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: colors.primary }]}>Harga Jual</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.primary, borderWidth: 1 }]}>
                                <Text style={{ color: colors.primary, marginRight: 4, fontWeight: 'bold' }}>Rp</Text>
                                <TextInput
                                    placeholder="0" placeholderTextColor={colors.primary + '80'} keyboardType="numeric"
                                    style={[styles.inputFlex, { color: colors.primary, fontWeight: 'bold' }]}
                                    value={form.price} onChangeText={t => setForm({ ...form, price: t })}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 20 }} />

                    <TouchableOpacity
                        style={[styles.saveButtonFull, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                        onPress={handleAddProduct}
                    >
                        <Text style={styles.saveButtonText}>Simpan Barang</Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>

            <BarcodeScannerModal 
                isVisible={scannerVisible}
                onClose={() => setScannerVisible(false)}
                onScanned={handleBarcodeScanned}
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalSheet: { flex: 1, marginTop: Platform.OS === 'ios' ? 40 : 0 },
    modalHeaderBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1 },
    modalSheetTitle: { fontSize: 18, fontWeight: '700' },
    closeBtn: { padding: 4 },
    inputGroup: { marginBottom: 14 },
    label: { fontSize: 12, marginBottom: 6, fontWeight: '500' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 48 },
    inputFlex: { flex: 1, fontSize: 15, height: '100%' },
    scanBtn: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    rowTwo: { flexDirection: 'row', gap: 12, marginBottom: 14 },
    catPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginVertical: 4 },
    saveButtonFull: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
