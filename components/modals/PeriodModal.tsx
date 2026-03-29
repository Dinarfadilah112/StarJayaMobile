import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export type PeriodType = 'today' | 'week' | 'month' | 'custom';

interface Props {
    visible: boolean;
    onClose: () => void;
    currentPeriod: PeriodType;
    onSelectPeriod: (period: PeriodType) => void;
    onCustomRangeSelect: () => void;
}

export default function PeriodModal({ visible, onClose, currentPeriod, onSelectPeriod, onCustomRangeSelect }: Props) {
    const { colors } = useTheme();

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={[styles.periodModal, { backgroundColor: colors.card }]}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Pilih Periode</Text>

                    <TouchableOpacity
                        style={[styles.periodOption, currentPeriod === 'today' && { backgroundColor: colors.primary }]}
                        onPress={() => onSelectPeriod('today')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="today-outline" size={22} color={currentPeriod === 'today' ? '#FFF' : colors.text} />
                        <Text style={[styles.periodOptionText, { color: currentPeriod === 'today' ? '#FFF' : colors.text }]}>Hari Ini</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.periodOption, currentPeriod === 'week' && { backgroundColor: colors.primary }]}
                        onPress={() => onSelectPeriod('week')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="calendar-outline" size={22} color={currentPeriod === 'week' ? '#FFF' : colors.text} />
                        <Text style={[styles.periodOptionText, { color: currentPeriod === 'week' ? '#FFF' : colors.text }]}>Minggu Ini</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.periodOption, currentPeriod === 'month' && { backgroundColor: colors.primary }]}
                        onPress={() => onSelectPeriod('month')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="calendar" size={22} color={currentPeriod === 'month' ? '#FFF' : colors.text} />
                        <Text style={[styles.periodOptionText, { color: currentPeriod === 'month' ? '#FFF' : colors.text }]}>Bulan Ini</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.periodOption, currentPeriod === 'custom' && { backgroundColor: colors.primary }]}
                        onPress={() => {
                            onSelectPeriod('custom');
                            onCustomRangeSelect();
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="calendar-number-outline" size={22} color={currentPeriod === 'custom' ? '#FFF' : colors.text} />
                        <Text style={[styles.periodOptionText, { color: currentPeriod === 'custom' ? '#FFF' : colors.text }]}>Custom Range</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: colors.pill }]}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={{ color: colors.text, fontWeight: '600' }}>Tutup</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    periodModal: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10
    },
    modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 24, letterSpacing: 0.5 },
    periodOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        marginBottom: 10,
        gap: 12
    },
    periodOptionText: {
        fontSize: 16,
        fontWeight: '600'
    },
    cancelButton: { padding: 16, borderRadius: 18, alignItems: 'center', borderWidth: 1, borderColor: 'transparent', marginTop: 10 },
});
