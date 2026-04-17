import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useShop, Product } from '@/context/ShopContext';
import { updateProductSupa } from '@/services/supabaseService';
import { BarangDB } from '@/database/db';
import { useTheme } from '@/context/ThemeContext';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';

interface Props {
    visible: boolean;
    onClose: () => void;
    editingProduct: Product | null;
    onOpenCategoryManager: () => void;
}

export default function EditProductModal({ visible, onClose, editingProduct, onOpenCategoryManager }: Props) {
    const { colors } = useTheme();
    const { categories, refreshData } = useShop();

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

    useEffect(() => {
        if (editingProduct && visible) {
            setForm({
                id: editingProduct.id,
                barcode: editingProduct.barcode || '',
                name: editingProduct.name,
                stock: editingProduct.stock.toString(),
                price: editingProduct.price.toString(),
                buyPrice: (editingProduct.buyPrice || 0).toString(),
                categoryId: editingProduct.categoryId,
                rack: editingProduct.rack || '',
                brand: editingProduct.brand || '',
                unit: editingProduct.unit || '',
            });
        }
    }, [editingProduct, visible]);

    const handleUpdateProduct = () => {
        if (!editingProduct) return;

        const cat = categories.find(c => c.id === form.categoryId);

        const updatedProduct: BarangDB = {
            kode_barang: editingProduct.id, 
            barcode: form.barcode,
            nama_barang: form.name,
            stok: parseInt(form.stock) || 0,
            harga_jual: parseInt(form.price) || 0,
            harga_beli: parseInt(form.buyPrice) || 0,
            id_kategori: form.categoryId,
            lokasi_rak: form.rack,
            merek: form.brand,
            satuan: form.unit,
        };

        updateProductSupa(updatedProduct).then(() => {
            refreshData();
            onClose();
            Alert.alert("Sukses", "Produk berhasil diperbarui!");
        });
    };

    const handleBarcodeScanned = (data: string) => {
        setScannerVisible(false);
        setForm(prev => ({ ...prev, barcode: data }));
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Produk</Text>
                        <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Kode Barang</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                            <Ionicons name="qr-code-outline" size={20} color={colors.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                value={form.id}
                                editable={false} // Cannot change ID
                            />
                        </View>

                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Barcode (Opsional)</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                            <Ionicons name="scan-outline" size={20} color={colors.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Scan / Ketik Barcode"
                                placeholderTextColor={colors.textSecondary}
                                value={form.barcode}
                                onChangeText={(text) => setForm({ ...form, barcode: text })}
                            />
                            <TouchableOpacity onPress={() => setScannerVisible(true)} activeOpacity={0.8}>
                                <Ionicons name="camera-outline" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nama Barang</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                            <Ionicons name="cube-outline" size={20} color={colors.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Contoh: Oli MPX1"
                                placeholderTextColor={colors.textSecondary}
                                value={form.name}
                                onChangeText={(text) => setForm({ ...form, name: text })}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Stok</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="0"
                                        placeholderTextColor={colors.textSecondary}
                                        value={form.stock}
                                        onChangeText={(text) => setForm({ ...form, stock: text })}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Satuan</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Pcs/Botol"
                                        placeholderTextColor={colors.textSecondary}
                                        value={form.unit}
                                        onChangeText={(text) => setForm({ ...form, unit: text })}
                                    />
                                </View>
                            </View>
                        </View>

                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Harga Dasar (Beli)</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                            <Text style={{ color: colors.text, fontWeight: 'bold' }}>Rp</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                value={form.buyPrice}
                                onChangeText={(text) => setForm({ ...form, buyPrice: text })}
                                keyboardType="numeric"
                            />
                        </View>

                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Harga Jual</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                            <Text style={{ color: colors.text, fontWeight: 'bold' }}>Rp</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                value={form.price}
                                onChangeText={(text) => setForm({ ...form, price: text })}
                                keyboardType="numeric"
                            />
                        </View>

                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Kategori</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.catChip,
                                        {
                                            backgroundColor: form.categoryId === cat.id ? colors.primary : colors.pill,
                                            borderColor: colors.cardBorder
                                        }
                                    ]}
                                    onPress={() => setForm({ ...form, categoryId: cat.id })}
                                    activeOpacity={0.8}
                                >
                                    <Text style={{ color: form.categoryId === cat.id ? 'white' : colors.text }}>{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity 
                                style={[styles.catChip, { borderColor: colors.primary, borderWidth: 1, borderStyle: 'dashed' }]} 
                                onPress={onOpenCategoryManager}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="add" size={16} color={colors.primary} />
                                <Text style={{ color: colors.primary }}>Baru</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Merek</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Yamaha"
                                        placeholderTextColor={colors.textSecondary}
                                        value={form.brand}
                                        onChangeText={(text) => setForm({ ...form, brand: text })}
                                    />
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Lokasi Rak</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="A-1"
                                        placeholderTextColor={colors.textSecondary}
                                        value={form.rack}
                                        onChangeText={(text) => setForm({ ...form, rack: text })}
                                    />
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButtonFull, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                            onPress={handleUpdateProduct}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </View>

                <BarcodeScannerModal 
                    isVisible={scannerVisible}
                    onClose={() => setScannerVisible(false)}
                    onScanned={handleBarcodeScanned}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderRadius: 24, padding: 24, paddingBottom: 0, height: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    
    inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, height: 50, marginBottom: 16, gap: 10 },
    input: { flex: 1, fontSize: 16, height: '100%' },
    catChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, marginRight: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
    
    saveButtonFull: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, marginTop: 10 },
    saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
