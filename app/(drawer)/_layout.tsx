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
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            
            <Stack.Screen 
                name="mechanics" 
                options={{ 
                    headerShown: true, 
                    title: 'Manajemen Mekanik',
                    headerStyle: { backgroundColor: colors.card },
                    headerTintColor: colors.text 
                }} 
            />
        </Stack>
    );
}
