import { UserDB } from '@/database/db';
import { 
    addUserSupa as addUserToDB, 
    deleteUserSupa as deleteUserInDB, 
    getUsersSupa as getUsers, 
    updateUserSupa as updateUserInDB, 
    verifyUserPinSupa as verifyUserPin 
} from '@/services/supabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppState, Alert } from 'react-native';

interface UserContextType {
    user: UserDB | null;
    login: (pin: string) => Promise<boolean>;
    logout: () => void;
    isLocked: boolean;
    setLocked: (locked: boolean) => void;
    usersList: UserDB[];
    refreshUsers: () => Promise<void>;
    addNewUser: (name: string, pin: string, role: string, details?: { email?: string, phone?: string, address?: string, status?: string, push_token?: string }) => Promise<void>;
    updateUserProfile: (id: number, data: { name?: string, pin?: string, role?: string, avatar?: string, email?: string, phone?: string, address?: string, status?: string }) => void;
    removeUser: (id: number) => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserDB | null>(null);
    const [usersList, setUsersList] = useState<UserDB[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);

    const router = useRouter();
    const segments = useSegments();

    const appState = useRef(AppState.currentState);
    const backgroundTime = useRef<number | null>(null);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                if (backgroundTime.current) {
                    const timePassed = Date.now() - backgroundTime.current;
                    const LOCK_THRESHOLD = 30 * 1000;
                    if (timePassed >= LOCK_THRESHOLD && user) {
                        setIsLocked(true);
                    }
                    backgroundTime.current = null;
                }
            } else if (nextAppState === 'background') {
                backgroundTime.current = Date.now();
            }
            appState.current = nextAppState;
        });
        return () => subscription.remove();
    }, [user]);

    const refreshUsers = async () => {
        try {
            const list = await getUsers();
            setUsersList(list || []);
            if (list && list.length === 0) {
                setIsLocked(false);
            }
        } catch (e) {
            console.error("❌ UserContext: Error fetching users", e);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                await refreshUsers();
                const storedUser = await AsyncStorage.getItem('user_session_v2');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    setUser(parsed);
                    setIsLocked(true);
                }
            } catch (e) {
                console.warn("Init failed", e);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inDrawerGroup = segments[0] === '(drawer)';
        const isOnboarding = segments[0] === 'onboarding';

        if (usersList.length === 0) {
            if (!isOnboarding && segments[1] !== 'setup') {
                // @ts-ignore
                router.replace('/onboarding');
            }
            return;
        }

        if (!user) {
            if (!inAuthGroup) {
                // @ts-ignore
                router.replace('/(auth)/login');
            }
        } else if (inAuthGroup || isOnboarding) {
            // @ts-ignore
            router.replace('/(drawer)');
        }
    }, [user, isLoading, usersList.length, segments]);

    const login = async (pin: string): Promise<boolean> => {
        try {
            const foundUser = await verifyUserPin(pin);
            if (foundUser) {
                if (foundUser.role === 'Mekanik' || foundUser.role === 'Teknisi') {
                    Alert.alert("Akses Ditolak", "Staf operasional tidak memiliki hak akses aplikasi.");
                    return false;
                }
                setUser(foundUser);
                await AsyncStorage.setItem('user_session_v2', JSON.stringify(foundUser));
                setIsLocked(false);
                return true;
            }
            return false;
        } catch (e) {
            console.error("Login error", e);
            return false;
        }
    };

    const logout = async () => {
        setUser(null);
        setIsLocked(false);
        await AsyncStorage.removeItem('user_session_v2');
        // @ts-ignore
        router.replace('/(auth)/login');
    };

    const addNewUser = async (name: string, pin: string, role: string, details?: any) => {
        await addUserToDB(name, pin, role, details);
        await refreshUsers();
    };

    const updateUserProfile = async (id: number, data: any) => {
        await updateUserInDB(id, data);
        await refreshUsers();
    };

    const removeUser = async (id: number) => {
        await deleteUserInDB(id);
        await refreshUsers();
    };

    return (
        <UserContext.Provider value={{
            user, login, logout, isLocked, setLocked: setIsLocked,
            usersList, refreshUsers, addNewUser, updateUserProfile, removeUser,
            isLoading
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};
