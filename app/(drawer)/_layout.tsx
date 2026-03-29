import { useTheme } from '@/context/ThemeContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function MainLayout() {
    const { colors } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background }
            }}
        >
            {/* Tabs is the main screen */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            
            {/* These are now simple stack screens instead of drawer screens */}
            <Stack.Screen 
                name="mechanics" 
                options={{ 
                    headerShown: true, 
                    title: 'Manajemen Mekanik',
                    headerStyle: { backgroundColor: colors.card },
                    headerTintColor: colors.text 
                }} 
            />
            <Stack.Screen 
                name="qr-scanner" 
                options={{ 
                    headerShown: true, 
                    title: 'Tautkan Perangkat',
                    headerStyle: { backgroundColor: colors.card },
                    headerTintColor: colors.text 
                }} 
            />
            <Stack.Screen 
                name="notifications" 
                options={{ 
                    headerShown: true, 
                    title: 'Notifikasi',
                    headerStyle: { backgroundColor: colors.card },
                    headerTintColor: colors.text 
                }} 
            />
        </Stack>
    );
}
