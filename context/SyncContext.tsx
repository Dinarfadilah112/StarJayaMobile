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
            const offline = !state.isConnected || (state.isInternetReachable === false);
            setIsOffline(offline);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const syncAll = async () => {
        if (isOffline) {
            console.log("Cannot sync: Currently offline.");
            return;
        }
        console.log("Manual Sync Started...");
        await syncMechanicsQueue();
        // Add other queues here (Products, Transactions, etc.)
        console.log("Manual Sync Finished.");
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
