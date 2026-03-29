import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PersonalDataModal from '@/components/modals/PersonalDataModal';
import StoreProfileModal from '@/components/modals/StoreProfileModal';

export default function OptionsScreen() {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { logout } = useUser();

    // --- STATES ---
    const [personalModalVisible, setPersonalModalVisible] = useState(false);
    const [storeModalVisible, setStoreModalVisible] = useState(false);

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

    const SettingItem = ({ icon, title, subtitle, onPress, isDanger = false, rightIcon = "chevron-forward" }: any) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.iconBox, { backgroundColor: isDanger ? colors.danger + '15' : colors.primary + '15' }]}>
                    <Ionicons name={icon} size={22} color={isDanger ? colors.danger : colors.primary} />
                </View>
                <View style={{ marginLeft: 16 }}>
                    <Text style={[styles.itemTitle, { color: isDanger ? colors.danger : colors.text }]}>{title}</Text>
                    {subtitle && <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
                </View>
            </View>
            <Ionicons name={rightIcon} size={20} color={isDanger ? colors.danger : colors.textSecondary + '80'} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
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
                            title="Desain & Footer Struk" 
                            subtitle="Atur pesan bawah & preview struk"
                            onPress={() => setStoreModalVisible(true)} 
                        />
                        <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
                        <SettingItem 
                            icon="print-outline" 
                            title="Printer Bluetooth" 
                            subtitle="Hubungkan ke thermal printer"
                            onPress={() => Alert.alert("Segera Hadir", "Fitur cetak langsung via Bluetooth sedang dikembangkan.")} 
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
                            icon="finger-print-outline" 
                            title="Sensor Biometrik" 
                            subtitle="Face ID / Fingerprint Aktif"
                            rightIcon="checkmark-circle"
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

            <PersonalDataModal 
                visible={personalModalVisible} 
                onClose={() => setPersonalModalVisible(false)} 
            />

            <StoreProfileModal 
                visible={storeModalVisible} 
                onClose={() => setStoreModalVisible(false)} 
            />

        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, marginTop: 10 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { padding: 20 },

    sectionGroup: { marginBottom: 24 },
    sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 8 },
    cardBlock: { borderRadius: 16, padding: 8, borderWidth: 1 },
    
    settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    itemTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
    itemSubtitle: { fontSize: 13 },
    divider: { height: 1, marginHorizontal: 12 },

    lockButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 20, marginTop: 10, marginBottom: 40 },
    lockButtonText: { fontSize: 16, fontWeight: '700' },

    footerInfo: { alignItems: 'center', opacity: 0.5, marginBottom: 20 },
    footerText: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
});
