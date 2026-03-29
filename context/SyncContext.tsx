import React, { createContext, useContext, useEffect, useState } from 'react';
import { syncMechanicsQueue } from '@/services/supabaseService';
import NetInfo from '@react-native-community/netinfo';

interface SyncContextType {
    isOffline: boolean;
    syncAll: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        // Monitor internet connection
        const unsubscribe = NetInfo.addEventListener(state => {
            const offline = !state.isConnected || !state.isInternetReachable;
            setIsOffline(offline);
            
            if (!offline) {
                // Auto sync when back online
                syncAll();
            }
        });

        // Periodic sync every 5 minutes
        const interval = setInterval(() => {
            syncAll();
        }, 5 * 60 * 1000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const syncAll = async () => {
        console.log("Checking for data to sync...");
        await syncMechanicsQueue();
        // Add other queues here (Products, Transactions, etc.)
    };

    return (
        <SyncContext.Provider value={{ isOffline, syncAll }}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) throw new Error('useSync must be used within SyncProvider');
    return context;
};
