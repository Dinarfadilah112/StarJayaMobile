import * as SQLite from 'expo-sqlite';

const DB_NAME = 'starjaya_internal.db';

const db = SQLite.openDatabaseSync(DB_NAME);

export interface BarangDB {
    kode_barang: string;
    nama_barang: string;
    stok: number;
    harga_jual: number;
    id_kategori: number;
    // New Fields
    barcode?: string;
    harga_beli?: number;
    harga_beli_dus?: number;
    lokasi_rak?: string;
    merek?: string;
    tipe_motor?: string;
    satuan?: string;
}

export interface KategoriDB {
    id_kategori: number;
    nama_kategori: string;
}

export interface MechanicDB {
    id: number;
    name: string;
    avatar?: string;
    email?: string;
    phone?: string;
    address?: string;
    status?: string;
    is_synced?: number; // 0 or 1
    updated_at?: string;
}

export interface UserDB {
    id: number;
    name: string;
    pin: string;
    role: 'Owner' | 'Kasir' | 'Teknisi' | 'Mekanik';
    avatar?: string;
    email?: string;
    phone?: string;
    address?: string;
    status?: string; // e.g. 'Aktif', 'Sakit', 'Izin', etc.
    push_token?: string;
}

export interface TransaksiDB {
    id_transaksi: string;
    tanggal_transaksi: string;
    total_harga: number;
    payment_method?: string;
    service_fee?: number;
    mechanic_id?: number;
    mechanic_name?: string;
    notes?: string;
}

