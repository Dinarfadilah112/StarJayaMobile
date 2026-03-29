import { useUser } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useEffect, useState, useRef } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const BLUE_PRIMARY = '#2563EB'; // Warna utama (Royal Blue)
const BLUE_LIGHT = '#93C5FD'; // Warna tombol disabled (Light Blue)
const BLUE_BG = '#DBEAFE'; // Warna background icon gembok

export default function LoginScreen() {
    const userContext = useUser();
    const [pin, setPin] = useState('');
    const [hasBiometric, setHasBiometric] = useState(false);
    const blinkAnim = useRef(new Animated.Value(1)).current;

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
        const valid = await login(pinToSubmit);
        if (!valid) {
            Alert.alert("Akses Ditolak", "PIN yang Anda masukkan salah.");
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
            return <Animated.Text style={[styles.cursorText, { opacity: blinkAnim }]}>|</Animated.Text>;
        }
        let display = '';
        for (let i = 0; i < pin.length; i++) {
            display += '•   ';
        }
        return <Text style={styles.pinDotsText}>{display.trim()}</Text>;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Verifikasi PIN</Text>
                
                <TouchableOpacity style={styles.helpButton}>
                    <Ionicons name="chatbubble-ellipses-outline" size={14} color={BLUE_PRIMARY} />
                    <Text style={styles.helpText}>Bantuan</Text>
                </TouchableOpacity>
            </View>

            {/* Lock Icon & Title */}
            <View style={styles.contentTop}>
                <View style={styles.lockCircle}>
                    <Ionicons name="lock-closed-outline" size={24} color={BLUE_PRIMARY} />
                </View>
                <Text style={styles.title}>Masukkan PIN Kamu</Text>

                {/* PIN Input Box */}
                <View style={styles.pinBox}>
                    {renderPinDots()}
                </View>
            </View>

            {/* Middle Spacer to push Keypad down */}
            <View style={{ flex: 1 }} />

            {/* Actions: Lupa PIN & Lanjut */}
            <View style={styles.actionContainer}>
                <TouchableOpacity 
                    onPress={() => {
                        // @ts-ignore
                        router.push('/(auth)/register');
                    }}
                >
                    <Text style={styles.forgotPin}>Belum punya akun? <Text style={{ color: BLUE_PRIMARY }}>Daftar</Text></Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.btnLanjut, { backgroundColor: pin.length === 6 ? BLUE_PRIMARY : BLUE_LIGHT }]}
                    disabled={pin.length < 6}
                    onPress={handleLanjut}
                    activeOpacity={0.8}
                >
                    <Text style={styles.btnLanjutText}>Lanjut</Text>
                </TouchableOpacity>
            </View>

            {/* Keypad Grid */}
            <View style={styles.keypadContainer}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num, i) => (
                    <TouchableOpacity 
                        key={num} 
                        style={[
                            styles.keypadBtn, 
                            { borderRightWidth: (i + 1) % 3 === 0 ? 0 : 1 } 
                        ]} 
                        onPress={() => handlePressNumber(num)}
                    >
                        <Text style={styles.keypadNum}>{num}</Text>
                    </TouchableOpacity>
                ))}
                
                <TouchableOpacity style={[styles.keypadBtn, { borderRightWidth: 1 }]} onPress={handleBiometricAuth} disabled={!hasBiometric}>
                    {hasBiometric ? (
                        <Ionicons name="finger-print" size={28} color="#4B5563" />
                    ) : (
                        <View />
                    )}
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.keypadBtn, { borderRightWidth: 1 }]} onPress={() => handlePressNumber('0')}>
                    <Text style={styles.keypadNum}>0</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.keypadBtn, { borderRightWidth: 0 }]} onPress={handleDelete}>
                    <Ionicons name="backspace-outline" size={28} color="#4B5563" />
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
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
        color: '#1F2937'
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
        borderColor: '#E5E7EB',
        gap: 6
    },
    helpText: {
        fontSize: 12,
        fontWeight: '700',
        color: BLUE_PRIMARY
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
        backgroundColor: BLUE_LIGHT + '40',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 20
    },
    pinBox: {
        width: '100%',
        height: 64,
        borderWidth: 1.5,
        borderColor: BLUE_PRIMARY,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF'
    },
    cursorText: {
        fontSize: 28,
        color: '#D1D5DB',
        fontWeight: '200'
    },
    pinDotsText: {
        fontSize: 32,
        color: '#1F2937',
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
        color: BLUE_PRIMARY
    },
    btnLanjut: {
        width: '100%',
        height: 54,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnLanjutText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800'
    },
    keypadContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        borderTopWidth: 1,
        borderColor: '#F3F4F6'
    },
    keypadBtn: {
        width: width / 3,
        height: 75,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#F3F4F6',
        backgroundColor: '#FFFFFF'
    },
    keypadNum: {
        fontSize: 26,
        fontWeight: '400',
        color: '#1F2937'
    }
});
