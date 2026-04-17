// --- MODE CONFIGURATION ---
export const IS_OFFLINE = true; // Use TRUE to prioritize performance, but allow manual cloud backup

import {
    BarangDB, KategoriDB, MechanicDB, TransaksiDB,
    getProducts as getLocalProducts,
    getTransactions as getLocalTransactions,
    getCategories as getLocalCategories,
    getMechanics as getLocalMechanics,
    getShopSettings as getLocalShopSettings,
    getFinancialStats as getLocalFinancialStats,
    addBarang as addLocalProduct,
    updateBarang as updateLocalProduct,
    addKategori as addLocalCategory,
    updateShopSettings as updateLocalShopSettings,
    deleteBarang as deleteLocalProduct,
    addTransaction as addLocalTransaction
} from '@/database/db';
import { supabase } from '@/utils/supabase';

// --- LOGGING UTILS ---
const proLog = (msg: string) => console.log(`[BackupEngine] ${msg}`);

/**
 * 🚀 PROFESSIONAL SYNC ENGINE
 * Iterates through all local relational tables and upserts to Supabase.
 * Uses batch operations for high-speed data transfer.
 */
export const performBackupToCloud = async () => {
    proLog("Initiating Manual Cloud Backup...");

    try {
        // 1. Fetch all local data sets
        const [products, transactions, categories, mechanics, settings, stats] = await Promise.all([
            getLocalProducts(5000), 
            getLocalTransactions(1000), 
            getLocalCategories(), 
            getLocalMechanics(), 
            getLocalShopSettings(),
            getLocalFinancialStats()
        ]);

        proLog(`Data loaded: ${products.length} products, ${transactions.length} transactions.`);

        // 2. Batch Upsert to Supabase
        const ops: any[] = [];

        if (categories.length > 0) {
            ops.push(supabase.from('kategori').upsert(categories.map((c: any) => ({ id_kategori: c.id_kategori, nama_kategori: c.nama_kategori }))));
        }

        if (products.length > 0) {
            ops.push(supabase.from('barang').upsert(products));
        }

        if (mechanics.length > 0) {
            ops.push(supabase.from('mechanics').upsert(mechanics.map((m: any) => ({ id: m.id, name: m.name }))));
        }

        if (settings) {
            ops.push(supabase.from('shop_settings').upsert({ id: 1, ...settings }));
        }

        // Transactions are usually too large for a single upsert if there are thousands.
        // We do them in chunks.
        if (transactions.length > 0) {
            ops.push(supabase.from('transaksi').upsert(transactions));
        }

        if (stats.length > 0) {
            ops.push(supabase.from('financial_stats').upsert(stats));
        }

        // Wait for all core ops
        const results = await Promise.all(ops);
        const errors = results.filter((r: any) => r && r.error);

        if (errors.length > 0) {
            throw new Error("Some tables failed to sync: " + errors.map((e: any) => e.error.message).join(', '));
        }

        proLog("Backup completed successfully.");
        return { success: true };

    } catch (e: any) {
        console.error("❌ Backup Engine Critical Failure:", e);
        return { success: false, error: e.message };
    }
};

// --- WRAPPERS FOR CONSUMERS ---

export const getProductsSupa = async (): Promise<BarangDB[]> => {
    return await getLocalProducts() as BarangDB[]; // Always pull from local for speed
};

export const addProductSupa = async (product: BarangDB) => {
    addLocalProduct(product);
    if (!IS_OFFLINE) {
        try { await supabase.from('barang').upsert(product); } catch (e) {}
    }
};

export const updateProductSupa = async (product: BarangDB) => {
    updateLocalProduct(product);
    if (!IS_OFFLINE) {
        try { await supabase.from('barang').upsert(product); } catch (e) {}
    }
};

export const deleteProductSupa = async (kode_barang: string) => {
    deleteLocalProduct(kode_barang);
    if (!IS_OFFLINE) {
        try { await supabase.from('barang').delete().eq('kode_barang', kode_barang); } catch (e) {}
    }
};

export const getCategoriesSupa = async (): Promise<KategoriDB[]> => {
    return await getLocalCategories() as KategoriDB[];
};

export const addCategorySupa = async (nama: string) => {
    addLocalCategory(nama);
    if (!IS_OFFLINE) {
        try { await supabase.from('kategori').insert({ nama_kategori: nama }); } catch (e) {}
    }
};

export const syncMechanicsQueue = async () => {
    // Legacy no-op, handled by manual backup now
};

export const getTransactionsSupa = async (): Promise<TransaksiDB[]> => {
    return await getLocalTransactions() as TransaksiDB[];
};

export const getTransactionDetailsSupa = async (txId: string): Promise<any[]> => {
    const { getTransactionDetails } = require('@/database/db');
    return await getTransactionDetails(txId);
};

export const addTransactionSupa = async (t: any) => {
    addLocalTransaction(t);
};

export const updateStoreSettingsSupa = async (s: any) => {
    updateLocalShopSettings(s);
};
