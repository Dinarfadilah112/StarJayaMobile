import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { ShopProvider } from '@/context/ShopContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { SyncProvider } from '@/context/SyncContext';
import { initDatabase, clearAllData } from '@/database/db';

import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState } from 'react';

import LoadingScreen from '@/components/LoadingScreen';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

// Komponen Wrapper untuk akses useTheme di dalam StatusBar
function AppContent() {
    const { colors } = useTheme();

    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
                <Stack.Screen name="(drawer)" options={{ animation: 'fade' }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            
            <StatusBar style="dark" />
        </>
    );
}

export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);
    const colorScheme = useColorScheme();
    const router = useRouter();

    useEffect(() => {
        const checkOnboarding = async () => {
            const onboarded = await AsyncStorage.getItem('onboarded');
            if (onboarded !== 'true') {
                router.replace('/onboarding');
            }
        };

        async function prepare() {
            try {
                // 🛡️ Give native OS some time to clean up zombie connections from previous refresh
                await new Promise(res => setTimeout(res, 500));

                // 1. Database Init
                await initDatabase();
                
                // 2. Load Icons
                await Font.loadAsync(Ionicons.font);

                // 3. Check Onboarding
                await checkOnboarding();

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
                <SyncProvider>
                    <ShopProvider>
                        <AppContent />
                    </ShopProvider>
                </SyncProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
