import { useUser } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { 
    Alert, 
    Dimensions, 
    KeyboardAvoidingView, 
    Platform, 
    ScrollView, 
    StyleSheet, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');
const BLUE_PRIMARY = '#2563EB';
const BLUE_BG = '#DBEAFE';

export default function RegisterScreen() {
    const { addNewUser } = useUser();
    
    // Form State
    const [form, setForm] = useState({
        name: '',
        pin: '',
        confirmPin: '',
        role: 'Owner', // Default role for first account
    });
    
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        // Validasi
        if (!form.name || !form.pin || !form.confirmPin) {
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
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#1F2937" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Daftar Akun Baru</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Illustration / Icon */}
                    <View style={styles.imageContainer}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="person-add-outline" size={32} color={BLUE_PRIMARY} />
                        </View>
                        <Text style={styles.title}>Selamat Datang!</Text>
                        <Text style={styles.subtitle}>
                            Buat akun owner kamu untuk mulai mengelola bengkel dengan aman.
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nama Lengkap / Owner</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput 
                                    style={styles.input}
                                    placeholder="Contoh: Dinar Fadilah"
                                    value={form.name}
                                    onChangeText={(val) => setForm({ ...form, name: val })}
                                />
                            </View>
                        </View>

                        {/* PIN */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>PIN Baru (6 Digit)</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput 
                                    style={styles.input}
                                    placeholder="Masukkan 6 angka rahasia"
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
                            <Text style={styles.label}>Konfirmasi PIN</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="shield-checkmark-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput 
                                    style={styles.input}
                                    placeholder="Ulangi 6 angka PIN"
                                    keyboardType="numeric"
                                    maxLength={6}
                                    secureTextEntry
                                    value={form.confirmPin}
                                    onChangeText={(val) => setForm({ ...form, confirmPin: val })}
                                />
                            </View>
                        </View>

                        {/* Role (Hidden or Pre-selected as Owner) */}
                        <View style={styles.tipBox}>
                            <Ionicons name="information-circle-outline" size={18} color={BLUE_PRIMARY} />
                            <Text style={styles.tipText}>
                                Akun ini akan didaftarkan sebagai <Text style={{ fontWeight: 'bold' }}>Owner</Text> dengan akses penuh ke seluruh fitur.
                            </Text>
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity 
                            style={[styles.btnRegister, { opacity: isLoading ? 0.7 : 1 }]}
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
                            <Text style={styles.loginLinkText}>
                                Sudah punya akun? <Text style={{ color: BLUE_PRIMARY }}>Login di sini</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
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
        color: '#1F2937'
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
        backgroundColor: BLUE_BG,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
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
        color: '#374151',
        marginBottom: 8,
        marginLeft: 4
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56
    },
    inputIcon: {
        marginRight: 12
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#111827'
    },
    tipBox: {
        flexDirection: 'row',
        backgroundColor: BLUE_BG + '40',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 32,
        gap: 10
    },
    tipText: {
        flex: 1,
        fontSize: 12,
        color: '#1E40AF',
        lineHeight: 18
    },
    btnRegister: {
        backgroundColor: BLUE_PRIMARY,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: BLUE_PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    btnRegisterText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800'
    },
    btnLoginLink: {
        alignItems: 'center',
        marginTop: 24
    },
    loginLinkText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6B7280'
    }
});
