import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface Props {
    visible: boolean;
    onClose: () => void;
    onPrint: () => void;
}

export default function CheckoutSuccessModal({ visible, onClose, onPrint }: Props) {
    const { colors } = useTheme();
    const successScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            successScale.setValue(0);
            Animated.spring(successScale, {
                toValue: 1,
                friction: 4,
                tension: 40,
                // @ts-ignore
                useNativeDriver: true,
            }).start();

            const hideTimeout = setTimeout(() => {
                Animated.timing(successScale, {
                    toValue: 0,
                    duration: 300,
                    // @ts-ignore
                    useNativeDriver: true,
                }).start(() => onClose());
            }, 2500);

            return () => clearTimeout(hideTimeout);
        }
    }, [visible, successScale, onClose]);

    const handlePrint = () => {
        onPrint();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                <Animated.View style={[styles.successModal, { transform: [{ scale: successScale }] }]}>
                    <View style={[styles.successIcon, { backgroundColor: colors.success }]}>
                        <Ionicons name="checkmark" size={60} color="#FFF" />
                    </View>
                    <Text style={[styles.successTitle, { color: colors.text }]}>Pembayaran Berhasil!</Text>
                    <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
                        Transaksi telah berhasil diproses
                    </Text>
                    <TouchableOpacity
                        style={[styles.printButton, { backgroundColor: colors.primary }]}
                        onPress={handlePrint}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="print-outline" size={20} color="#FFF" />
                        <Text style={styles.printButtonText}>Cetak Struk</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    successModal: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        maxWidth: 320,
        width: '90%',
    },
    successIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    printButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    printButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
