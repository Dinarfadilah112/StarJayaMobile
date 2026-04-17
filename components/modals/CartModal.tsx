import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useShop } from '@/context/ShopContext';
import { useTheme } from '@/context/ThemeContext';
import { MechanicDB } from '@/database/db';
import { Image } from 'expo-image';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import EditCartItemModal from './EditCartItemModal';

const PAYMENT_METHODS = [
    { id: 'Tunai', label: 'Tunai', icon: 'cash-outline' },
    { id: 'Debit', label: 'Debit', icon: 'card-outline' },
    { id: 'QRIS', label: 'QRIS', icon: 'qr-code-outline' },
    { id: 'DANA', label: 'DANA', icon: 'wallet-outline' },
    { id: 'OVO', label: 'OVO', icon: 'wallet-outline' },
    { id: 'GoPay', label: 'GoPay', icon: 'wallet-outline' },
];

interface Props {
    visible: boolean;
    onClose: () => void;
    mechanicsList: MechanicDB[];
    onCheckoutSuccess: (transactionId: string) => void;
}

export default function CartModal({ visible, onClose, mechanicsList, onCheckoutSuccess }: Props) {
    const {
        cart, removeFromCart, updateCartQuantity, checkout,
        paymentMethod, serviceFee, setPaymentMethod, setServiceFee,
        mechanicId, setMechanicId, setMechanicName, notes, setNotes
    } = useShop();
    
    const { colors } = useTheme();

    const [serviceFeeInput, setServiceFeeInput] = useState<string>('0');
    
    // Edit Modal internal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [editQuantity, setEditQuantity] = useState<string>('1');

    useEffect(() => {
        setServiceFeeInput(serviceFee.toString());
    }, [serviceFee]);

    const handleServiceFeeChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        setServiceFeeInput(cleaned);
        setServiceFee(parseInt(cleaned) || 0);
    };

    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const grandTotal = subtotal + serviceFee;

    const handleCheckout = async () => {
        if (cart.length === 0) {
            Alert.alert('Keranjang Kosong', 'Mohon tambahkan produk terlebih dahulu');
            return;
        }

        if (!paymentMethod) {
            Alert.alert('Pilih Metode Bayar', 'Silakan pilih metode pembayaran');
            return;
        }

        try {
            const transactionId = 'TRX-' + Date.now();
            await checkout();
            onCheckoutSuccess(transactionId);
        } catch (error) {
            Alert.alert('Error', 'Gagal melakukan checkout');
        }
    };

    const handleEditQuantitySave = () => {
        if (!editingItem) return;

        const qty = parseInt(editQuantity) || 1;
        if (qty < 1) {
            Alert.alert('Error', 'Quantity minimal 1');
            return;
        }

        updateCartQuantity(editingItem.id, qty);
        setShowEditModal(false);
        setEditingItem(null);
    };

    const renderSwipeActions = (progress: any, dragX: any, item: any) => {
        return (
            <View style={{ width: 150, flexDirection: 'row', paddingLeft: 8, height: '100%', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', gap: 8, height: '100%', flex: 1 }}>
                    <TouchableOpacity
                        style={[styles.swipeActionColumn, { backgroundColor: colors.primary }]}
                        onPress={() => {
                            setEditingItem(item);
                            setEditQuantity(item.quantity.toString());
                            setShowEditModal(true);
                        }}
                        activeOpacity={0.8}
                    >
                        <View style={{ height: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
                            <Ionicons name="create-outline" size={24} color="#FFF" />
                        </View>
                        <Text style={styles.swipeActionText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.swipeActionColumn, { backgroundColor: colors.danger }]}
                        onPress={() => removeFromCart(item.id)}
                        activeOpacity={0.8}
                    >
                        <View style={{ height: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
                            <Ionicons name="trash-outline" size={24} color="#FFF" />
                        </View>
                        <Text style={styles.swipeActionText}>Hapus</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Keranjang Belanja</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {cart.length === 0 ? (
                                <Text style={{ textAlign: 'center', margin: 20, color: colors.textSecondary }}>Keranjang Kosong</Text>
                            ) : (
                                cart.map((item) => (
                                    <View key={item.id} style={{ marginBottom: 12 }}>
                                        <Swipeable
                                            renderRightActions={(progress, dragX) => renderSwipeActions(progress, dragX, item)}
                                            overshootRight={false}
                                            containerStyle={{ backgroundColor: 'transparent' }}
                                        >
                                            <View style={[styles.cartItemCard, { backgroundColor: colors.pill, borderRadius: 16 }]}>
                                                {item.image ? (
                                                    <Image source={{ uri: item.image }} style={styles.productImagePlaceholder} />
                                                ) : (
                                                    <View style={[styles.productImagePlaceholder, { backgroundColor: colors.primary + '20' }]}>
                                                        <Ionicons name="cube-outline" size={32} color={colors.primary} />
                                                    </View>
                                                )}

                                                <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 4 }}>
                                                    <View>
                                                        <Text style={[styles.cartItemName, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                                                        <Text style={[styles.cartItemCategory, { color: colors.textSecondary }]}>
                                                            {item.category || 'Umum'} · Rp {item.price.toLocaleString()}
                                                        </Text>
                                                    </View>

                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
                                                        <View style={[styles.quantityBox, { backgroundColor: colors.background }]}>
                                                            <Text style={[styles.quantityLabel, { color: colors.textSecondary }]}>Qty</Text>
                                                            <Text style={[styles.quantityValue, { color: colors.text }]}>{item.quantity}</Text>
                                                        </View>
                                                        <Text style={[styles.cartItemPrice, { color: colors.primary }]}>
                                                            Rp {(item.price * item.quantity).toLocaleString()}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </Swipeable>
                                    </View>
                                ))
                            )}

                            {/* Payment Method Selector */}
                            <View style={{ marginTop: 16, marginBottom: 12 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 10 }}>Metode Pembayaran</Text>
                                <View style={styles.paymentGrid}>
                                    {PAYMENT_METHODS.map((method) => (
                                        <TouchableOpacity
                                            key={method.id}
                                            style={[
                                                styles.paymentButton,
                                                {
                                                    backgroundColor: paymentMethod === method.id ? colors.primary : colors.pill,
                                                    borderColor: colors.cardBorder
                                                }
                                            ]}
                                            onPress={() => setPaymentMethod(method.id)}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons
                                                name={method.icon as any}
                                                size={20}
                                                color={paymentMethod === method.id ? '#FFF' : colors.text}
                                            />
                                            <Text style={[
                                                styles.paymentText,
                                                { color: paymentMethod === method.id ? '#FFF' : colors.text }
                                            ]}>{method.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Mechanic Selector */}
                            <View style={{ marginTop: 8, marginBottom: 16 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 10 }}>Pilih Mekanik ({mechanicsList.length})</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <TouchableOpacity
                                        style={[
                                            styles.mechanicChip,
                                            {
                                                backgroundColor: !mechanicId ? colors.primary : colors.pill,
                                                borderColor: colors.cardBorder
                                            }
                                        ]}
                                        onPress={() => {
                                            setMechanicId(null);
                                            setMechanicName('');
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="people-outline" size={16} color={!mechanicId ? '#FFF' : colors.text} style={{ marginRight: 6 }} />
                                        <Text style={{ color: !mechanicId ? '#FFF' : colors.text, fontWeight: '500' }}>Tanpa Mekanik</Text>
                                    </TouchableOpacity>

                                    {mechanicsList && Array.isArray(mechanicsList) && mechanicsList.map((m) => {
                                        return (
                                            <TouchableOpacity
                                                key={m.id}
                                                style={[
                                                    styles.mechanicChip,
                                                    {
                                                        backgroundColor: mechanicId === m.id ? colors.primary : colors.pill,
                                                        borderColor: colors.cardBorder
                                                    }
                                                ]}
                                                onPress={() => {
                                                    setMechanicId(m.id);
                                                    setMechanicName(m.name);
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                <Image
                                                    source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}` }}
                                                    style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8, backgroundColor: '#E2E8F0' }}
                                                />
                                                <View>
                                                    <Text style={{
                                                        color: mechanicId === m.id ? '#FFF' : colors.text,
                                                        fontWeight: '600',
                                                        fontSize: 13
                                                    }}>
                                                        {m.name}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>

                            {/* Notes Input */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Catatan / Detail Servis</Text>
                                <TextInput
                                    style={[styles.inputTextArea, { backgroundColor: colors.pill, borderColor: colors.cardBorder, color: colors.text }]}
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholder="Contoh: Ganti oli + servis cvt..."
                                    placeholderTextColor={colors.textSecondary}
                                    multiline
                                    numberOfLines={2}
                                />
                            </View>

                            {/* Service Fee Input */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Biaya Jasa (Opsional)</Text>
                                <View style={[styles.serviceFeeInput, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}>
                                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginRight: 8 }}>Rp</Text>
                                    <TextInput
                                        style={{ flex: 1, fontSize: 16, color: colors.text, padding: 0 }}
                                        value={serviceFeeInput}
                                        onChangeText={handleServiceFeeChange}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        {/* Total Breakdown */}
                        <View style={[styles.modalFooter, { borderTopColor: colors.cardBorder }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text style={{ fontSize: 14, color: colors.textSecondary }}>Subtotal Produk</Text>
                                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>Rp {subtotal.toLocaleString()}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                                <Text style={{ fontSize: 14, color: colors.textSecondary }}>Biaya Jasa</Text>
                                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>Rp {serviceFee.toLocaleString()}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.cardBorder }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>Total</Text>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary }}>Rp {grandTotal.toLocaleString()}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.checkoutBtn, { backgroundColor: colors.primary }, cart.length === 0 && { opacity: 0.5 }]}
                                onPress={handleCheckout}
                                disabled={cart.length === 0}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="card-outline" size={20} color="white" style={{ marginRight: 8 }} />
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Bayar Sekarang</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Internal Edit Modal */}
                <EditCartItemModal
                    visible={showEditModal}
                    editingItem={editingItem}
                    editQuantity={editQuantity}
                    setEditQuantity={setEditQuantity}
                    onSave={handleEditQuantitySave}
                    onCancel={() => {
                        setShowEditModal(false);
                        setEditingItem(null);
                    }}
                />
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%', width: '100%', paddingBottom: 30 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, paddingBottom: 12 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },

    // Cart Item Card (new design)
    cartItemCard: { flexDirection: 'row', padding: 14, borderRadius: 16, gap: 12 },
    productImagePlaceholder: { width: 80, height: 80, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    cartItemName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    cartItemCategory: { fontSize: 12, marginBottom: 2 },
    cartItemPrice: { fontSize: 18, fontWeight: '800' },

    // Quantity Box Styles
    quantityBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6 },
    quantityLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
    quantityValue: { fontSize: 14, fontWeight: '700' },

    // Payment UI
    paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    paymentButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 6, minWidth: '30%' },
    paymentText: { fontSize: 12, fontWeight: '600' },

    serviceFeeInput: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
    modalFooter: { marginTop: 16, borderTopWidth: 1, paddingTop: 16 },
    checkoutBtn: { padding: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },

    swipeActionColumn: { flex: 1, borderRadius: 16, justifyContent: 'center', alignItems: 'center', paddingVertical: 12 },
    swipeActionText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

    mechanicChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 8, borderWidth: 1 },
    inputTextArea: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, fontSize: 14, textAlignVertical: 'top', height: 60 }
});
