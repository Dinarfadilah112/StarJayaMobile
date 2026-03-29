import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Product } from './ShopContext';

// Configure how notifications are handled when the app is open
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export type NotificationType = 'low_stock' | 'new_product' | 'transaction' | 'product_update' | 'product_delete';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    productId?: string;
    productName?: string;
    timestamp: number;
    read: boolean;
    data?: any;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    expoPushToken: string | undefined;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    clearNotification: (notificationId: string) => void;
    clearAllNotifications: () => void;
    checkLowStock: (products: Product[]) => void;
    notifyNewProduct: (product: Product) => void;
    notifyTransaction: (amount: number, itemCount: number) => void;
    notifyProductUpdate: (product: Product) => void;
    notifyProductDelete: (productName: string) => void;
    sendTestNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = '@notifications';
const LOW_STOCK_THRESHOLD = 5;

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();

    useEffect(() => {
        // Register for push notifications
        registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('📬 Notification received:', notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('👉 Notification tapped:', response);
        });

        loadNotifications();

        return () => {
            if (notificationListener.current) notificationListener.current.remove();
            if (responseListener.current) responseListener.current.remove();
        };
    }, []);

    useEffect(() => {
        saveNotifications();
    }, [notifications]);

    const loadNotifications = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setNotifications(parsed);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const saveNotifications = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    };

    const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = {
            ...notification,
            id,
            timestamp: Date.now(),
            read: false,
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Trigger a system notification local
        await Notifications.scheduleNotificationAsync({
            content: {
                title: notification.title,
                body: notification.message,
                data: notification.data || {},
                sound: true,
            },
            trigger: null,
        });
    };

    const markAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId ? { ...notif, read: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    const clearNotification = (notificationId: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    const sendTestNotification = async () => {
        await addNotification({
            type: 'transaction',
            title: 'Tes Notifikasi mOTO 🚀',
            message: 'Ini adalah contoh bagaimana notifikasi masuk ke HP Anda tanpa pulsa!',
        });
    };

    const checkLowStock = (products: Product[]) => {
        const lowStockProducts = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD && !p.category.includes('Service'));
        lowStockProducts.forEach(product => {
            const hasUnreadNotif = notifications.some(notif =>
                notif.productId === product.id && notif.type === 'low_stock' && !notif.read
            );
            if (!hasUnreadNotif) {
                addNotification({
                    type: 'low_stock',
                    title: 'Stok Menipis!',
                    message: `${product.name} tersisa ${product.stock} ${product.unit}`,
                    productId: product.id,
                    productName: product.name,
                });
            }
        });
    };

    const notifyNewProduct = (product: Product) => {
        if (product.category.includes('Service')) return;
        addNotification({
            type: 'new_product',
            title: 'Produk Baru Ditambahkan',
            message: `${product.name} telah ditambahkan ke gudang`,
            productId: product.id,
            productName: product.name,
        });
    };

    const notifyTransaction = (amount: number, itemCount: number) => {
        addNotification({
            type: 'transaction',
            title: 'Transaksi Berhasil',
            message: `${itemCount} item terjual senilai Rp ${amount.toLocaleString('id-ID')}`,
            data: { amount, itemCount },
        });
    };

    const notifyProductUpdate = (product: Product) => {
        addNotification({
            type: 'product_update',
            title: 'Produk Diperbarui',
            message: `${product.name} telah diperbarui`,
            productId: product.id,
            productName: product.name,
        });
    };

    const notifyProductDelete = (productName: string) => {
        addNotification({
            type: 'product_delete',
            title: 'Produk Dihapus',
            message: `${productName} telah dihapus dari gudang`,
        });
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                expoPushToken,
                addNotification,
                markAsRead,
                markAllAsRead,
                clearNotification,
                clearAllNotifications,
                checkLowStock,
                notifyNewProduct,
                notifyTransaction,
                notifyProductUpdate,
                notifyProductDelete,
                sendTestNotification
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
    return context;
}

async function registerForPushNotificationsAsync() {
    let token;
    
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token!');
            return;
        }
        
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
        
        try {
            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            console.log('🎟️ EXPO PUSH TOKEN:', token);
        } catch (e) {
            console.log('Error getting push token', e);
        }
    }

    return token;
}