export const initDatabase = () => {
    try {
        if (!db) return;

        // 1. KATEGORI TABLE
        db.execSync(`
            CREATE TABLE IF NOT EXISTS kategori (
                id_kategori INTEGER PRIMARY KEY AUTOINCREMENT,
                nama_kategori TEXT NOT NULL
            );
        `);

        // 2. BARANG
        db.execSync(`CREATE TABLE IF NOT EXISTS barang (kode_barang TEXT PRIMARY KEY NOT NULL, nama_barang TEXT NOT NULL, id_kategori INTEGER DEFAULT 0, harga_jual INTEGER NOT NULL DEFAULT 0, stok INTEGER NOT NULL DEFAULT 0);`);
        const addBarangCols = [
            'ALTER TABLE barang ADD COLUMN barcode TEXT',
            'ALTER TABLE barang ADD COLUMN merek TEXT',
            'ALTER TABLE barang ADD COLUMN tipe_motor TEXT',
            'ALTER TABLE barang ADD COLUMN harga_beli INTEGER DEFAULT 0',
            'ALTER TABLE barang ADD COLUMN harga_beli_dus INTEGER DEFAULT 0',
            'ALTER TABLE barang ADD COLUMN satuan TEXT',
            'ALTER TABLE barang ADD COLUMN lokasi_rak TEXT',
            'ALTER TABLE barang ADD COLUMN is_synced INTEGER DEFAULT 0'
        ];
        addBarangCols.forEach(sql => { try { db.execSync(sql); } catch (e) {} });

        // 3. TRANSAKSI
        db.execSync(`CREATE TABLE IF NOT EXISTS transaksi (id_transaksi TEXT PRIMARY KEY NOT NULL, tanggal_transaksi TEXT DEFAULT CURRENT_TIMESTAMP, total_harga INTEGER NOT NULL);`);
        const addTransCols = [
            'ALTER TABLE transaksi ADD COLUMN payment_method TEXT',
            'ALTER TABLE transaksi ADD COLUMN service_fee INTEGER',
            'ALTER TABLE transaksi ADD COLUMN mechanic_id INTEGER',
            'ALTER TABLE transaksi ADD COLUMN mechanic_name TEXT',
            'ALTER TABLE transaksi ADD COLUMN notes TEXT',
            'ALTER TABLE transaksi ADD COLUMN is_synced INTEGER DEFAULT 0'
        ];
        addTransCols.forEach(sql => { try { db.execSync(sql); } catch (e) {} });

        // 4. DETAIL TRANSAKSI
        db.execSync(`CREATE TABLE IF NOT EXISTS detail_transaksi (
            id_transaksi TEXT,
            kode_barang TEXT,
            nama_barang TEXT,
            jumlah INTEGER,
            harga_satuan INTEGER,
            subtotal INTEGER
        );`);

        // 5. MECHANICS
        db.execSync(`CREATE TABLE IF NOT EXISTS mechanics (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);`);
        const addMechCols = [
            'ALTER TABLE mechanics ADD COLUMN avatar TEXT',
            'ALTER TABLE mechanics ADD COLUMN email TEXT',
            'ALTER TABLE mechanics ADD COLUMN phone TEXT',
            'ALTER TABLE mechanics ADD COLUMN address TEXT',
            'ALTER TABLE mechanics ADD COLUMN status TEXT DEFAULT "Aktif"',
            'ALTER TABLE mechanics ADD COLUMN is_synced INTEGER DEFAULT 0',
            'ALTER TABLE mechanics ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP'
        ];
        addMechCols.forEach(sql => { try { db.execSync(sql); } catch (e) {} });

        // 6. USERS
        db.execSync(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, pin TEXT NOT NULL, role TEXT NOT NULL);`);
        const addUserCols = [
            'ALTER TABLE users ADD COLUMN avatar TEXT',
            'ALTER TABLE users ADD COLUMN email TEXT',
            'ALTER TABLE users ADD COLUMN phone TEXT',
            'ALTER TABLE users ADD COLUMN address TEXT',
            'ALTER TABLE users ADD COLUMN status TEXT DEFAULT "Aktif"',
            'ALTER TABLE users ADD COLUMN is_synced INTEGER DEFAULT 0'
        ];
        addUserCols.forEach(sql => { try { db.execSync(sql); } catch (e) {} });

        // 7. SHOP SETTINGS
        db.execSync(`CREATE TABLE IF NOT EXISTS shop_settings (id INTEGER PRIMARY KEY CHECK (id = 1), name TEXT NOT NULL);`);
        const addShopCols = [
            'ALTER TABLE shop_settings ADD COLUMN address TEXT',
            'ALTER TABLE shop_settings ADD COLUMN phone TEXT',
            'ALTER TABLE shop_settings ADD COLUMN footer_note TEXT',
            'ALTER TABLE shop_settings ADD COLUMN logo_uri TEXT',
            'ALTER TABLE shop_settings ADD COLUMN business_type TEXT',
            'ALTER TABLE shop_settings ADD COLUMN is_synced INTEGER DEFAULT 0'
        ];
        addShopCols.forEach(sql => { try { db.execSync(sql); } catch (e) {} });

        // 8. PENGELUARAN
        db.execSync(`CREATE TABLE IF NOT EXISTS pengeluaran (id INTEGER PRIMARY KEY AUTOINCREMENT, tanggal TEXT DEFAULT CURRENT_TIMESTAMP);`);
        try { db.execSync('ALTER TABLE pengeluaran ADD COLUMN kategori TEXT'); } catch (e) {}
        try { db.execSync('ALTER TABLE pengeluaran ADD COLUMN jumlah INTEGER'); } catch (e) {}
        try { db.execSync('ALTER TABLE pengeluaran ADD COLUMN keterangan TEXT'); } catch (e) {}
        try { db.execSync('ALTER TABLE pengeluaran ADD COLUMN is_synced INTEGER DEFAULT 0'); } catch (e) {}

        // 9. PEMBELIAN
        db.execSync(`CREATE TABLE IF NOT EXISTS pembelian (id TEXT PRIMARY KEY, tanggal TEXT DEFAULT CURRENT_TIMESTAMP);`);
        try { db.execSync('ALTER TABLE pembelian ADD COLUMN supplier TEXT'); } catch (e) {}
        try { db.execSync('ALTER TABLE pembelian ADD COLUMN total_harga INTEGER'); } catch (e) {}
        try { db.execSync('ALTER TABLE pembelian ADD COLUMN is_synced INTEGER DEFAULT 0'); } catch (e) {}

        // 10. DETAIL PEMBELIAN
        db.execSync(`CREATE TABLE IF NOT EXISTS detail_pembelian (
            id_pembelian TEXT,
            kode_barang TEXT,
            nama_barang TEXT,
            jumlah INTEGER,
            harga_satuan INTEGER,
            subtotal INTEGER
        );`);

        console.log('✅ Database Schema verified and updated.');
        // clearDuplicateMechanics();
        // seedDatabase() - REMOVED to follow 'no dummy' requirement

    } catch (e) {
        console.error('❌ Database init error:', e);
    }
};

export const clearAllData = () => {
    const tables = [
        'detail_transaksi', 'transaksi', 'barang', 'mechanics',
        'users', 'kategori', 'shop_settings', 'pengeluaran',
        'pembelian', 'detail_pembelian'
    ];
    
    tables.forEach(table => {
        try {
            db.execSync(`DELETE FROM ${table}`);
        } catch (e) {
            // Ignore if table doesn't exist yet
        }
    });
    console.log("🔥 FULL Database Wipe Successful.");
};

const seedDatabase = () => {
    // 1. Seed Categories (Basic starting set)
    const catCheck = db.getFirstSync('SELECT count(*) as count FROM kategori') as { count: number };
    if (catCheck.count === 0) {
        db.execSync(`
            INSERT INTO kategori (nama_kategori) VALUES 
            ('Oli'), ('Sparepart'), ('Service'), ('Ban'), ('Aksesoris');
        `);
    }

    // 2. We no longer seed dummy Users or Shop Settings
    // This will be handled by the New Account Setup screen
};

// --- CRUD ---

export interface ShopSettings {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    footer_note?: string;
    logo_uri?: string;
    business_type?: string;
}

export const getShopSettings = async (): Promise<ShopSettings | null> => {
    return await db.getFirstAsync('SELECT * FROM shop_settings WHERE id = 1') as ShopSettings;
};

// --- Financial Getters ---

export const getTotalRevenue = async (month?: string): Promise<number> => {
    let query = 'SELECT SUM(total_harga) as total FROM transaksi';
    let params: any[] = [];
    if (month) {
        query += " WHERE strftime('%m', tanggal_transaksi) = ?";
        params = [month];
    }
    const result = await db.getFirstAsync(query, params) as { total: number };
    return result?.total || 0;
};

export const getTotalExpenses = async (month?: string): Promise<number> => {
    let query = 'SELECT SUM(jumlah) as total FROM pengeluaran';
    let params: any[] = [];
    if (month) {
        query += " WHERE strftime('%m', tanggal) = ?";
        params = [month];
    }
    const result = await db.getFirstAsync(query, params) as { total: number };
    return result?.total || 0;
};

export const getTotalPurchases = async (month?: string): Promise<number> => {
    let query = 'SELECT SUM(total_harga) as total FROM pembelian';
    let params: any[] = [];
    if (month) {
        query += " WHERE strftime('%m', tanggal) = ?";
        params = [month];
    }
    const result = await db.getFirstAsync(query, params) as { total: number };
    return result?.total || 0;
};

export const updateShopSettings = async (s: Partial<ShopSettings>) => {
    const current = await getShopSettings();

    const name = s.name || (current?.name || 'mOTO');
    const address = s.address !== undefined ? s.address : (current?.address || '');
    const phone = s.phone !== undefined ? s.phone : (current?.phone || '');
    const footer_note = s.footer_note !== undefined ? s.footer_note : (current?.footer_note || '');
    const logo_uri = s.logo_uri !== undefined ? s.logo_uri : (current?.logo_uri || '');
    const btype = s.business_type !== undefined ? s.business_type : (current?.business_type || '');

    // Upsert logic for shop_settings
    db.runSync(
        'INSERT OR REPLACE INTO shop_settings (id, name, address, phone, footer_note, logo_uri, business_type) VALUES (1, ?, ?, ?, ?, ?, ?)',
        [name, address || null, phone || null, footer_note || null, logo_uri || null, btype || null]
    );

    // Sync to Cloud asynchronously
    try {
        const { updateStoreSettingsSupa } = require('@/services/supabaseService');
        updateStoreSettingsSupa({
            store_name: name,
            store_address: address,
            store_phone: phone,
            receipt_footer: footer_note,
            business_type: btype
        });
    } catch (e) {}
};

export const getCategories = async (): Promise<KategoriDB[]> => {
    return await db.getAllAsync('SELECT * FROM kategori') as KategoriDB[];
};

export const addCategory = (name: string) => {
    db.runSync('INSERT INTO kategori (nama_kategori) VALUES (?)', [name]);
};

export const deleteCategory = (id: number) => {
    db.runSync('DELETE FROM kategori WHERE id_kategori = ?', [id]);
};

export const getProducts = async (): Promise<BarangDB[]> => {
    return await db.getAllAsync('SELECT * FROM barang') as BarangDB[];
};

export const updateProductStock = (kode_barang: string, newStock: number) => {
    db.runSync('UPDATE barang SET stok = ? WHERE kode_barang = ?', [newStock, kode_barang]);
};

export const addProduct = (p: BarangDB) => {
    db.runSync(
        `INSERT INTO barang (
            kode_barang, barcode, nama_barang, id_kategori, merek, tipe_motor, 
            harga_beli, harga_beli_dus, harga_jual, stok, satuan, lokasi_rak
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            p.kode_barang, p.barcode || null, p.nama_barang, p.id_kategori, p.merek || null, p.tipe_motor || null,
            p.harga_beli || 0, p.harga_beli_dus || 0, p.harga_jual, p.stok, p.satuan || null, p.lokasi_rak || null
        ]
    );
};

