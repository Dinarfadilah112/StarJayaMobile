import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { ShopProvider } from '@/context/ShopContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { UserProvider } from '@/context/UserContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Komponen Wrapper untuk akses useTheme di dalam StatusBar
function AppContent() {
    const { theme } = useTheme();
    return (
        <>
            <Stack>
                <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </>
    );
}

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <UserProvider>
                    <ShopProvider>
                        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                            <AppContent />
                        </NavigationThemeProvider>
                    </ShopProvider>
                </UserProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
