import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { colors } = useTheme();
  const { user, logout } = useUser();
  const [pin, setPin] = useState('');
  const [hasBiometric, setHasBiometric] = useState(false);
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
        Animated.sequence([
            Animated.timing(blinkAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: true })
        ])
    ).start();

    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setHasBiometric(hasHardware && isEnrolled);
    
    if (hasHardware && isEnrolled) {
      handleBiometricAuth();
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verifikasi identitas mOTO',
        fallbackLabel: 'Gunakan PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onUnlock();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePressNumber = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (newPin.length === 6) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const verifyPin = async (enteredPin: string) => {
    if (user && enteredPin === user.pin) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onUnlock();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Vibration.vibrate();
      setPin('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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
      
      {/* Header Identik dengan Login */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Konfirmasi Keamanan</Text>
        <TouchableOpacity style={styles.helpButton} onPress={logout}>
            <Ionicons name="exit-outline" size={14} color="#EF4444" />
            <Text style={[styles.helpText, { color: '#EF4444' }]}>Keluar</Text>
        </TouchableOpacity>
      </View>

      {/* Info Identik dengan Login */}
      <View style={styles.contentTop}>
        <View style={[styles.lockCircle, { backgroundColor: colors.primaryLight + '40' }]}>
          <Ionicons name="lock-closed-outline" size={24} color={colors.primary} />
        </View>
        <Text style={styles.title}>Akses Terkunci</Text>
        <Text style={styles.subtitle}>Halo, {user?.name || 'User'}. Masukkan PIN kamu untuk melanjutkan sesi mOTO.</Text>

        <View style={[styles.pinBox, { borderColor: colors.primary }]}>
            {renderPinDots()}
        </View>
      </View>

      <View style={{ flex: 1 }} />

      {/* Lupa PIN / Ganti Akun */}
      <View style={styles.actionContainer}>
        <TouchableOpacity onPress={logout}>
            <Text style={[styles.forgotText, { color: colors.primary }]}>Bukan {user?.name}? <Text style={{ color: colors.primary }}>Ganti Akun</Text></Text>
        </TouchableOpacity>
      </View>

      {/* Keypad Identik dengan Login */}
      <View style={styles.keypadContainer}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num, i) => (
            <TouchableOpacity 
                key={num} 
                style={[styles.keypadBtn, { borderRightWidth: (i + 1) % 3 === 0 ? 0 : 1 }]} 
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
    zIndex: 99999,
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
  },
  contentTop: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 24,
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
    color: '#1F2937',
    marginBottom: 20
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 20
  },
  pinBox: {
    width: '100%',
    height: 64,
    borderWidth: 1.5,
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
    paddingBottom: 30,
    alignItems: 'center'
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '800',
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
