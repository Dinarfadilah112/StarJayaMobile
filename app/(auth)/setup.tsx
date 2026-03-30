import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { updateShopSettings } from '@/database/db';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/context/NotificationContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { 
    Alert, 
    Dimensions, 
    ScrollView, 
    StyleSheet, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View, 
    Modal,
    KeyboardAvoidingView,
    Platform,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: 'bengkel', name: 'Bengkel', icon: 'construct-outline' },
    { id: 'air_galon', name: 'Air Galon', icon: 'water-outline' },
    { id: 'elektronik', name: 'Elektronik', icon: 'tv-outline' },
    { id: 'buah_sayur', name: 'Buah & Sayuran', icon: 'leaf-outline' },
    { id: 'sembako', name: 'Toko Sembako', icon: 'basket-outline' },
    { id: 'laundry', name: 'Laundry', icon: 'shirt-outline' },
    { id: 'ponsel', name: 'Ponsel & Aksesoris', icon: 'phone-portrait-outline' },
    { id: 'studio', name: 'Studio Foto', icon: 'camera-outline' },
    { id: 'online', name: 'Online', icon: 'globe-outline' },
    { id: 'katering', name: 'Katering', icon: 'restaurant-outline' },
];

export default function SetupScreen() {
    const { colors } = useTheme();
    const { addNewUser, login } = useUser();
    const router = useRouter();

    const [name, setName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSetup = async () => {
        if (!name || !businessName || !businessType || !pin) {
            Alert.alert("Data Tidak Lengkap", "Silakan isi semua bidang yang diperlukan.");
            return;
        }

        if (pin.length !== 6) {
            Alert.alert("PIN Tidak Valid", "PIN harus terdiri dari 6 digit angka.");
            return;
        }

        if (pin !== confirmPin) {
            Alert.alert("PIN Tidak Cocok", "Konfirmasi PIN tidak sesuai.");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create the primary 'Owner' account
            await addNewUser(name, pin, 'Owner', { status: 'Aktif' });
            
            // 2. Set business profile
            await updateShopSettings({
                name: businessName,
                business_type: businessType
            });

            // 3. Login automatically
            const success = await login(pin);
            if (success) {
                router.replace('/(drawer)/(tabs)');
            } else {
                router.replace('/(auth)/login');
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Gagal menyimpan data akun baru.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Image 
                            source={require('@/assets/images/logo.png')} 
                            style={{ width: 150, height: 45, marginBottom: 20 }}
                            resizeMode="contain"
                        />
                        <Text style={[styles.title, { color: colors.text }]}>Buat Akun Bisnis</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Lengkapi data di bawah ini untuk mengaktifkan sistem kasir offline mOTO di perangkat Anda.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {/* KARTU 1: INFO PERSONAL & USAHA */}
                        <View style={[styles.cardBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="business" size={18} color={colors.primary} />
                                <Text style={[styles.cardTitle, { color: colors.text }]}>Profil Usaha</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Nama Pemilik</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
                                    <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput 
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Ketik nama Anda"
                                        placeholderTextColor={colors.textSecondary + '70'}
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Nama Usaha</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
                                    <Ionicons name="storefront-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput 
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Ketik nama usaha Anda"
                                        placeholderTextColor={colors.textSecondary + '70'}
                                        value={businessName}
                                        onChangeText={setBusinessName}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Jenis Usaha</Text>
                                <TouchableOpacity 
                                    style={[styles.inputWrapper, { backgroundColor: colors.background }]}
                                    onPress={() => setIsPickerVisible(true)}
                                >
                                    <Ionicons name="list-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <Text style={[styles.input, { color: businessType ? colors.text : colors.textSecondary + '70' }]}>
                                        {businessType ? CATEGORIES.find(c => c.id === businessType)?.name : 'Pilih Jenis Usaha'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* KARTU 2: KEAMANAN PIN */}
                        <View style={[styles.cardBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
                                <Text style={[styles.cardTitle, { color: colors.text }]}>Keamanan (PIN)</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Buat PIN (6 Digit Angka)</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
                                    <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput 
                                        style={[styles.input, { color: colors.text, letterSpacing: 5 }]}
                                        placeholder="******"
                                        placeholderTextColor={colors.textSecondary + '70'}
                                        keyboardType="numeric"
                                        maxLength={6}
                                        secureTextEntry
                                        value={pin}
                                        onChangeText={setPin}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Konfirmasi PIN</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
                                    <Ionicons name="key-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput 
                                        style={[styles.input, { color: colors.text, letterSpacing: 5 }]}
                                        placeholder="******"
                                        placeholderTextColor={colors.textSecondary + '70'}
                                        keyboardType="numeric"
                                        maxLength={6}
                                        secureTextEntry
                                        value={confirmPin}
                                        onChangeText={setConfirmPin}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={[styles.mainBtn, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
                        onPress={handleSetup}
                        disabled={isLoading}
                    >
                        <Text style={styles.mainBtnText}>{isLoading ? 'Menyimpan...' : 'Simpan & Mulai Bisnis'}</Text>
                        {!isLoading && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
                    </TouchableOpacity>
                    
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Business Type Picker Modal */}
            <Modal visible={isPickerVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Pilih Jenis Usaha</Text>
                            <TouchableOpacity onPress={() => setIsPickerVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                            {CATEGORIES.map((item) => (
                                <TouchableOpacity 
                                    key={item.id} 
                                    style={[
                                        styles.categoryItem, 
                                        { borderBottomColor: colors.cardBorder },
                                        businessType === item.id && { backgroundColor: colors.primary + '10' }
                                    ]}
                                    onPress={() => {
                                        setBusinessType(item.id);
                                        setIsPickerVisible(false);
                                    }}
                                >
                                    <View style={[styles.categoryIcon, { backgroundColor: colors.primary + '10' }]}>
                                        <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                                    </View>
                                    <Text style={[
                                        styles.categoryText, 
                                        { color: colors.text },
                                        businessType === item.id && { color: colors.primary, fontWeight: '700' }
                                    ]}>{item.name}</Text>
                                    {businessType === item.id && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 25,
        paddingTop: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 35,
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    cardBox: {
        borderWidth: 1,
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        gap: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 4,
    },
    inputWrapper: {
        height: 56,
        borderRadius: 16,
        borderWidth: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    pinSection: {
        marginTop: 10,
        gap: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    mainBtn: {
        marginTop: 40,
        height: 60,
        borderRadius: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    mainBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    modalList: {
        paddingVertical: 10,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 25,
        borderBottomWidth: 1,
    },
    categoryIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    categoryText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
});
