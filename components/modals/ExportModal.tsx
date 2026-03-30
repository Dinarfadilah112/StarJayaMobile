import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

import { PeriodType } from './PeriodModal';

interface Props {
    visible: boolean;
    onClose: () => void;
    onExport: (format: 'csv' | 'excel' | 'pdf') => void;
    currentPeriod: PeriodType;
    onSelectPeriod: (period: PeriodType) => void;
    onCustomRangeSelect: () => void;
    periodLabel: string;
}

export default function ExportModal({ 
    visible, 
    onClose, 
    onExport, 
    currentPeriod, 
    onSelectPeriod, 
    onCustomRangeSelect,
    periodLabel 
}: Props) {
    const { colors } = useTheme();

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={[styles.exportModal, { backgroundColor: colors.card }]}>
                    <Text style={[styles.modalTitle, { color: colors.text, textAlign: 'center' }]}>Export Laporan</Text>

                    {/* Period selection within Export Modal */}
                    <View style={{ marginBottom: 24 }}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Pilih Periode Data</Text>
                        <TouchableOpacity
                            style={[styles.periodSelector, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}
                            onPress={onCustomRangeSelect}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.periodValue, { color: colors.text }]}>{periodLabel}</Text>
                            </View>
                            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                        </TouchableOpacity>

                        <View style={styles.quickPeriodContainer}>
                            {(['today', 'week', 'month'] as PeriodType[]).map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    onPress={() => onSelectPeriod(p)}
                                    style={[
                                        styles.quickPeriodBtn,
                                        { backgroundColor: colors.card, borderColor: colors.cardBorder },
                                        currentPeriod === p && { backgroundColor: colors.primary, borderColor: colors.primary }
                                    ]}
                                >
                                    <Text style={[
                                        styles.quickPeriodText,
                                        { color: colors.textSecondary },
                                        currentPeriod === p && { color: '#FFF' }
                                    ]}>
                                        {p === 'today' ? 'Hari Ini' : p === 'week' ? 'Minggu' : 'Bulan'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Pilih Format Dokumen</Text>

                    <View style={styles.exportOptionsContainer}>
                        <TouchableOpacity
                            style={[styles.exportOption, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }]}
                            onPress={() => onExport('csv')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.exportIconContainer, { backgroundColor: colors.primary }]}>
                                <Ionicons name="document-text" size={20} color="#FFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.exportText, { color: colors.text }]}>Export ke CSV</Text>
                                <Text style={[styles.exportSubtext, { color: colors.textSecondary }]}>Format teks sederhana untuk Excel</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.exportOption, { backgroundColor: '#10B98110', borderColor: '#10B98120' }]}
                            onPress={() => onExport('excel')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.exportIconContainer, { backgroundColor: '#10B981' }]}>
                                <Ionicons name="grid" size={20} color="#FFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.exportText, { color: colors.text }]}>Export ke Excel</Text>
                                <Text style={[styles.exportSubtext, { color: colors.textSecondary }]}>Format spreadsheet profesional</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.exportOption, { backgroundColor: '#EF444410', borderColor: '#EF444420' }]}
                            onPress={() => onExport('pdf')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.exportIconContainer, { backgroundColor: '#EF4444' }]}>
                                <Ionicons name="document" size={20} color="#FFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.exportText, { color: colors.text }]}>Export ke PDF/HTML</Text>
                                <Text style={[styles.exportSubtext, { color: colors.textSecondary }]}>Format dokumen siap cetak</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.cancelButtonText, { color: colors.text }]}>Batal</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    exportModal: { width: '100%', maxWidth: 400, borderRadius: 32, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 12 },
    modalHeaderIndicator: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 24, letterSpacing: 0.5 },
    exportOptionsContainer: { gap: 12, marginBottom: 24 },
    exportOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, gap: 16 },
    exportIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    exportText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.1, marginBottom: 2 },
    exportSubtext: { fontSize: 12, opacity: 0.7, fontWeight: '500' },
    cancelButton: { padding: 16, borderRadius: 18, alignItems: 'center', borderWidth: 1 },
    cancelButtonText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
    sectionTitle: { fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginLeft: 4 },
    periodSelector: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
    periodValue: { fontSize: 15, fontWeight: '700' },
    quickPeriodContainer: { flexDirection: 'row', gap: 8 },
    quickPeriodBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
    quickPeriodText: { fontSize: 13, fontWeight: '600' },
});
