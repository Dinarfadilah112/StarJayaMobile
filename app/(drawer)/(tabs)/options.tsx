import { useTheme } from '@/context/ThemeContext';
import { useShop } from '@/context/ShopContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clearAllData, getMechanics, addMechanic } from '@/database/db';
import { performBackupToCloud } from '@/services/supabaseService';

import StoreProfileModal from '@/components/modals/StoreProfileModal';

export default function OptionsScreen() {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { shopInfo, refreshData } = useShop();

    const [isBackupLoading, setIsBackupLoading] = useState(false);
    const [storeModalVisible, setStoreModalVisible] = useState(false);

    /**
     * 🚀 Real High-Performance Cloud Backup
     */
    const handleBackupData = async () => {
        setIsBackupLoading(true);
        try {
            const result = await performBackupToCloud();
            if (result.success) {
                Alert.alert("✅ Backup Sukses", "Seluruh database telah aman disinkronisasi ke Cloud Supabase.");
            } else {
                throw new Error(result.error || "Gagal menghubungi server cadangan.");
            }
        } catch (e: any) {
            Alert.alert("❌ Backup Gagal", e.message || "Pastikan Anda terhubung ke internet.");
        } finally {
            setIsBackupLoading(false);
        }
    };

    const handleManageMechanics = async () => {
        const mechs = await getMechanics();
        const names = mechs.map((m: any) => m.name).join(', ') || 'Kosong';
        
        Alert.prompt(
            "👥 Kelola Mekanik",
            `Daftar saat ini: ${names}\n\nMasukkan nama mekanik baru:`,
            [
                { text: "Batal", style: 'cancel' },
                { 
                    text: "Tambah", 
                    onPress: async (name?: string) => {
                        if (name && name.trim()) {
                            await addMechanic(name.trim());
                            refreshData();
                            Alert.alert("Berhasil", `${name} terdaftar sebagai mekanik.`);
                        }
                    }
                }
            ]
        );
    };

    const handleResetDatabase = () => {
        Alert.alert(
            "⚠️ HAPUS TOTAL DATABASE LOKAL?",
            "Tindakan ini permanen. Semua barang, kasir, dan laporan di HP ini akan musnah. Lanjutkan?",
            [
                { text: "Batal", style: 'cancel' },
                { 
                    text: "YA, HAPUS SEMUA", 
                    style: 'destructive', 
                    onPress: async () => {
                        await clearAllData();
                        await refreshData();
                        Alert.alert("Berhasil", "Database lokal telah bersih total.");
                    } 
                }
            ]
        );
    };

    const SettingItem = ({ icon, title, subtitle, onPress, isDanger = false, rightElement }: any) => (
        <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.cardBorder, borderBottomWidth: 1 }]} 
            onPress={onPress} 
            activeOpacity={0.7}
            disabled={!!rightElement && !onPress}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.iconBox, { backgroundColor: isDanger ? colors.danger + '10' : colors.primary + '10' }]}>
                    <Ionicons name={icon} size={20} color={isDanger ? colors.danger : colors.primary} />
                </View>
                <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: isDanger ? colors.danger : colors.text }]}>{title}</Text>
                    {subtitle && <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{subtitle}</Text>}
                </View>
            </View>
            {rightElement ? rightElement : <Ionicons name="chevron-forward" size={16} color={colors.textSecondary + '40'} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Settings Center</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.sectionGroup}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>Workshop Metadata</Text>
                    <View style={[styles.cardBlock, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <SettingItem icon="business-outline" title="Profil Bengkel" subtitle="Ubah Identitas Toko & Struk" onPress={() => setStoreModalVisible(true)} />
                        <SettingItem icon="print-outline" title="Printer Bluetooth" subtitle="Pengaturan Output Thermal Struk" onPress={() => setStoreModalVisible(true)} />
                        <SettingItem icon="people-outline" title="Manajemen Mekanik" subtitle="Daftar Staf Lapangan" onPress={handleManageMechanics} />
                    </View>
                </View>

                <View style={styles.sectionGroup}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>Cloud Infrastructure</Text>
                    <View style={[styles.cardBlock, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <SettingItem 
                            icon="cloud-upload-outline" 
                            title="Backup ke Cloud" 
                            subtitle="Sinkronisasi Penuh ke Supabase"
                            onPress={handleBackupData} 
                            rightElement={isBackupLoading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
                        />
                    </View>
                    <Text style={styles.hintText}>* Selalu lakukan backup sebelum melakukan Reset Database.</Text>
                </View>

                <View style={styles.sectionGroup}>
                    <Text style={[styles.sectionTitle, { color: colors.danger }]}>Security & Danger Zone</Text>
                    <View style={[styles.cardBlock, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <SettingItem icon="refresh-outline" title="Reset Database" subtitle="Wipe Out Semua Data Lokal" isDanger={true} onPress={handleResetDatabase} />
                    </View>
                </View>

                <View style={styles.footerInfo}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>Star Jaya Mobile Engine v2.0</Text>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>Optimized for Independent Workshops</Text>
                </View>

            </ScrollView>

            <StoreProfileModal visible={storeModalVisible} onClose={() => setStoreModalVisible(false)} />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 22, paddingVertical: 18 },
    headerTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
    content: { padding: 18 },

    sectionGroup: { marginBottom: 28 },
    sectionTitle: { fontSize: 11, fontWeight: '900', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 2, opacity: 0.7 },
    cardBlock: { borderRadius: 24, overflow: 'hidden', borderWidth: 1 },
    
    settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 22 },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    itemTitle: { fontSize: 16, fontWeight: '800' },
    itemSub: { fontSize: 12, marginTop: 4, opacity: 0.6 },
    
    hintText: { fontSize: 10, color: 'gray', marginTop: 10, marginLeft: 10, fontStyle: 'italic', opacity: 0.8 },

    footerInfo: { alignItems: 'center', marginVertical: 40, opacity: 0.3 },
    footerText: { fontSize: 11, fontWeight: '700' },
});
