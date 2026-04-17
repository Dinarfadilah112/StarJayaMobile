import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useShop } from '@/context/ShopContext';
import { deleteCategory } from '@/database/db';
import { addCategorySupa } from '@/services/supabaseService';
import { useTheme } from '@/context/ThemeContext';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function ManageCategoryModal({ visible, onClose }: Props) {
    const { colors } = useTheme();
    const { categories, refreshData } = useShop();
    const [newCatName, setNewCatName] = useState('');

    const handleAdd = () => {
        if (newCatName) {
            addCategorySupa(newCatName).then(() => refreshData());
            setNewCatName('');
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContentSmall, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Kelola Kategori</Text>
                        <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.addCatRow}>
                        <TextInput
                            style={[styles.inputCat, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.pill }]}
                            placeholder="Nama Kategori Baru"
                            placeholderTextColor={colors.textSecondary}
                            value={newCatName}
                            onChangeText={setNewCatName}
                        />
                        <TouchableOpacity
                            style={[styles.addCatAction, { backgroundColor: colors.success }]}
                            onPress={handleAdd}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="add" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={categories}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={[styles.catRowItem, { borderBottomColor: colors.cardBorder }]}>
                                <Text style={{ color: colors.text }}>{item.name}</Text>
                                <TouchableOpacity onPress={() => { deleteCategory(item.id); refreshData(); }} activeOpacity={0.8}>
                                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                                </TouchableOpacity>
                            </View>
                        )}
                        style={{ maxHeight: 200 }}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 25 },
    modalContentSmall: { borderRadius: 24, padding: 20, borderWidth: 1, elevation: 5 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    addCatRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    inputCat: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1 },
    addCatAction: { width: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    catRowItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
});
