import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

// Definisi Warna
export const Colors = {
    light: {
        background: '#F0F9FF', // Light Blue background
        card: 'rgba(255, 255, 255, 0.7)',
        cardBorder: 'rgba(255, 255, 255, 0.9)',
        text: '#0F172A',
        textSecondary: '#64748B',
        primary: '#0EA5E9', // Sky Blue 500
        accent: '#3B82F6',
        success: '#10B981',
        danger: '#EF4444',
        pill: 'rgba(255, 255, 255, 0.5)',
        pillActive: '#0EA5E9',
        blob1: '#BAE6FD', // Sky 200
        blob2: '#C7D2FE', // Indigo 200
    },
    dark: {
        background: '#0F172A', // Slate 900
        card: 'rgba(30, 41, 59, 0.7)', // Slate 800
        cardBorder: 'rgba(51, 65, 85, 0.8)',
        text: '#F1F5F9',
        textSecondary: '#94A3B8',
        primary: '#38BDF8', // Sky 400
        accent: '#60A5FA',
        success: '#34D399',
        danger: '#F87171',
        pill: 'rgba(30, 41, 59, 0.6)',
        pillActive: '#38BDF8',
        blob1: '#0C4A6E', // Sky 900
        blob2: '#1E3A8A', // Blue 900
    }
};

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    colors: typeof Colors.light;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemScheme = useColorScheme();
    const [theme, setTheme] = useState<Theme>(systemScheme === 'dark' ? 'dark' : 'light');

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const colors = Colors[theme];

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
