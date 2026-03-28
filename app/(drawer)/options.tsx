import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OptionsScreen() {
    const navigation = useNavigation();
    const { colors, theme, toggleTheme } = useTheme();
    const { user, updateName, updateRole } = useUser();

    const [tempName, setTempName] = useState(user.name);

    const handleSave = () => {
        updateName(tempName);
        Alert.alert("Sukses", "Profil berhasil diperbarui!");
    };

    const roles = ['Owner', 'Kasir', 'Mekanik'];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.blob1, { backgroundColor: colors.blob1 }]} />
            <View style={[styles.blob2, { backgroundColor: colors.blob2 }]} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.glassButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}
                    onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                >
                    <Ionicons name="menu-outline" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Pengaturan</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Profile Section */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: user.avatar }} style={styles.avatar} />
                        <TouchableOpacity style={[styles.editBadge, { backgroundColor: colors.primary }]}>
                            <Ionicons name="camera" size={14} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Nama Bengkel / Akun</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.pill }]}
                            value={tempName}
                            onChangeText={setTempName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Peran (Role)</Text>
                        <View style={styles.roleContainer}>
                            {roles.map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.rolePill,
                                        { borderColor: colors.primary, backgroundColor: user.role === role ? colors.primary : 'transparent', borderWidth: 1 }
                                    ]}
                                    onPress={() => updateRole(role as any)}
                                >
                                    <Text style={{ color: user.role === role ? '#FFF' : colors.text }}>{role}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: colors.success }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveText}>Simpan Perubahan</Text>
                    </TouchableOpacity>
                </View>

                {/* App Settings */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Aplikasi</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={[styles.row, { borderBottomColor: colors.cardBorder, borderBottomWidth: 1 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.iconBox, { backgroundColor: theme === 'dark' ? '#334155' : '#E0F2FE' }]}>
                                <Ionicons name={theme === 'dark' ? "moon" : "sunny"} size={20} color={colors.text} />
                            </View>
                            <Text style={[styles.rowText, { color: colors.text }]}>Tema Gelap</Text>
                        </View>
                        <Switch
                            value={theme === 'dark'}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#CBD5E1', true: colors.primary }}
                        />
                    </View>

                    <TouchableOpacity style={styles.row}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.iconBox, { backgroundColor: theme === 'dark' ? '#334155' : '#E0F2FE' }]}>
                                <Ionicons name="notifications-outline" size={20} color={colors.text} />
                            </View>
                            <Text style={[styles.rowText, { color: colors.text }]}>Notifikasi</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Danger Zone */}
                <Text style={[styles.sectionTitle, { color: colors.danger, marginTop: 20 }]}>Area Berbahaya</Text>
                <TouchableOpacity style={[styles.card, { backgroundColor: colors.danger + '20', borderColor: colors.danger, borderWidth: 1, alignItems: 'center' }]}>
                    <Text style={{ color: colors.danger, fontWeight: 'bold' }}>Hapus Semua Data</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    blob1: { position: 'absolute', top: -50, left: -50, width: 250, height: 250, borderRadius: 125, opacity: 0.4 },
    blob2: { position: 'absolute', bottom: -50, right: -50, width: 300, height: 300, borderRadius: 150, opacity: 0.4 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, marginTop: 10, zIndex: 10 },
    glassButton: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    content: { padding: 24 },
    card: { borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 20 },
    avatarContainer: { alignSelf: 'center', marginBottom: 20 },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    editBadge: { position: 'absolute', bottom: 0, right: 0, padding: 8, borderRadius: 20 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, marginBottom: 8, fontWeight: '500' },
    input: { padding: 12, borderRadius: 12, borderWidth: 1, fontSize: 16 },
    roleContainer: { flexDirection: 'row', gap: 10 },
    rolePill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    saveBtn: { padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
    saveText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    rowText: { fontSize: 16, fontWeight: '500' },
});
