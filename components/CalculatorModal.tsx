import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface CalculatorModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function CalculatorModal({ isVisible, onClose }: CalculatorModalProps) {
    const { colors } = useTheme();
    const [display, setDisplay] = useState('0');
    const [prevValue, setPrevValue] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [nextValueExpected, setNextValueExpected] = useState(false);

    // Fungsi untuk format ribuan agar mudah dibaca Bos (misal: 1.000.000)
    const formatNumber = (val: string) => {
        if (!val || val === 'Error') return '0';
        
        // Pisahkan bagian desimal jika ada
        const parts = val.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return parts.join(',');
    };

    const handleNumber = (num: string) => {
        if (nextValueExpected) {
            setDisplay(num);
            setNextValueExpected(false);
        } else {
            setDisplay(display === '0' ? num : display + num);
        }
    };

    const handleOperator = (op: string) => {
        const inputValue = parseFloat(display);

        if (prevValue === null) {
            setPrevValue(inputValue);
        } else if (operator) {
            const result = calculate(prevValue, inputValue, operator);
            setPrevValue(result);
            setDisplay(String(result));
        }

        setNextValueExpected(true);
        setOperator(op);
    };

    const calculate = (v1: number, v2: number, op: string) => {
        switch (op) {
            case '+': return v1 + v2;
            case '-': return v1 - v2;
            case '×': return v1 * v2;
            case '÷': return v1 / v2;
            default: return v2;
        }
    };

    const handleEqual = () => {
        const inputValue = parseFloat(display);
        if (prevValue !== null && operator) {
            const result = calculate(prevValue, inputValue, operator);
            setDisplay(String(result));
            setPrevValue(null);
            setOperator(null);
            setNextValueExpected(true);
        }
    };

    const handleClear = () => {
        setDisplay('0');
        setPrevValue(null);
        setOperator(null);
        setNextValueExpected(false);
    };

    const CalcButton = ({ label, type = 'number', onPress }: any) => {
        let bgColor = '#F1F5F9';
        let textColor = '#1E293B';
        
        if (type === 'operator') {
            bgColor = colors.primary;
            textColor = '#FFFFFF';
        } else if (type === 'action') {
            bgColor = '#E2E8F0';
        }

        return (
            <TouchableOpacity 
                style={[styles.button, { backgroundColor: bgColor }]} 
                onPress={onPress}
                activeOpacity={0.7}
            >
                <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContent, { backgroundColor: '#FFFFFF' }]}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Kalkulator Cepat</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.displayContainer}>
                        <Text style={styles.displaySub} numberOfLines={1}>
                            {prevValue !== null ? `${formatNumber(String(prevValue))} ${operator || ''}` : ''}
                        </Text>
                        <Text style={styles.displayText} numberOfLines={1}>
                            {formatNumber(display)}
                        </Text>
                    </View>

                    <View style={styles.grid}>
                        <View style={styles.row}>
                            <CalcButton label="C" type="action" onPress={handleClear} />
                            <CalcButton label="÷" type="operator" onPress={() => handleOperator('÷')} />
                            <CalcButton label="×" type="operator" onPress={() => handleOperator('×')} />
                            <CalcButton label="⌫" type="action" onPress={() => setDisplay(display.length > 1 ? display.slice(0, -1) : '0')} />
                        </View>
                        <View style={styles.row}>
                            <CalcButton label="7" onPress={() => handleNumber('7')} />
                            <CalcButton label="8" onPress={() => handleNumber('8')} />
                            <CalcButton label="9" onPress={() => handleNumber('9')} />
                            <CalcButton label="-" type="operator" onPress={() => handleOperator('-')} />
                        </View>
                        <View style={styles.row}>
                            <CalcButton label="4" onPress={() => handleNumber('4')} />
                            <CalcButton label="5" onPress={() => handleNumber('5')} />
                            <CalcButton label="6" onPress={() => handleNumber('6')} />
                            <CalcButton label="+" type="operator" onPress={() => handleOperator('+')} />
                        </View>
                        <View style={styles.row}>
                            <CalcButton label="1" onPress={() => handleNumber('1')} />
                            <CalcButton label="2" onPress={() => handleNumber('2')} />
                            <CalcButton label="3" onPress={() => handleNumber('3')} />
                            <CalcButton label="=" type="operator" onPress={handleEqual} />
                        </View>
                        <View style={styles.row}>
                            <CalcButton label="0" onPress={() => handleNumber('0')} style={{ flex: 2 }} />
                            <CalcButton label="00" onPress={() => handleNumber('00')} />
                            <CalcButton label="." onPress={() => handleNumber('.')} />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 40, paddingHorizontal: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginBottom: 20 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    closeBtn: { padding: 4 },
    displayContainer: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20, marginBottom: 20, alignItems: 'flex-end' },
    displaySub: { fontSize: 16, color: '#64748b', marginBottom: 4 },
    displayText: { fontSize: 42, fontWeight: '800', color: '#1e293b' },
    grid: { gap: 12 },
    row: { flexDirection: 'row', gap: 12 },
    button: { flex: 1, height: 65, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    buttonText: { fontSize: 24, fontWeight: '700' }
});
