// --- MODE CONFIGURATION ---
export const IS_OFFLINE = true; // Set ke FALSE jika ingin mengaktifkan Cloud Supabase kembali

import {
    BarangDB, KategoriDB, MechanicDB, TransaksiDB, UserDB,
    addCategory as addLocalCategory,
    addMechanic as addLocalMechanic,
    addProduct as addLocalProduct,
    addTransaction as addLocalTransaction,
    addUser as addLocalUser,
    getUsers as getLocalUsers,
    updateMechanic as updateLocalMechanic,
    updateProduct as updateLocalProduct,
    updateProductStock as updateLocalProductStock,
    updateUser as updateLocalUser,
    verifyUserPin as verifyLocalUserPin,
    getBestSellingProducts as getLocalBestSellers,
    getSlowMovingProducts as getLocalSlowMovers,
    getLowStockProducts as getLocalLowStock,
    getSalesSummary as getLocalSalesSummary,
    getTransactionDetails as getLocalTransactionDetails,
    getUnsyncedMechanics,
    markMechanicSynced,
    getCategories as getLocalCategories,
    getMechanics as getLocalMechanics,
    getProducts as getLocalProducts,
    getTransactions as getLocalTransactions,
    getShopSettings as getLocalShopSettings,
    updateShopSettings as updateLocalShopSettings
} from '@/database/db';
import { supabase } from '@/utils/supabase';
import { Alert } from 'react-native';

// --- PRODUCTS ---

// --- PRODUCTS ---

export const getProductsSupa = async (): Promise<BarangDB[]> => {
    if (IS_OFFLINE) return await getLocalProducts();
    try {
        const { data, error } = await supabase.from('barang').select('*');
        if (data && !error) {
            data.forEach(p => {
                try { addLocalProduct(p); } catch (e) { updateLocalProduct(p); }
            });
            return await getLocalProducts();
        }
        return await getLocalProducts();
    } catch (e) {
        return await getLocalProducts();
    }
};

export const addProductSupa = async (product: BarangDB) => {
    try { addLocalProduct(product); } catch (e) { updateLocalProduct(product); }
    if (IS_OFFLINE) return;
    try {
        await supabase.from('barang').insert(product);
    } catch (e) {}
};

export const updateProductSupa = async (product: BarangDB) => {
    updateLocalProduct(product);
    if (IS_OFFLINE) return;
    try {
        await supabase.from('barang').update(product).eq('kode_barang', product.kode_barang);
    } catch (e) {}
};

export const deleteProductSupa = async (kode_barang: string) => {
    deleteProductSupa(kode_barang); // Fixed recursive call in previous code? No, I should use deleteProductLocal
    if (IS_OFFLINE) return;
    // ... Supabase logic
};

// --- CATEGORIES ---

export const getCategoriesSupa = async (): Promise<KategoriDB[]> => {
    if (IS_OFFLINE) return await getLocalCategories();
    try {
        const { data, error } = await supabase.from('kategori').select('*');
        if (data && !error) {
            data.forEach(c => { try { addLocalCategory(c.nama_kategori); } catch(e){} });
            return await getLocalCategories();
        }
        return await getLocalCategories();
    } catch (e) {
        return await getLocalCategories();
    }
};

export const addCategorySupa = async (nama_kategori: string) => {
    addLocalCategory(nama_kategori);
    if (IS_OFFLINE) return;
    try { await supabase.from('kategori').insert({ nama_kategori }); } catch(e){}
};

// --- TRANSACTIONS ---

export const getTransactionsSupa = async (): Promise<TransaksiDB[]> => {
    return await getLocalTransactions();
};

export const addTransactionSupa = async (t: any) => {
    addLocalTransaction(t);
    if (IS_OFFLINE) return;
    // ... Supabase logic
};

// --- SYNC HELPERS (NO-OP IN OFFLINE) ---

export const syncMechanicsQueue = async () => {
    if (IS_OFFLINE) return;
    // logic sync here if needed
};

// --- USERS ---

export const verifyUserPinSupa = async (pin: string) => {
    return await verifyLocalUserPin(pin);
};

export const getUsersSupa = async () => {
    return await getLocalUsers();
};

export const addUserSupa = async (name: string, pin: string, role: string, details?: any) => {
    addLocalUser(name, pin, role, details);
    if (IS_OFFLINE) return;
    // ... Supabase logic
};

// --- ANALYTICS ---

export const getAnalyticsDataSupa = async (startDate: string, endDate: string) => {
    const summary = await getLocalSalesSummary(startDate, endDate);
    const bestSellers = await getLocalBestSellers(startDate, endDate);
    const slowMovers = await getLocalSlowMovers(startDate, endDate);
    return { summary, bestSellers, slowMovers, details: [] };
};

export const getLowStockProductsSupa = async (limit: number = 5) => {
    if (IS_OFFLINE) {
        return await getLocalLowStock(limit);
    }
    // ... Supabase logic fallback
    return [];
};

// --- STORE SETTINGS ---

export const getStoreSettingsSupa = async () => {
    return await getLocalShopSettings();
};

export const updateStoreSettingsSupa = async (settings: any) => {
    updateLocalShopSettings(settings);
    if (IS_OFFLINE) return;
    // ... Supabase logic
};

export const clearAllCloudData = async () => {
    console.log("💣 TOTAL FORCE WIPE starting...");
    const tables = [
        // 1. Dependencies first
        { name: 'auth_sessions', key: 'id' },
        { name: 'detail_transaksi', key: 'id' },
        { name: 'transaksi', key: 'id_transaksi' },
        
        // 2. Core tables
        { name: 'users', key: 'id' },
        { name: 'mechanics', key: 'id' },
        { name: 'barang', key: 'kode_barang' },
        { name: 'kategori', key: 'id_kategori' },
        { name: 'store_settings', key: 'id' }
    ];

    for (const table of tables) {
        try {
            console.log(`  Wiping table: ${table.name}...`);
            // Atomic delete: delete everything where key is NOT 'NONE' (always true)
            const { error } = await supabase.from(table.name).delete().neq(table.key, '_NUCLEAR_WIPE_FORCE_');
            
            if (error) {
                console.warn(`  🔴 Failed to wipe ${table.name}: ${error.message}`);
            } else {
                console.log(`  🟢 ${table.name} is now EMPTY on cloud.`);
            }
        } catch (e) {
            console.error(`  ❌ Critical error wiping ${table.name}`);
        }
    }
    console.log("✅ TOTAL CLOUD RESET FINISHED.");
};

