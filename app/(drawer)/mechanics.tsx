import { useTheme } from '@/context/ThemeContext';
import { getMechanics, MechanicDB } from '@/database/db';
import { addMechanicSupa, deleteMechanicSupa, getMechanicsSupa, updateMechanicSupa } from '@/services/supabaseService';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSync } from '@/context/SyncContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MechanicsScreen() {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const { isOffline, syncAll } = useSync();

    // Local State for Mechanics
    const [mechanicsList, setMechanicsList] = useState<MechanicDB[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [targetId, setTargetId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [status, setStatus] = useState('Aktif');

    useEffect(() => {
        fetchMechanics();
    }, []);

    const fetchMechanics = async () => {
        try {
            setIsLoading(true);
            const data = await getMechanicsSupa();
            setMechanicsList(data);
        } catch (e: any) {
            console.error("Fetch mechanics error:", e);

            // Check for missing table error (PGRST205) or any other network error
            if (e.code === 'PGRST205' || e.message?.includes('mechanics')) {
                // Fallback to local DB silently or with log
                console.log("Falling back to local mechanics DB");
                const localData = await getMechanics();
                setMechanicsList(localData);
            } else {
                Alert.alert("Error", "Gagal memuat data mekanik");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setAvatar('');
        setEmail('');
        setPhone('');
        setAddress('');
        setStatus('Aktif');
        setTargetId(null);
        setIsEditing(false);
    };

    const openAddModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (m: MechanicDB) => {
        setTargetId(m.id);
        setName(m.name);
        setAvatar(m.avatar || '');
        setEmail(m.email || '');
        setPhone(m.phone || '');
        setAddress(m.address || '');
        setStatus(m.status || 'Aktif');
        setIsEditing(true);
        setModalVisible(true);
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setAvatar(base64Img);
        }
    };

    const handleSave = async () => {
        if (!name) {
            Alert.alert("Data Tidak Valid", "Nama wajib diisi.");
            return;
        }

        try {
            if (isEditing && targetId) {
                await updateMechanicSupa(targetId, {
                    name,
                    avatar: avatar || undefined,
                    email,
                    phone,
                    address,
                    status
                });
                Alert.alert("Sukses", isOffline ? "Pembaruan disimpan secara lokal (Offline)." : "Data mekanik berhasil diperbarui.");
            } else {
                await addMechanicSupa({
                    name,
                    avatar: avatar || undefined,
                    email,
                    phone,
                    address,
                    status
                });
                Alert.alert("Sukses", isOffline ? "Mekanik disimpan secara lokal (Offline)." : "Mekanik baru berhasil ditambahkan.");
            }
            setModalVisible(false);
            fetchMechanics();
            if (!isOffline) syncAll();
        } catch (e) {
            console.error(e);
            Alert.alert("Info", "Data disimpan di HP. Sinkronisasi akan berlanjut saat internet aktif.");
            setModalVisible(false);
            fetchMechanics();
        }
    };

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            "Hapus Mekanik",
            `Yakin ingin menghapus ${name}?`,
            [
                { text: "Batal", style: 'cancel' },
                {
                    text: "Hapus",
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteMechanicSupa(id);
                            fetchMechanics();
                        } catch (e) {
                            Alert.alert("Gagal", "Gagal menghapus data.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.blob1, { backgroundColor: colors.blob1 }]} />
            <View style={[styles.blob2, { backgroundColor: colors.blob2 }]} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.glassButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}
                    onPress={() => navigation.navigate('(tabs)' as never)}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: colors.text }]}>Pengaturan Mekanik</Text>

                <TouchableOpacity
                    style={[styles.glassButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}
                    onPress={openAddModal}
                >
                    <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {isOffline && (
                <View style={[styles.offlineBanner, { backgroundColor: colors.warning + '20' }]}>
                    <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} />
                    <Text style={[styles.offlineText, { color: colors.warning }]}>Mode Offline - Data disimpan di HP</Text>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {mechanicsList.length === 0 && !isLoading ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Belum ada data mekanik</Text>
                        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={openAddModal}>
                            <Text style={styles.addBtnText}>Tambah Mekanik</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    mechanicsList.map((m) => (
                        <View key={m.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <Image source={{ uri: m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random` }} style={styles.avatar} />

                            <View style={styles.info}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Text style={[styles.name, { color: colors.text }]}>{m.name}</Text>
                                    <View style={[styles.statusBadge, {
                                        backgroundColor: m.status === 'Aktif' ? colors.success + '20' :
                                            m.status === 'Sakit' ? colors.danger + '20' :
                                                colors.warning + '20'
                                    }]}>
                                        <Text style={[styles.statusBadgeText, {
                                            color: m.status === 'Aktif' ? colors.success :
                                                m.status === 'Sakit' ? colors.danger :
                                                    colors.warning
                                        }]}>{m.status || 'Aktif'}</Text>
                                    </View>
                                </View>
                                <Text style={[styles.role, { color: colors.textSecondary }]}>{m.phone || '-'}</Text>
                            </View>

                            <View style={[styles.syncStatus, { opacity: m.is_synced ? 0.3 : 1 }]}>
                                <Ionicons 
                                    name={m.is_synced ? "cloud-done-outline" : "cloud-upload-outline"} 
                                    size={16} 
                                    color={m.is_synced ? colors.success : colors.warning} 
                                />
                            </View>

                            <View style={styles.actions}>
                                <TouchableOpacity onPress={() => openEditModal(m)} style={[styles.actionBtn, { backgroundColor: colors.primary + '20' }]}>
                                    <Ionicons name="pencil" size={18} color={colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(m.id, m.name)} style={[styles.actionBtn, { backgroundColor: colors.danger + '20' }]}>
                                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* MODAL FORM */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.cardBorder, borderWidth: 1 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {isEditing ? 'Edit Mekanik' : 'Tambah Mekanik'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                <TouchableOpacity onPress={handlePickImage} style={styles.avatarPicker}>
                                    <Image
                                        source={{ uri: avatar || 'https://via.placeholder.com/150' }}
                                        style={styles.avatarPreview}
                                    />
                                    <View style={styles.cameraBadge}>
                                        <Ionicons name="camera" size={14} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.label, { color: colors.textSecondary }]}>Nama Mekanik</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card + '50' }]}
                                placeholder="Nama Lengkap"
                                placeholderTextColor={colors.textSecondary}
                                value={name} onChangeText={setName}
                            />

                            <Text style={[styles.label, { color: colors.textSecondary }]}>Nomor Telepon</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card + '50' }]}
                                placeholder="08..."
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="phone-pad"
                                value={phone} onChangeText={setPhone}
                            />

                            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card + '50' }]}
                                placeholder="email@example.com"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email} onChangeText={setEmail}
                            />

                            <Text style={[styles.label, { color: colors.textSecondary }]}>Alamat Rumah</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card + '50', height: 80, textAlignVertical: 'top' }]}
                                placeholder="Jl. Contoh No. 123"
                                placeholderTextColor={colors.textSecondary}
                                multiline
                                numberOfLines={3}
                                value={address} onChangeText={setAddress}
                            />

                            <Text style={[styles.label, { color: colors.textSecondary }]}>Status Kehadiran</Text>
                            <View style={styles.statusRow}>
                                {['Aktif', 'Sakit', 'Izin', 'Off'].map(s => (
                                    <TouchableOpacity
                                        key={s}
                                        onPress={() => setStatus(s)}
                                        style={[styles.statusPill, {
                                            backgroundColor: status === s ? colors.primary : colors.card,
                                            borderColor: status === s ? colors.primary : colors.cardBorder
                                        }]}
                                    >
                                        <Text style={{
                                            color: status === s ? '#fff' : colors.text,
                                            fontWeight: status === s ? 'bold' : 'normal',
                                            fontSize: 12
                                        }}>{s}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                                <Text style={styles.saveBtnText}>Simpan</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    blob1: { position: 'absolute', top: -50, left: -50, width: 250, height: 250, borderRadius: 125, opacity: 0.4 },
    blob2: { position: 'absolute', bottom: -50, right: -50, width: 300, height: 300, borderRadius: 150, opacity: 0.4 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, marginTop: 10, zIndex: 10 },
    glassButton: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    content: { padding: 20 },

    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, marginBottom: 24 },
    addBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    addBtnText: { color: '#fff', fontWeight: 'bold' },

    card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee' },
    info: { flex: 1, marginLeft: 12 },
    name: { fontWeight: '700', fontSize: 16 },
    actions: { flexDirection: 'row', gap: 8 },
    actionBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 24, padding: 24, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    avatarPicker: { position: 'relative', width: 80, height: 80 },
    avatarPreview: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#eee' },
    cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0EA5E9', padding: 6, borderRadius: 12, borderWidth: 2, borderColor: '#fff' },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
    input: { borderWidth: 1, borderRadius: 16, padding: 16, fontSize: 16 },
    saveBtn: { padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 30 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    role: { fontSize: 12 },
    statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    statusBadgeText: { fontSize: 10, fontWeight: 'bold' },
    statusRow: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
    statusPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, minWidth: 60, alignItems: 'center' },
    offlineBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 6, gap: 8, marginHorizontal: 20, borderRadius: 10, marginBottom: 5 },
    offlineText: { fontSize: 12, fontWeight: '600' },
    syncStatus: { marginRight: 10, justifyContent: 'center' },
});
