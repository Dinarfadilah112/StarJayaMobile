import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/context/UserContext';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function PersonalDataModal({ visible, onClose }: Props) {
    const { usersList, updateUserProfile } = useUser();
    const ownerAccount = usersList.find(u => u.role === 'Owner' || u.role.toLowerCase() === 'admin');

    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [newPin, setNewPin] = useState('');

    useEffect(() => {
        if (ownerAccount) {
            setUserName(ownerAccount.name);
            setUserPhone(ownerAccount.phone || '');
            setUserEmail(ownerAccount.email || '');
        }
    }, [ownerAccount, visible]);

    const handleSavePersonal = async () => {
        if (!ownerAccount) return;

        if (newPin && newPin.length !== 6) {
            Alert.alert("Data Tidak Valid", "Kode Akses harus berisi persis 6 angka.");
            return;
        }

        try {
            const updateData: any = {
                name: userName,
                phone: userPhone,
                email: userEmail
            };
            if (newPin) updateData.pin = newPin;

            updateUserProfile(ownerAccount.id, updateData);
            Alert.alert("Selesai!", "Data pribadi & keamanan berhasil diperbarui.");
            onClose();
            setNewPin('');
        } catch (e) {
            Alert.alert("Error", "Gagal memperbarui data pribadi.");
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Data Pribadi & Keamanan</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Nama Lengkap</Text>
                        <TextInput
                            style={styles.inputBox}
                            value={userName} onChangeText={setUserName} placeholder="Nama Anda"
                        />

                        <Text style={styles.label}>Nomor Handphone (WA)</Text>
                        <TextInput
                            style={styles.inputBox}
                            keyboardType="phone-pad"
                            value={userPhone} onChangeText={setUserPhone} placeholder="08xxxxxxxx"
                        />

                        <Text style={styles.label}>Alamat Email</Text>
                        <TextInput
                            style={styles.inputBox}
                            keyboardType="email-address"
                            value={userEmail} onChangeText={setUserEmail} placeholder="email@gmail.com"
                        />

                        <View style={{ marginTop: 20, padding: 16, backgroundColor: '#F1F5F9', borderRadius: 16 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 }}>UBAH KODE AKSES (PIN)</Text>
                            <Text style={{ fontSize: 11, color: '#64748B', marginBottom: 16 }}>Kosongkan jika tidak ingin mengubah PIN aplikasi.</Text>
                            <TextInput
                                style={[styles.inputBox, { backgroundColor: '#FFFFFF' }]}
                                placeholder="PIN 6-angka baru"
                                keyboardType="numeric"
                                maxLength={6}
                                secureTextEntry={true}
                                value={newPin} onChangeText={setNewPin}
                            />
                        </View>

                        <TouchableOpacity onPress={handleSavePersonal} style={styles.primaryBtn}>
                            <Text style={styles.primaryBtnText}>Perbarui Data & PIN</Text>
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
});
