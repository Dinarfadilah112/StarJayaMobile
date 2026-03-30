import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { useShop } from '@/context/ShopContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clearAllData } from '@/database/db';

import PersonalDataModal from '@/components/modals/PersonalDataModal';
import StoreProfileModal from '@/components/modals/StoreProfileModal';
import PrinterBluetoothModal from '@/components/modals/PrinterBluetoothModal';

export default function OptionsScreen() {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { logout, user } = useUser();
    const { shopInfo } = useShop();

    // --- STATES ---
    const [storeModalVisible, setStoreModalVisible] = useState(false);
    const [printerModalVisible, setPrinterModalVisible] = useState(false);
    const [personalModalVisible, setPersonalModalVisible] = useState(false);

    const handleLockApp = () => {
        Alert.alert(
            "Kunci Aplikasi",
            "Aplikasi akan dikunci kembali ke layar Face ID / Masukkan PIN. Lanjutkan?",
            [
                { text: "Batal", style: 'cancel' },
                { text: "Kunci", style: 'destructive', onPress: () => {
                    logout();
                }}
            ]
        );
    };

    const handleResetDatabase = () => {
        Alert.alert(
            "Hapus Semua Data Lokal?",
            "Tindakan ini akan menghapus seluruh data Barang, Transaksi, dan User di HP ini. Data di Supabase TIDAK akan terhapus. Lanjutkan?",
            [
                { text: "Batal", style: 'cancel' },
                { 
                    text: "Ya, Hapus Semua", 
                    style: 'destructive', 
                    onPress: () => {
                        clearAllData();
                        Alert.alert("Berhasil", "Database lokal telah dibersihkan.");
                    } 
                }
            ]
        );
    };

    const SettingItem = ({ icon, title, onPress, isDanger = false, rightIcon = "chevron-forward" }: any) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.iconBox, { backgroundColor: isDanger ? colors.danger + '15' : colors.primary + '15' }]}>
                    <Ionicons name={icon} size={18} color={isDanger ? colors.danger : colors.primary} />
                </View>
                <View style={{ marginLeft: 14 }}>
                    <Text style={[styles.itemTitle, { color: isDanger ? colors.danger : colors.text }]}>{title}</Text>
                </View>
            </View>
            <Ionicons name={rightIcon} size={18} color={isDanger ? colors.danger : colors.textSecondary + '80'} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ width: 44, height: 44 }} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>Pengaturan Aplikasi</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* --- SEKSI 1: PENGATURAN AKUN --- */}
                <View style={styles.sectionGroup}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Pengaturan Akun</Text>
                    <View style={[styles.cardBlock, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <SettingItem 
                            icon="person-circle-outline" 
                            title="Data Pribadi" 
                            subtitle="Nama, No HP, Email & PIN Akses"
                            onPress={() => setPersonalModalVisible(true)} 
                        />
                    </View>
                </View>

                {/* --- SEKSI 2: PROFIL TOKO --- */}
                <View style={styles.sectionGroup}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Profil Toko</Text>
                    <View style={[styles.cardBlock, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <SettingItem 
                            icon="business-outline" 
                            title="Informasi Bengkel" 
                            subtitle="Nama, Alamat & Kontak Toko"
                            onPress={() => setStoreModalVisible(true)} 
                        />
                    </View>
                </View>

                {/* --- SEKSI 3: KANTOR & TIM --- */}
                <View style={styles.sectionGroup}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Kantor & Tim</Text>
                    <View style={[styles.cardBlock, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <SettingItem 
                            icon="people-outline" 
                            title="Manajemen Mekanik" 
                            subtitle="Kelola status & data teknisi"
                            onPress={() => navigation.navigate('mechanics' as never)} 
                        />
                         <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
                         <SettingItem 
                            icon="qr-code-outline" 
                            title="Tautkan Perangkat" 
                            subtitle="Scan QR untuk login di Web"
                            onPress={() => navigation.navigate('qr-scanner' as never)} 
                        />
                    </View>
                </View>

                {/* --- SEKSI 4: PENGATURAN STRUK --- */}
                <View style={styles.sectionGroup}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Pengaturan Struk</Text>
                    <View style={[styles.cardBlock, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <SettingItem 
                            icon="receipt-outline" 
                            title="Desain Struk" 
                            subtitle="Atur pesan bawah & preview struk"
                            onPress={() => setStoreModalVisible(true)} 
                        />
                        <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
                        <SettingItem 
                            icon="print-outline" 
                            title="Printer Bluetooth" 
                            subtitle="Hubungkan ke thermal printer"
                            onPress={() => setPrinterModalVisible(true)} 
                        />
                    </View>
                </View>

                {/* --- SEKSI 5: PREFERENSI SISTEM --- */}
                <View style={styles.sectionGroup}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferensi Sistem</Text>
                    <View style={[styles.cardBlock, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <SettingItem 
                            icon="notifications-outline" 
                            title="Notifikasi Kasir" 
                            subtitle="Suara & getaran saat transaksi"
                            rightIcon="toggle"
                            onPress={() => {}} 
                        />

                        <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
                        <SettingItem 
                            icon="color-palette-outline" 
                            title="Tema Aplikasi" 
                            subtitle="Pilih mode terang atau gelap"
                            onPress={() => {}} 
                        />
                    </View>
                </View>

                {/* --- SEKSI 6: PENGATURAN LANJUTAN --- */}
                <View style={styles.sectionGroup}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Pengaturan Lanjutan</Text>
                    <View style={[styles.cardBlock, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <SettingItem 
                            icon="trash-outline" 
                            title="Reset Database Lokal" 
                            subtitle="Hapus semua data di perangkat ini"
                            isDanger={true}
                            onPress={handleResetDatabase} 
                        />
                    </View>
                </View>

                {/* Logout / Exit */}
                <TouchableOpacity style={[styles.lockButton, { backgroundColor: colors.danger + '15' }]} onPress={handleLockApp} activeOpacity={0.8}>
                    <Ionicons name="exit-outline" size={20} color={colors.danger} style={{ marginRight: 8 }} />
                    <Text style={[styles.lockButtonText, { color: colors.danger }]}>Kunci & Keluar Aplikasi</Text>
                </TouchableOpacity>

                <View style={styles.footerInfo}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>mOTO v1.0.3</Text>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>Mobile Otomotif - Solusi Cerdas Manajemen Bengkel</Text>
                </View>

            </ScrollView>

            <StoreProfileModal visible={storeModalVisible} onClose={() => setStoreModalVisible(false)} />
            <PersonalDataModal visible={personalModalVisible} onClose={() => setPersonalModalVisible(false)} />
            <PrinterBluetoothModal visible={printerModalVisible} onClose={() => setPrinterModalVisible(false)} />

        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, marginTop: 10 },
    glassButton: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { padding: 16 },

    sectionGroup: { marginBottom: 20 },
    sectionTitle: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 8 },
    cardBlock: { borderRadius: 12, paddingVertical: 4, paddingHorizontal: 0, borderWidth: 1 },
    
    settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
    iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    itemTitle: { fontSize: 15, fontWeight: '500', marginBottom: 0 },
    itemSubtitle: { fontSize: 13 },
    divider: { height: 1, marginHorizontal: 16 },

    lockButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 14, marginTop: 10, marginBottom: 40 },
    lockButtonText: { fontSize: 15, fontWeight: '600' },

    footerInfo: { alignItems: 'center', opacity: 0.5, marginBottom: 20 },
    footerText: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
});
