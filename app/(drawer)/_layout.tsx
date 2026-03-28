import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomDrawerContent(props: any) {
    const { top, bottom } = useSafeAreaInsets();
    const { theme, colors } = useTheme();
    const { user } = useUser();

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={{ paddingTop: 0 }}
                scrollEnabled={false}
            >
                {/* Custom Header */}
                <View style={[styles.header, { paddingTop: top + 20, backgroundColor: theme === 'dark' ? '#1E293B' : '#E0F2FE' }]}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: user.avatar }}
                            style={styles.avatar}
                        />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                        <Text style={[styles.userRole, { color: colors.textSecondary }]}>{user.role}</Text>
                    </View>
                </View>

                {/* Drawer Items */}
                <View style={styles.drawerItemsContainer}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>

            {/* Custom Footer */}
            <View style={[styles.footer, { paddingBottom: bottom + 20, borderTopColor: colors.cardBorder }]}>
                <TouchableOpacity style={styles.logoutBtn}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Keluar</Text>
                </TouchableOpacity>
                <Text style={[styles.versionText, { color: colors.textSecondary }]}>Versi 1.2.0 Settings</Text>
            </View>
        </View>
    );
}

export default function DrawerLayout() {
    const { colors, theme } = useTheme();

    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerActiveBackgroundColor: colors.primary,
                drawerActiveTintColor: '#FFFFFF',
                drawerInactiveTintColor: colors.textSecondary,
                drawerType: 'slide',
                drawerLabelStyle: {
                    marginLeft: -10,
                    fontSize: 15,
                    fontWeight: '600',
                },
                drawerItemStyle: {
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    marginVertical: 4,
                },
                drawerStyle: {
                    width: 280,
                    backgroundColor: colors.background,
                },
                overlayColor: 'rgba(0,0,0,0.5)',
            }}
        >
            <Drawer.Screen
                name="index"
                options={{
                    drawerLabel: 'Dashboard',
                    title: 'Dashboard',
                    drawerIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="view-dashboard-outline" size={22} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="kasir"
                options={{
                    drawerLabel: 'Kasir',
                    title: 'Kasir',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="cart-outline" size={22} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="gudang"
                options={{
                    drawerLabel: 'Gudang Barang',
                    title: 'Gudang',
                    drawerIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cube-outline" size={22} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="penjualan"
                options={{
                    drawerLabel: 'Laporan',
                    title: 'Laporan',
                    drawerIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="chart-line" size={22} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="options"
                options={{
                    drawerLabel: 'Pengaturan',
                    title: 'Pengaturan',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" size={22} color={color} />
                    ),
                }}
            />
        </Drawer>
    );
}

const styles = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingBottom: 20, marginBottom: 10 },
    avatarContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    avatar: { width: 60, height: 60, borderRadius: 30 },
    userInfo: {},
    userName: { fontSize: 20, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    userRole: { fontSize: 13, marginTop: 2 },
    drawerItemsContainer: { flex: 1, paddingHorizontal: 10 },
    footer: { paddingHorizontal: 20, borderTopWidth: 1, paddingTop: 20 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    logoutText: { marginLeft: 12, fontSize: 16, fontWeight: '600', color: '#EF4444' },
    versionText: { marginTop: 12, fontSize: 12, textAlign: 'center' },
});
