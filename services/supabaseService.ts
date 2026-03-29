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
    getTransactions as getLocalTransactions
} from '@/database/db';
import { supabase } from '@/utils/supabase';
import { Alert } from 'react-native';

// --- PRODUCTS ---

export const getProductsSupa = async (): Promise<BarangDB[]> => {
    try {
        const { data, error } = await supabase
            .from('barang')
            .select('*');
        
        if (data && !error) {
            // Background sync to local
            data.forEach(p => {
                try { addLocalProduct(p); } catch (e) { updateLocalProduct(p); }
            });
            return data;
        }
        
        console.warn("⚠️ Supabase error (products), using local cache:", error?.message);
        return await getLocalProducts();
    } catch (e) {
        console.warn("⚠️ Supabase crash (products), using local cache");
        return await getLocalProducts();
    }
};

export const addProductSupa = async (product: BarangDB) => {
    // Always save local first
    try { addLocalProduct(product); } catch (e) { updateLocalProduct(product); }

    const { error } = await supabase
        .from('barang')
        .insert(product);
    if (error) console.error("⚠️ Failed to sync new product to cloud:", error.message);
};

export const updateProductSupa = async (product: BarangDB) => {
    // Always save local first
    updateLocalProduct(product);

    const { error } = await supabase
        .from('barang')
        .update({
            nama_barang: product.nama_barang,
            id_kategori: product.id_kategori,
            harga_jual: product.harga_jual,
            stok: product.stok,
            barcode: product.barcode,
            merek: product.merek,
            tipe_motor: product.tipe_motor,
            harga_beli: product.harga_beli,
            harga_beli_dus: product.harga_beli_dus,
            satuan: product.satuan,
            lokasi_rak: product.lokasi_rak
        })
        .eq('kode_barang', product.kode_barang);
    if (error) console.error("⚠️ Failed to sync product update to cloud:", error.message);
};

export const deleteProductSupa = async (kode_barang: string) => {
    const { error } = await supabase
        .from('barang')
        .delete()
        .eq('kode_barang', kode_barang);
    if (error) throw error;
};

// Update only stock (for checkout)
export const updateProductStockSupa = async (kode_barang: string, newStock: number) => {
    // Always update local stock first
    updateLocalProductStock(kode_barang, newStock);

    const { error } = await supabase
        .from('barang')
        .update({ stok: newStock })
        .eq('kode_barang', kode_barang);
    if (error) console.error("⚠️ Failed to sync stock to cloud:", error.message);
};


// --- CATEGORIES ---

export const getCategoriesSupa = async (): Promise<KategoriDB[]> => {
    try {
        const { data, error } = await supabase
            .from('kategori')
            .select('*');
        if (error) {
            console.warn("⚠️ Supabase error (categories), falling back to local:", error.message);
            return await getLocalCategories();
        }
        return data || [];
    } catch (e) {
        return await getLocalCategories();
    }
};

export const addCategorySupa = async (nama_kategori: string) => {
    const { error } = await supabase
        .from('kategori')
        .insert({ nama_kategori });
    if (error) throw error;
};

export const deleteCategorySupa = async (id_kategori: number) => {
    const { error } = await supabase
        .from('kategori')
        .delete()
        .eq('id_kategori', id_kategori);
    if (error) throw error;
    if (error) throw error;
};

// --- MECHANICS ---

export const getMechanicsSupa = async (): Promise<MechanicDB[]> => {
    try {
        const { data, error } = await supabase
            .from('mechanics')
            .select('*')
            .order('id', { ascending: true });
        
        if (data && !error) {
            // Sync to local
            data.forEach(m => {
                // Pass isSynced = 1 because it's coming FROM the cloud
                try { addLocalMechanic(m, 1); } catch (e) { updateLocalMechanic(m.id, m); }
            });
            return data;
        }
        
        console.warn("⚠️ Supabase error (mechanics), using cache:", error?.message);
        return await getLocalMechanics();
    } catch (e) {
        return await getLocalMechanics();
    }
};

