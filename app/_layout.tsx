import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { NotificationProvider } from '@/context/NotificationContext';
import { ShopProvider } from '@/context/ShopContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { UserProvider } from '@/context/UserContext';
import { SyncProvider } from '@/context/SyncContext';
import { initDatabase } from '@/database/db';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState } from 'react';

import { useUser } from '@/context/UserContext';
import LoadingScreen from '@/components/LoadingScreen';
import LockScreen from '@/components/LockScreen';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

// Komponen Wrapper untuk akses useTheme di dalam StatusBar
function AppContent() {
    const { colors } = useTheme();
    const { isLocked, setLocked, user } = useUser();

    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
                <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
                <Stack.Screen name="(drawer)" options={{ animation: 'fade' }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            
            {(isLocked && user) && (
                <View style={[StyleSheet.absoluteFill, { zIndex: 99999 }]}>
                    <LockScreen onUnlock={() => setLocked(false)} />
                </View>
            )}
            
            <StatusBar style="dark" />
        </>
    );
}

export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);
    const colorScheme = useColorScheme();

    useEffect(() => {
        async function prepare() {
            try {
                // 1. Database Init
                initDatabase();
                
                // 2. Clear dummy data (v12 Nuclear Wipe)
                const WIPE_VERSION = 'v12_total_force_wipe';
                const hasBeenWiped = await AsyncStorage.getItem('wipe_status');
                if (hasBeenWiped !== WIPE_VERSION) {
                    console.log("💣 NUCLEAR RESET ACTIVATED...");
                    const { clearAllData } = require('@/database/db');
                    const { clearAllCloudData } = require('@/services/supabaseService');
                    
                    // a. Clear Local DB
                    clearAllData();
                    
                    // b. Clear Cloud DB
                    await clearAllCloudData();
                    
                    // c. Clear Storage
                    await AsyncStorage.multiRemove([
                        'user_session_v2', 
                        'user_session', 
                        'user', 
                        'onboarded', 
                        'last_sync_time', 
                        'sync_status'
                    ]);
                    
                    await AsyncStorage.setItem('wipe_status', WIPE_VERSION);
                    console.log("💥 NUCLEAR RESET COMPLETE.");
                }

                // 3. Load Icons
                await Font.loadAsync(Ionicons.font);

                // Aesthetic delay
                await new Promise(resolve => setTimeout(resolve, 1500));
            } catch (e) {
                console.warn(e);
            } finally {
                setIsReady(true);
            }
        }
        prepare();
    }, []);

    if (!isReady) {
        return <LoadingScreen />;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <UserProvider>
                    <SyncProvider>
                        <ShopProvider>
                            <NotificationProvider>
                                <AppContent />
                            </NotificationProvider>
                        </ShopProvider>
                    </SyncProvider>
                </UserProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