export const updateProduct = (p: BarangDB) => {
    db.runSync(
        `UPDATE barang SET 
            barcode = ?, nama_barang = ?, id_kategori = ?, merek = ?, tipe_motor = ?, 
            harga_beli = ?, harga_beli_dus = ?, harga_jual = ?, stok = ?, satuan = ?, lokasi_rak = ?
        WHERE kode_barang = ?`,
        [
            p.barcode || null, p.nama_barang, p.id_kategori, p.merek || null, p.tipe_motor || null,
            p.harga_beli || 0, p.harga_beli_dus || 0, p.harga_jual, p.stok, p.satuan || null, p.lokasi_rak || null,
            p.kode_barang
        ]
    );
};

export const deleteProduct = (kode_barang: string) => {
    db.runSync('DELETE FROM barang WHERE kode_barang = ?', [kode_barang]);
};

export const getTransactions = async (): Promise<TransaksiDB[]> => {
    return await db.getAllAsync('SELECT * FROM transaksi ORDER BY tanggal_transaksi DESC') as TransaksiDB[];
};

export const addTransaction = (t: {
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
    try {
        db.runSync(
            'INSERT INTO transaksi (id_transaksi, tanggal_transaksi, total_harga, payment_method, service_fee, mechanic_id, mechanic_name, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [t.id, t.date, t.total, t.paymentMethod || 'Tunai', t.serviceFee || 0, t.mechanicId || null, t.mechanicName || null, t.notes || null]
        );
        t.items.forEach(item => {
            db.runSync(
                'INSERT INTO detail_transaksi (id_transaksi, kode_barang, nama_barang, jumlah, harga_satuan, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
                [t.id, item.id, item.name, item.quantity, item.price, (item.price * item.quantity)]
            );
        });
    } catch (e) {
        console.error(e);
    }
};

export const verifyUserPin = (pin: string): UserDB | null => {
    const user = db.getFirstSync('SELECT * FROM users WHERE pin = ?', [pin]);
    return user as UserDB | null;
};

export const getUsers = async (): Promise<UserDB[]> => {
    return await db.getAllAsync('SELECT * FROM users') as UserDB[];
};

export const addUser = (name: string, pin: string, role: string, details?: { email?: string, phone?: string, address?: string, status?: string }) => {
    db.runSync(
        'INSERT INTO users (name, pin, role, avatar, email, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, pin, role, `https://ui-avatars.com/api/?name=${name}&background=random`, details?.email || null, details?.phone || null, details?.address || null, details?.status || 'Aktif']
    );
};

export const deleteUser = (id: number) => {
    db.runSync('DELETE FROM users WHERE id = ?', [id]);
};

export const updateUser = (id: number, data: Partial<UserDB>) => {
    // Get current user to merge data
    const current = db.getFirstSync('SELECT * FROM users WHERE id = ?', [id]) as UserDB;
    if (!current) return;

    const name = data.name !== undefined ? data.name : current.name;
    const pin = data.pin !== undefined ? data.pin : current.pin;
    const role = data.role !== undefined ? data.role : current.role;
    const avatar = data.avatar !== undefined ? data.avatar : current.avatar;
    const email = data.email !== undefined ? data.email : current.email;
    const phone = data.phone !== undefined ? data.phone : current.phone;
    const address = data.address !== undefined ? data.address : current.address;
    const status = data.status !== undefined ? data.status : current.status;

    db.runSync(
        'UPDATE users SET name = ?, pin = ?, role = ?, avatar = ?, email = ?, phone = ?, address = ?, status = ? WHERE id = ?',
        [name, pin, role, avatar || null, email || null, phone || null, address || null, status || 'Aktif', id]
    );
};

// --- MECHANICS CRUD ---

export const getMechanics = async (): Promise<MechanicDB[]> => {
    return await db.getAllAsync('SELECT * FROM mechanics') as MechanicDB[];
};

export const addMechanic = (m: Partial<MechanicDB> & { name: string }, isSynced: number = 0) => {
    // Check if exists by name or phone to prevent duplicates during sync
    const existing = db.getFirstSync('SELECT id FROM mechanics WHERE name = ? OR (phone IS NOT NULL AND phone = ?)', [m.name, m.phone || '']);
    if (existing) {
        updateMechanic((existing as any).id, { ...m, is_synced: isSynced });
        return;
    }

    db.runSync(
        'INSERT INTO mechanics (name, avatar, email, phone, address, status, is_synced, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [m.name, m.avatar || null, m.email || null, m.phone || null, m.address || null, m.status || 'Aktif', isSynced, m.updated_at || new Date().toISOString()]
    );
};

export const markMechanicSynced = (id: number) => {
    db.runSync('UPDATE mechanics SET is_synced = 1 WHERE id = ?', [id]);
};

export const getUnsyncedMechanics = async (): Promise<MechanicDB[]> => {
    return await db.getAllAsync('SELECT * FROM mechanics WHERE is_synced = 0 OR is_synced IS NULL') as MechanicDB[];
};

export const clearDuplicateMechanics = () => {
    // Keep only the latest entry for each name/phone combo, delete others
    db.runSync(`
        DELETE FROM mechanics 
        WHERE id NOT IN (
            SELECT MAX(id) 
            FROM mechanics 
            GROUP BY name, phone
        )
    `);
    // Also mark them as synced if they exist in cloud (optional) or just let the user sync once
};

export const updateMechanic = (id: number, m: Partial<MechanicDB>) => {
    // Get current
    const current = db.getFirstSync('SELECT * FROM mechanics WHERE id = ?', [id]) as MechanicDB;
    if (!current) return;

    const name = m.name !== undefined ? m.name : current.name;
    const avatar = m.avatar !== undefined ? m.avatar : current.avatar;
    const email = m.email !== undefined ? m.email : current.email;
    const phone = m.phone !== undefined ? m.phone : current.phone;
    const address = m.address !== undefined ? m.address : current.address;
    const status = m.status !== undefined ? m.status : current.status;
    const isSynced = m.is_synced !== undefined ? m.is_synced : 0;

    db.runSync(
        'UPDATE mechanics SET name = ?, avatar = ?, email = ?, phone = ?, address = ?, status = ?, is_synced = ?, updated_at = ? WHERE id = ?',
        [name, avatar || null, email || null, phone || null, address || null, status || 'Aktif', isSynced, new Date().toISOString(), id]
    );
};

export const deleteMechanic = (id: number) => {
    db.runSync('DELETE FROM mechanics WHERE id = ?', [id]);
};

// ============ ANALYTICS & REPORTS ============

// Get transactions by date range
export const getTransactionsByDateRange = async (startDate: string, endDate: string): Promise<TransaksiDB[]> => {
    return await db.getAllAsync(
        'SELECT * FROM transaksi WHERE DATE(tanggal_transaksi) BETWEEN DATE(?) AND DATE(?) ORDER BY tanggal_transaksi DESC',
        [startDate, endDate]
    ) as TransaksiDB[];
};

// Get transaction details (items)
export const getTransactionDetails = (transactionId: string) => {
    return db.getAllSync(
        'SELECT * FROM detail_transaksi WHERE id_transaksi = ?',
        [transactionId]
    );
};

// Get best selling products (by quantity sold)
export const getBestSellingProducts = async (startDate?: string, endDate?: string, limit: number = 10) => {
    let query = `
        SELECT 
            d.kode_barang,
            d.nama_barang,
            SUM(d.jumlah) as total_sold,
            SUM(d.subtotal) as total_revenue,
            b.stok as current_stock
        FROM detail_transaksi d
        LEFT JOIN barang b ON d.kode_barang = b.kode_barang
        LEFT JOIN transaksi t ON d.id_transaksi = t.id_transaksi
    `;

    const params: any[] = [];
    if (startDate && endDate) {
        query += ' WHERE DATE(t.tanggal_transaksi) BETWEEN DATE(?) AND DATE(?)';
        params.push(startDate, endDate);
    }

    query += ` GROUP BY d.kode_barang ORDER BY total_sold DESC LIMIT ?`;
    params.push(limit);

    return await db.getAllAsync(query, params);
};

// Get slow moving products (low sales)
export const getSlowMovingProducts = async (startDate?: string, endDate?: string, maxSold: number = 5, limit: number = 10) => {
    let query = `
        SELECT 
            b.kode_barang,
            b.nama_barang,
            b.stok,
            COALESCE(SUM(d.jumlah), 0) as total_sold
        FROM barang b
        LEFT JOIN detail_transaksi d ON b.kode_barang = d.kode_barang
        LEFT JOIN transaksi t ON d.id_transaksi = t.id_transaksi
    `;

    const params: any[] = [];
    if (startDate && endDate) {
        query += ' WHERE DATE(t.tanggal_transaksi) BETWEEN DATE(?) AND DATE(?) OR d.id_transaksi IS NULL';
        params.push(startDate, endDate);
    }

    query += ` GROUP BY b.kode_barang HAVING total_sold <= ? ORDER BY total_sold ASC LIMIT ?`;
    params.push(maxSold, limit);

    return await db.getAllAsync(query, params);
};

// Get low stock products
export const getLowStockProducts = async (threshold: number = 10) => {
    return await db.getAllAsync(
        'SELECT * FROM barang WHERE stok <= ? AND stok > 0 ORDER BY stok ASC',
        [threshold]
    );
};

// Get sales summary for a period
export const getSalesSummary = async (startDate?: string, endDate?: string) => {
    let query = 'SELECT COUNT(*) as total_transactions, SUM(total_harga) as total_revenue FROM transaksi';
    const params: any[] = [];

    if (startDate && endDate) {
        query += ' WHERE DATE(tanggal_transaksi) BETWEEN DATE(?) AND DATE(?)';
        params.push(startDate, endDate);
    }

    return await db.getFirstAsync(query, params);
};

// --- KEUANGAN & PEMBUKUAN (FINANCIALS) ---

export const addPengeluaran = async (kategori: string, jumlah: number, keterangan: string) => {
    return new Promise<void>((resolve, reject) => {
        try {
            db.runSync('INSERT INTO pengeluaran (kategori, jumlah, keterangan) VALUES (?, ?, ?)', [kategori, jumlah, keterangan]);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

export const getPengeluaran = async (startDate?: string, endDate?: string) => {
    if (startDate && endDate) {
        return db.getAllSync('SELECT * FROM pengeluaran WHERE date(tanggal) BETWEEN date(?) AND date(?) ORDER BY tanggal DESC', [startDate, endDate]);
    }
    return db.getAllSync('SELECT * FROM pengeluaran ORDER BY tanggal DESC');
};

export const addPembelian = async (id_pembelian: string, supplier: string, total_harga: number, items: any[]) => {
    return new Promise<void>((resolve, reject) => {
        try {
            db.withTransactionSync(() => {
                db.runSync('INSERT INTO pembelian (id, supplier, total_harga) VALUES (?, ?, ?)', [id_pembelian, supplier, total_harga]);
                
                for (const item of items) {
                    db.runSync('INSERT INTO detail_pembelian (id_pembelian, kode_barang, nama_barang, jumlah, harga_satuan, subtotal) VALUES (?, ?, ?, ?, ?, ?)', [
                        id_pembelian, item.kode_barang, item.nama_barang, item.jumlah, item.harga_satuan, item.subtotal
                    ]);
                    
                    // Auto update the stock based on the purchase
                    db.runSync('UPDATE barang SET stok = stok + ?, harga_beli = ? WHERE kode_barang = ?', [
                        item.jumlah, item.harga_satuan, item.kode_barang
                    ]);
                }
            });
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

export const getPembelian = async (startDate?: string, endDate?: string) => {
    if (startDate && endDate) {
        return db.getAllSync('SELECT * FROM pembelian WHERE date(tanggal) BETWEEN date(?) AND date(?) ORDER BY tanggal DESC', [startDate, endDate]);
    }
    return db.getAllSync('SELECT * FROM pembelian ORDER BY tanggal DESC');
};

export const getKeuanganSummary = async (startDate: string, endDate: string) => {
    const revenue = db.getFirstSync<{total: number}>("SELECT SUM(total_harga) as total FROM transaksi WHERE date(tanggal_transaksi) BETWEEN date(?) AND date(?)", [startDate, endDate]);
    const expenses = db.getFirstSync<{total: number}>("SELECT SUM(jumlah) as total FROM pengeluaran WHERE date(tanggal) BETWEEN date(?) AND date(?)", [startDate, endDate]);
    const purchases = db.getFirstSync<{total: number}>("SELECT SUM(total_harga) as total FROM pembelian WHERE date(tanggal) BETWEEN date(?) AND date(?)", [startDate, endDate]);

    const totalRevenue = revenue?.total || 0;
    const pengeluaranOperasional = expenses?.total || 0;
    const pembelanjaanStok = purchases?.total || 0;
    
    return {
        totalRevenue,
        pengeluaranOperasional,
        pembelanjaanStok,
        totalKeluar: pengeluaranOperasional + pembelanjaanStok,
        saldoBersih: totalRevenue - (pengeluaranOperasional + pembelanjaanStok)
    };
};