export const addMechanicSupa = async (m: Omit<MechanicDB, 'id'>) => {
    // 1. Save to local first as 'unsynced' (is_synced = 0)
    addLocalMechanic(m, 0);

    // 2. Attempt sync
    try {
        const { data, error } = await supabase
            .from('mechanics')
            .insert({
                name: m.name,
                avatar: m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random`,
                email: m.email,
                phone: m.phone,
                address: m.address,
                status: m.status || 'Aktif'
            })
            .select()
            .single();

        if (!error && data) {
            // Update local to 1 as it's successfully synced
            // Since we use auto-increment on both, IDs might differ, but we sync by name/phone for existing check or just trust the latest local.
            // A better way is using UUIDs. For now, we update the last inserted one.
        }
    } catch (e) {
        console.warn("Offline: Mechanic saved but not synced.");
    }
};

export const syncMechanicsQueue = async () => {
    try {
        const unsynced = await getUnsyncedMechanics();
        if (unsynced.length === 0) return;

        console.log(`🔄 Syncing ${unsynced.length} mechanics to cloud...`);

        for (const m of unsynced) {
            const { error } = await supabase
                .from('mechanics')
                .upsert({
                    name: m.name,
                    avatar: m.avatar,
                    email: m.email,
                    phone: m.phone,
                    address: m.address,
                    status: m.status,
                    updated_at: m.updated_at
                }, { onConflict: 'name' }); // Assuming name is unique or used as key

            if (!error) {
                // Mark as synced in SQLite
                const { markMechanicSynced } = await import('@/database/db');
                markMechanicSynced(m.id);
            }
        }
    } catch (e) {
        console.error("Sync Queue Error:", e);
    }
};

export const updateMechanicSupa = async (id: number, m: Partial<MechanicDB>) => {
    const { error } = await supabase
        .from('mechanics')
        .update(m)
        .eq('id', id);
    if (error) throw error;
};

export const deleteMechanicSupa = async (id: number) => {
    const { error } = await supabase
        .from('mechanics')
        .delete()
        .eq('id', id);
    if (error) throw error;
};

// --- TRANSACTIONS ---

export const getTransactionsSupa = async (): Promise<TransaksiDB[]> => {
    // OFFLINE FIRST: Selalu ambil dari lokal dulu agar transaksi baru langsung muncul
    try {
        const local = await getLocalTransactions();
        if (local && local.length > 0) return local;

        // Jika lokal kosong, coba ambil dari Supabase
        const { data, error } = await supabase
            .from('transaksi')
            .select('*')
            .order('tanggal_transaksi', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (e) {
        return await getLocalTransactions();
    }
};

export const addTransactionSupa = async (t: {
    id: string;
    date: string;
    total: number;
    items: any[];
    paymentMethod?: string;
    serviceFee?: number;
    mechanicId?: number;
    mechanicName?: string;
    notes?: string;
}) => {
    // 1. SAVE TO LOCAL (Essential for Offline-First)
    try {
        addLocalTransaction(t);
    } catch (e) {
        console.error("Local transaction save failed:", e);
    }

    // 2. SYNC TO CLOUD
    try {
        const { error: transError } = await supabase
            .from('transaksi')
            .insert({
                id_transaksi: t.id,
                tanggal_transaksi: t.date,
                total_harga: t.total,
                payment_method: t.paymentMethod || 'Tunai',
                service_fee: t.serviceFee || 0,
                mechanic_id: t.mechanicId || null,
                mechanic_name: t.mechanicName || null,
                notes: t.notes || null,
            });

        if (transError) {
            // Handle schema mismatches on cloud
            if (transError.code === 'PGRST204' || transError.message?.includes('column')) {
                const { error: retryError } = await supabase
                    .from('transaksi')
                    .insert({
                        id_transaksi: t.id,
                        tanggal_transaksi: t.date,
                        total_harga: t.total,
                        payment_method: t.paymentMethod || 'Tunai',
                        service_fee: t.serviceFee || 0
                    });
                if (retryError) throw retryError;
            } else {
                throw transError;
            }
        }

        // Detail Sync
        const details = t.items.map(item => ({
            id_transaksi: t.id,
            kode_barang: item.id,
            nama_barang: item.name,
            jumlah: item.quantity,
            harga_satuan: item.price,
            subtotal: item.price * item.quantity
        }));

        const { error: detError } = await supabase
            .from('detail_transaksi')
            .insert(details);

        if (detError) throw detError;

    } catch (e) {
        console.warn("⚠️ Cloud sync failed. Transaction stored locally only.");
        // We don't throw error here to allow the user to finish checkout even if offline
    }
};

// --- USERS (PIN Login) ---

export const verifyUserPinSupa = async (pin: string) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('pin', pin)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Row not found is fine
            console.warn("⚠️ Supabase error (pin), falling back to local:", error.message);
            return await verifyLocalUserPin(pin);
        }
        return data;
    } catch (e) {
        return await verifyLocalUserPin(pin);
    }
};

export const getUsersSupa = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('id', { ascending: true });
            
        if (data && !error) {
            // Sync to local
            data.forEach(u => {
                try { addLocalUser(u.name, u.pin, u.role, u); } catch (e) { updateLocalUser(u.id, u); }
            });
            return data;
        }
        
        console.warn("⚠️ Supabase error (users), using cache:", error?.message);
        return await getLocalUsers();
    } catch (e) {
        return await getLocalUsers();
    }
};


export const addUserSupa = async (name: string, pin: string, role: string, details?: { email?: string, phone?: string, address?: string, status?: string, push_token?: string }) => {
    try {
        const { error } = await supabase
            .from('users')
            .insert({
                name,
                pin,
                role,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
                email: details?.email,
                phone: details?.phone,
                address: details?.address,
                push_token: details?.push_token,
                status: details?.status || 'Aktif'
            });
        if (error) throw error;
    } catch (error: any) {
        // If column missing (PGRST204), fallback to basic user data
        if (error.code === 'PGRST204' || error.message?.includes('column')) {
            console.warn("⚠️ Remote DB schema missing columns. Saving basic data only.");
            const { error: retryError } = await supabase
                .from('users')
                .insert({
                    name,
                    pin,
                    role,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
                });
            if (retryError) throw retryError;
        } else {
            throw error;
        }
    }
};

export const deleteUserSupa = async (id: number) => {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
    if (error) throw error;
};

export const updateUserSupa = async (id: number, data: { name?: string, pin?: string, role?: string, avatar?: string, email?: string, phone?: string, address?: string, status?: string, push_token?: string }) => {
    try {
        const { error } = await supabase
            .from('users')
            .update(data)
            .eq('id', id);
        if (error) throw error;
    } catch (error: any) {
        // If column missing (PGRST204), retry without new fields
        if (error.code === 'PGRST204' || error.message?.includes('column')) {
            console.warn("⚠️ Remote DB schema missing columns. Retrying with basic fields.");
            // Important: Alert the user that their cloud DB is out of date
            if (typeof Alert !== 'undefined') {
                Alert.alert(
                    "Database Belum Update",
                    "Fitur Status Mekanik/Profil belum tersimpan di Cloud karena struktur database Anda belum diupdate. Silakan jalankan SQL migration di Dashboard Supabase."
                );
            }

            // Filter out new fields to prevent schema error
            const { email, phone, address, status, push_token, ...basicData } = data;

            const { error: retryError } = await supabase
                .from('users')
                .update(basicData)
                .eq('id', id);
            if (retryError) throw retryError;
        } else {
            throw error;
        }
    }
};


// --- ANALYTICS & REPORTS (Supabase) ---

export const getTransactionDetailsSupa = async (transactionId: string) => {
    try {
        // Coba ambil dari lokal dulu
        const local = await getLocalTransactionDetails(transactionId);
        if (local && local.length > 0) return local;

        const { data, error } = await supabase
            .from('detail_transaksi')
            .select('*')
            .eq('id_transaksi', transactionId);
        if (error) throw error;
        return data || [];
    } catch (e) {
        return await getLocalTransactionDetails(transactionId);
    }
};

export const getLowStockProductsSupa = async (threshold: number = 5) => {
    // Database LOCAL adalah yang termandiri untuk stok
    try {
        return await getLocalLowStock(threshold);
    } catch (e) {
        const { data, error } = await supabase
            .from('barang')
            .select('*')
            .lte('stok', threshold)
            .gt('stok', 0)
            .order('stok', { ascending: true })
            .limit(20);
        if (error) throw error;
        return data || [];
    }
};

// Helper for date-based analytics
export const getAnalyticsDataSupa = async (startDate: string, endDate: string) => {
    try {
        // OFFLINE FIRST ANALYTICS: Hitung langsung dari HP (SQLite)
        const summary = await getLocalSalesSummary(startDate, endDate);
        const bestSellers = await getLocalBestSellers(startDate, endDate);
        const slowMovers = await getLocalSlowMovers(startDate, endDate);
        
        return { 
            summary,
            bestSellers: bestSellers || [], 
            slowMovers: slowMovers || [],
            details: [] // Ini untuk kompatibilitas filter manual di UI jika ada
        };
    } catch (e) {
        console.error("Analytics Error, falling back to basic agg:", e);
        return { summary: null, bestSellers: [], slowMovers: [], details: [] };
    }
};

// --- STORE SETTINGS ---

export const getStoreSettingsSupa = async () => {
    const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single();

    // If table is empty (PGRST116), return null to handle gracefully
    if (error && error.code !== 'PGRST116') throw error;

    return data || null;
};

export const updateStoreSettingsSupa = async (settings: {
    store_name: string;
    store_address?: string;
    store_phone?: string;
    receipt_footer?: string;
    business_type?: string;
}) => {
    // Check if a row exists
    const { data: existing } = await supabase.from('store_settings').select('id').limit(1).single();

    const payload = {
        ...settings,
        updated_at: new Date().toISOString()
    };

    if (existing) {
        const { error } = await supabase
            .from('store_settings')
            .update(payload)
            .eq('id', existing.id);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('store_settings')
            .insert(payload);
        if (error) throw error;
    }
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

