import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface Props {
    visible: boolean;
    editingItem: any;
    editQuantity: string;
    setEditQuantity: (val: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function EditCartItemModal({ visible, editingItem, editQuantity, setEditQuantity, onSave, onCancel }: Props) {
    const { colors } = useTheme();

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.editModalOverlay}>
                <View style={[styles.editModalContent, { backgroundColor: colors.card }]}>
                    <Text style={[styles.editModalTitle, { color: colors.text }]}>Edit Quantity</Text>
                    <Text style={[styles.editModalSubtitle, { color: colors.textSecondary }]}>
                        {editingItem?.name}
                    </Text>
                    <TextInput
                        style={[styles.quantityInput, { borderColor: colors.primary, color: colors.text }]}
                        value={editQuantity}
                        onChangeText={setEditQuantity}
                        keyboardType="number-pad"
                        placeholder="Jumlah"
                    />
                    <View style={styles.editModalButtons}>
                        <TouchableOpacity
                            style={[styles.editModalButton, { backgroundColor: colors.cardBorder }]}
                            onPress={onCancel}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.editModalButtonText, { color: colors.text }]}>Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.editModalButton, { backgroundColor: colors.primary }]}
                            onPress={onSave}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.editModalButtonText, { color: '#FFF' }]}>Simpan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    editModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editModalContent: {
        width: '85%',
        borderRadius: 20,
        padding: 24,
    },
    editModalTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    editModalSubtitle: {
        fontSize: 14,
        marginBottom: 20,
    },
    quantityInput: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 16,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20,
    },
    editModalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    editModalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    editModalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
