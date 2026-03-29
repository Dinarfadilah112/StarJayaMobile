import { Notification, useNotifications } from '@/context/NotificationContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAllNotifications } = useNotifications();

    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Baru saja';
        if (minutes < 60) return `${minutes} menit yang lalu`;
        if (hours < 24) return `${hours} jam yang lalu`;
        if (days < 7) return `${days} hari yang lalu`;
        return new Date(timestamp).toLocaleDateString('id-ID');
    };

    const getNotificationIcon = (type: 'low_stock' | 'new_product' | 'transaction' | 'product_update' | 'product_delete') => {
        switch (type) {
            case 'low_stock':
                return { name: 'alert-circle', color: colors.danger, bg: colors.danger + '15' };
            case 'new_product':
                return { name: 'package-variant', color: colors.success, bg: colors.success + '15' };
            case 'transaction':
                return { name: 'cash-multiple', color: '#10b981', bg: '#10b98115' };
            case 'product_update':
                return { name: 'pencil-circle', color: '#3b82f6', bg: '#3b82f615' };
            case 'product_delete':
                return { name: 'delete-circle', color: colors.danger, bg: colors.danger + '15' };
            default:
                return { name: 'information-circle', color: colors.primary, bg: colors.primary + '15' };
        }
    };

    const handleNotificationPress = (notif: Notification) => {
        if (!notif.read) {
            markAsRead(notif.id);
        }
    };

    const handleClearAll = () => {
        Alert.alert(
            'Hapus Semua Notifikasi',
            'Apakah Anda yakin ingin menghapus semua notifikasi?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: clearAllNotifications
                }
            ]
        );
    };

    const renderNotification = ({ item }: { item: Notification }) => {
        const iconConfig = getNotificationIcon(item.type);

        return (
            <TouchableOpacity
                style={[
                    styles.notificationCard,
                    {
                        backgroundColor: item.read ? colors.card : colors.pill,
                        borderColor: item.read ? colors.cardBorder : colors.primary + '20',
                        borderWidth: item.read ? 1 : 2,
                    }
                ]}
                onPress={() => handleNotificationPress(item)}
            >
                <View style={[styles.iconBox, { backgroundColor: iconConfig.bg }]}>
                    <MaterialCommunityIcons name={iconConfig.name as any} size={24} color={iconConfig.color} />
                </View>

                <View style={styles.notificationContent}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
                        {!item.read && (
                            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                        )}
                    </View>
                    <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                        {item.message}
                    </Text>
                    <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                        {formatTimestamp(item.timestamp)}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => clearNotification(item.id)}
                    style={styles.deleteButton}
                >
                    <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.blob1, { backgroundColor: colors.blob1 }]} />
            <View style={[styles.blob2, { backgroundColor: colors.blob2 }]} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={{ flex: 1, marginHorizontal: 16 }}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Notifikasi</Text>
                    {unreadCount > 0 && (
                        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                            {unreadCount} belum dibaca
                        </Text>
                    )}
                </View>

                {notifications.length > 0 && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.pill, borderColor: colors.cardBorder }]}
                        onPress={unreadCount > 0 ? markAllAsRead : handleClearAll}
                    >
                        <Ionicons
                            name={unreadCount > 0 ? "checkmark-done" : "trash-outline"}
                            size={20}
                            color={unreadCount > 0 ? colors.success : colors.danger}
                        />
                        <Text style={{ fontSize: 12, color: unreadCount > 0 ? colors.success : colors.danger, marginLeft: 4, fontWeight: '600' }}>
                            {unreadCount > 0 ? 'Tandai Semua' : 'Hapus Semua'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Notifications List */}
            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconBox, { backgroundColor: colors.pill }]}>
                            <Ionicons name="notifications-off-outline" size={60} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>
                            Tidak Ada Notifikasi
                        </Text>
                        <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
                            Anda akan menerima notifikasi tentang{'\n'}
                            barang baru dan stok yang menipis
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    blob1: {
        position: 'absolute',
        top: -100,
        right: -50,
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.5,
    },
    blob2: {
        position: 'absolute',
        bottom: 100,
        left: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        opacity: 0.5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
        flex: 1,
    },
    notificationMessage: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 6,
    },
    notificationTime: {
        fontSize: 11,
        fontWeight: '500',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
        marginTop: 4,
    },
    deleteButton: {
        padding: 4,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyIconBox: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});
