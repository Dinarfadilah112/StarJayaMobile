import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState, useRef } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View, Animated, Modal, ScrollView, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const { colors } = useTheme();
    const userContext = useUser();
    const [pin, setPin] = useState('');
    const [hasBiometric, setHasBiometric] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const blinkAnim = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const triggerShake = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        Vibration.vibrate();
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
    };

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(blinkAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(blinkAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, [blinkAnim]);

    const login = userContext?.login || (async () => false);
    const usersList = userContext?.usersList || [];
    
    // Temukan akun Owner (Bos) secara diam-diam untuk bypass biometrik
    const ownerAccount = usersList.find(u => u.role === 'Owner' || u.role.toLowerCase() === 'admin');

    useEffect(() => {
        const checkBiometrics = async () => {
            try {
                const hasHardware = await LocalAuthentication.hasHardwareAsync();
                const isEnrolled = await LocalAuthentication.isEnrolledAsync();
                setHasBiometric(hasHardware && isEnrolled);
                
                if (hasHardware && isEnrolled) {
                    setTimeout(handleBiometricAuth, 500); 
                }
            } catch (e) {}
        };
        checkBiometrics();
    }, []);

    const handleBiometricAuth = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Verifikasi Biometrik',
                fallbackLabel: 'Gunakan PIN',
                cancelLabel: 'Batal',
                disableDeviceFallback: false,
            });

            if (result.success && ownerAccount) {
                const success = await login(ownerAccount.pin);
                if (!success) {
                    Alert.alert("Akses Ditolak", "Terjadi kesalahan saat memproses data.");
                }
            }
        } catch (error) {}
    };

    const handlePressNumber = (num: string) => {
        if (pin.length < 6) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 6) {
                submitLogin(newPin);
            }
        }
    };

    const handleDelete = () => setPin(prev => prev.slice(0, -1));

    const submitLogin = async (pinToSubmit: string) => {
        // Find if pin is valid BEFORE actually logging in to context
        const matchedUser = usersList.find(u => String(u.pin) === pinToSubmit);
        
        if (matchedUser) {
            // Success animation
            setIsUnlocked(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            Animated.spring(scaleAnim, {
                toValue: 1.3,
                friction: 3,
                useNativeDriver: true
            }).start();
            
            // Wait 500ms for the padlock animation to show, then actually login
            setTimeout(async () => {
                await login(pinToSubmit);
            }, 600);
        } else {
            // Incorrect
            triggerShake();
            setPin('');
        }
    };

    const handleLanjut = () => {
        if (pin.length === 6) {
            submitLogin(pin);
        }
    };

    const renderPinDots = () => {
        if (pin.length === 0) {
            return <Animated.Text style={[styles.cursorText, { opacity: blinkAnim, color: colors.textSecondary + '60' }]}>|</Animated.Text>;
        }
        let display = '';
        for (let i = 0; i < pin.length; i++) {
            display += '•   ';
        }
        return <Text style={[styles.pinDotsText, { color: colors.text }]}>{display.trim()}</Text>;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style="dark" />
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Verifikasi PIN</Text>
                
                <TouchableOpacity 
                    style={[styles.helpButton, { borderColor: colors.cardBorder }]}
                    onPress={() => setShowHelp(true)}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.primary} />
                    <Text style={[styles.helpText, { color: colors.primary }]}>Bantuan</Text>
                </TouchableOpacity>
            </View>

            {/* Lock Icon & Title */}
            <View style={styles.contentTop}>
                <Animated.View style={[
                    styles.lockCircle, 
                    { 
                        backgroundColor: isUnlocked ? '#10B98120' : colors.primary + '15',
                        transform: [{ translateX: shakeAnim }, { scale: scaleAnim }]
                    }
                ]}>
                    <Ionicons 
                        name={isUnlocked ? "lock-open-outline" : "lock-closed-outline"} 
                        size={32} 
                        color={isUnlocked ? '#10B981' : colors.primary} 
                    />
                </Animated.View>
                <Text style={[styles.title, { color: colors.text }]}>Masukkan PIN Kamu</Text>

                {/* PIN Input Box */}
                <Animated.View style={[styles.pinBox, { borderColor: colors.primary, backgroundColor: colors.background, transform: [{ translateX: shakeAnim }] }]}>
                    {renderPinDots()}
                </Animated.View>
            </View>

            {/* Middle Spacer to push Keypad down */}
            <View style={{ flex: 1 }} />

            {/* Actions */}
            <View style={styles.actionContainer}>
                {/* Spacer or loading indicator can go here if needed, but we keep it clean */}

                <TouchableOpacity 
                    onPress={() => {
                        // @ts-ignore
                        router.push('/(auth)/register');
                    }}
                    style={{ marginTop: 24 }}
                >
                    <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>
                        Pengguna Baru? <Text style={{ color: colors.primary, fontWeight: '700' }}>Daftar Akun</Text>
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Keypad Grid */}
            <View style={[styles.keypadContainer, { borderColor: colors.cardBorder }]}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num, i) => (
                    <TouchableOpacity 
                        key={num} 
                        style={[
                            styles.keypadBtn, 
                            { backgroundColor: colors.background, borderRightWidth: (i + 1) % 3 === 0 ? 0 : 1, borderColor: colors.cardBorder } 
                        ]} 
                        onPress={() => handlePressNumber(num)}
                    >
                        <Text style={[styles.keypadNum, { color: colors.text }]}>{num}</Text>
                    </TouchableOpacity>
                ))}
                
                <TouchableOpacity style={[styles.keypadBtn, { backgroundColor: colors.background, borderRightWidth: 1, borderColor: colors.cardBorder }]} onPress={handleBiometricAuth} disabled={!hasBiometric}>
                    {hasBiometric ? (
                        <Ionicons name="finger-print" size={28} color={colors.textSecondary} />
                    ) : (
                        <View />
                    )}
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.keypadBtn, { backgroundColor: colors.background, borderRightWidth: 1, borderColor: colors.cardBorder }]} onPress={() => handlePressNumber('0')}>
                    <Text style={[styles.keypadNum, { color: colors.text }]}>0</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.keypadBtn, { backgroundColor: colors.background, borderRightWidth: 0, borderColor: colors.cardBorder }]} onPress={handleDelete}>
                    <Ionicons name="backspace-outline" size={28} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Help Modal */}
            <Modal visible={showHelp} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Pusat Bantuan</Text>
                            <TouchableOpacity onPress={() => setShowHelp(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <View style={[styles.faqItem, { borderBottomColor: colors.cardBorder }]}>
                                <Text style={[styles.faqQuestion, { color: colors.text }]}>🔑 Lupa PIN Akun Saya?</Text>
                                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                                    Aplikasi ini bersifat luring (offline) demi keamanan data bengkel. 
                                    Jika Anda Kasir/Mekanik, silakan minta Owner untuk mereset sandi Anda dari dalam aplikasi. 
                                    Jika Anda Owner, silakan pastikan input PIN secara tepat. Menginstal ulang aplikasi dapat menyebabkan hilangnya data transaksi belum disinkronasi.
                                </Text>
                            </View>

                            <View style={[styles.faqItem, { borderBottomColor: colors.cardBorder }]}>
                                <Text style={[styles.faqQuestion, { color: colors.text }]}>📱 Apa itu logo Sidik Jari?</Text>
                                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                                    Fitur login biometrik (Sidik Jari / Face ID) akan digunakan secara default oleh sistem untuk mengunci "Akun Owner" agar proses login jauh lebih cepat namun tetap aman.
                                </Text>
                            </View>

                            <View style={[styles.faqItem, { borderBottomColor: colors.cardBorder, borderBottomWidth: 0 }]}>
                                <Text style={[styles.faqQuestion, { color: colors.text }]}>🌐 Butuh Koneksi Internet?</Text>
                                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                                    Tidak. Anda bisa membuka, mencatat transaksi, hingga mencetak struk secara offline.
                                </Text>
                            </View>
                        </ScrollView>
                        
                        <TouchableOpacity style={[styles.btnLanjut, { backgroundColor: colors.primary, marginTop: 16 }]} onPress={() => setShowHelp(false)}>
                            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>Tutup Bantuan</Text>
                        </TouchableOpacity>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: 16,
        position: 'relative'
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
    },
    helpButton: {
        position: 'absolute',
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6
    },
    helpText: {
        fontSize: 12,
        fontWeight: '700',
    },
    contentTop: {
        alignItems: 'center',
        marginTop: 50,
        paddingHorizontal: 24
    },
    lockCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 20
    },
    pinBox: {
        width: '100%',
        height: 64,
        borderWidth: 1.5,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cursorText: {
        fontSize: 28,
        fontWeight: '200'
    },
    pinDotsText: {
        fontSize: 32,
        letterSpacing: 2
    },
    actionContainer: {
        paddingHorizontal: 24,
        paddingBottom: 30,
        alignItems: 'center',
        gap: 24
    },
    forgotPin: {
        fontSize: 14,
        fontWeight: '800',
    },

    keypadContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        borderTopWidth: 1,
    },
    keypadBtn: {
        width: width / 3,
        height: 75,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    keypadNum: {
        fontSize: 26,
        fontWeight: '400',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottomWidth: 1,
        marginBottom: 16
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    modalBody: {
        marginBottom: 8
    },
    faqItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    faqQuestion: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 6
    },
    faqAnswer: {
        fontSize: 13,
        lineHeight: 20
    },
    btnLanjut: {
        width: '100%',
        height: 54,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
