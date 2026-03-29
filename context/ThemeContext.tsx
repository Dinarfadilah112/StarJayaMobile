import React, { createContext, useContext } from 'react';

type ThemeContextType = {
    colors: {
        // by U Purple Theme
        primary: string;
        primaryDark: string;
        primaryLight: string;

        // Accents
        accent1: string; // Pink
        accent2: string; // Blue
        accent3: string; // Cyan

        // Status
        success: string;
        warning: string;
        danger: string;
        info: string;

        // Backgrounds
        background: string;
        card: string;
        pill: string;
        pillActive: string;

        // Decorative
        blob1: string;
        blob2: string;

        // Text
        text: string;
        textSecondary: string;

        // Borders
        cardBorder: string;
    };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Tema "The Growth & Profit" (Emerald Green & Slate Charcoal)
    const colors = {
        primary: '#10B981', // Emerald Green 500
        primaryDark: '#065F46', // Emerald 800
        primaryLight: '#D1FAE5', // Emerald 100 (Soft)

        // Accent Colors
        accent1: '#F43F5E', // Rose (Untuk danger/hot)
        accent2: '#0EA5E9', // Sky Blue (Untuk info/active)
        accent3: '#F59E0B', // Amber (Untuk pending)

        // Status Colors
        success: '#10B981',
        warning: '#F59E0B', 
        danger: '#F43F5E', 
        info: '#0EA5E9',

        // Backgrounds
        background: '#F8FAFC', // Slate 50 (Clean)
        card: '#FFFFFF', 
        pill: '#F1F5F9', // Slate 100
        pillActive: '#10B981',

        // Decorative Blobs
        blob1: 'rgba(16, 185, 129, 0.06)', // Soft Emerald
        blob2: 'rgba(6, 95, 70, 0.04)', // Deeper Emerald

        // Text
        text: '#0F172A', // Slate 900 (High Contrast)
        textSecondary: '#64748B', // Slate 500

        // Borders
        cardBorder: '#E2E8F0', // Slate 200
    };

    return (
        <ThemeContext.Provider value={{ colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
