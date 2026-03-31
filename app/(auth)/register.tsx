import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { 
    Alert, 
    Dimensions, 
    KeyboardAvoidingView, 
    Modal,
    Platform, 
    ScrollView, 
    StyleSheet, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View 
} from 'react-native';
import { updateShopSettings } from '@/database/db';
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

export default function RegisterScreen() {
    const { colors } = useTheme();
    const { addNewUser } = useUser();
    
    // Form State
    const [form, setForm] = useState({
        name: '',
        shopName: '',
        shopCategory: '',
        pin: '',
        confirmPin: '',
        role: 'Owner', // Default role for first account
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const handleRegister = async () => {
        // Validasi
        if (!form.name || !form.shopName || !form.shopCategory || !form.pin || !form.confirmPin) {
            Alert.alert("Data Tidak Lengkap", "Harap isi semua kolom pendaftaran.");
            return;
        }

        if (form.pin.length !== 6) {
            Alert.alert("PIN Tidak Valid", "PIN harus terdiri dari 6 angka agar aman sentosa.");
            return;
        }

        if (form.pin !== form.confirmPin) {
            Alert.alert("PIN Tidak Cocok", "Konfirmasi PIN tidak sesuai dengan PIN utama.");
            return;
        }

        setIsLoading(true);
        try {
            await updateShopSettings({
                name: form.shopName,
                business_type: form.shopCategory
            });
            await addNewUser(form.name, form.pin, form.role, {
                status: 'Active'
            });
            
            Alert.alert(
                "Pendaftaran Berhasil", 
                "Akun kamu sudah aktif. Silakan login menggunakan PIN yang baru dibuat.",
                [{ text: "Login Sekarang", onPress: () => router.replace('/(auth)/login') }]
            );
        } catch (error) {
            Alert.alert("Gagal Daftar", "Terjadi kesalahan saat menyimpan akun baru.");
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
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Daftar Akun Baru</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Illustration / Icon */}
                    <View style={styles.imageContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="person-add-outline" size={32} color={colors.primary} />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>Selamat Datang!</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Silakan isi data berikut untuk membuat akun baru dan mulai gunakan aplikasi.
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Name */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Nama Lengkap / Owner</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                                <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                <TextInput 
                                    style={[styles.input, { color: colors.text }]}
                                    placeholderTextColor={colors.textSecondary + '70'}
                                    placeholder="Contoh: Dinar Fadilah"
                                    value={form.name}
                                    onChangeText={(val) => setForm({ ...form, name: val })}
                                />
                            </View>
                        </View>

                        {/* Shop Name */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Nama Usaha</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                                <Ionicons name="storefront-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                <TextInput 
                                    style={[styles.input, { color: colors.text }]}
                                    placeholderTextColor={colors.textSecondary + '70'}
                                    placeholder="Contoh: Star Jaya Motor"
                                    value={form.shopName}
                                    onChangeText={(val) => setForm({ ...form, shopName: val })}
                                />
                            </View>
                        </View>

                        {/* Shop Category */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Kategori Usaha</Text>
                            <TouchableOpacity 
                                style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}
                                onPress={() => setShowCategoryModal(true)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="grid-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                <Text style={[styles.input, { color: form.shopCategory ? colors.text : colors.textSecondary + '70' }]}>
                                    {form.shopCategory ? CATEGORIES.find(c => c.id === form.shopCategory)?.name : 'Pilih kategori usaha'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* PIN */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>PIN Baru (6 Digit)</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                <TextInput 
                                    style={[styles.input, { color: colors.text, letterSpacing: 5 }]}
                                    placeholderTextColor={colors.textSecondary + '70'}
                                    placeholder="******"
                                    keyboardType="numeric"
                                    maxLength={6}
                                    secureTextEntry
                                    value={form.pin}
                                    onChangeText={(val) => setForm({ ...form, pin: val })}
                                />
                            </View>
                        </View>

                        {/* Confirm PIN */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Konfirmasi PIN</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                                <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                <TextInput 
                                    style={[styles.input, { color: colors.text, letterSpacing: 5 }]}
                                    placeholderTextColor={colors.textSecondary + '70'}
                                    placeholder="******"
                                    keyboardType="numeric"
                                    maxLength={6}
                                    secureTextEntry
                                    value={form.confirmPin}
                                    onChangeText={(val) => setForm({ ...form, confirmPin: val })}
                                />
                            </View>
                        </View>


                        {/* Register Button */}
                        <TouchableOpacity 
                            style={[styles.btnRegister, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            <Text style={styles.btnRegisterText}>
                                {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.btnLoginLink}
                            onPress={() => router.back()}
                        >
                            <Text style={[styles.loginLinkText, { color: colors.textSecondary }]}>
                                Sudah punya akun? <Text style={{ color: colors.primary, fontWeight: '700' }}>Login di sini</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Category Modal */}
            <Modal visible={showCategoryModal} transparent animationType="fade">
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCategoryModal(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Pilih Jenis Usaha</Text>
                            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
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
                                        form.shopCategory === item.id && { backgroundColor: colors.primary + '10' }
                                    ]}
                                    onPress={() => {
                                        setForm({ ...form, shopCategory: item.id });
                                        setShowCategoryModal(false);
                                    }}
                                >
                                    <View style={[styles.categoryIcon, { backgroundColor: colors.primary + '10' }]}>
                                        <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                                    </View>
                                    <Text style={[
                                        styles.categoryText, 
                                        { color: colors.text },
                                        form.shopCategory === item.id && { color: colors.primary, fontWeight: '700' }
                                    ]}>{item.name}</Text>
                                    {form.shopCategory === item.id && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
    },
    imageContainer: {
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 32
    },
    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20
    },
    form: {
        paddingHorizontal: 24,
        marginTop: 32
    },
    inputGroup: {
        marginBottom: 20
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 4
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56
    },
    inputIcon: {
        marginRight: 12
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },

    btnRegister: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4
    },
    btnRegisterText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF'
    },
    btnLoginLink: {
        alignItems: 'center',
        marginTop: 24
    },
    loginLinkText: {
        fontSize: 14,
        fontWeight: '600'
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
        fontWeight: '600',
    }
});
