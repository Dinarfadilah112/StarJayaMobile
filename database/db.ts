import * as SQLite from 'expo-sqlite';

const DB_NAME = 'starjaya_internal.db';

// 🛡️ Safe Singleton Database Handle
let _db: SQLite.SQLiteDatabase | null = null;

export const getDB = (): SQLite.SQLiteDatabase => {
    if (!_db) {
        _db = SQLite.openDatabaseSync(DB_NAME);
        try { 
            _db.execSync('PRAGMA busy_timeout = 5000'); 
            _db.execSync('PRAGMA journal_mode = WAL');
            _db.execSync('PRAGMA synchronous = NORMAL');
        } catch (e) {}
    }
    return _db;
};

// --- Interfaces ---
export interface BarangDB {
    kode_barang: string;
    nama_barang: string;
    stok: number;
    harga_jual: number;
    id_kategori: number;
    barcode?: string;
    merek?: string;
    tipe_motor?: string;
    satuan?: string;
    harga_beli?: number;
    harga_beli_dus?: number;
    lokasi_rak?: string;
}

export interface KategoriDB {
    id_kategori: number;
    nama_kategori: string;
}

export interface MechanicDB {
    id: number;
    name: string;
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

export interface DetailTransaksiDB {
    id_transaksi: string;
    kode_barang: string;
    nama_barang: string;
    jumlah: number;
    harga_jual: number;
    subtotal: number;
    harga_beli?: number;
}

export interface FinancialStats {
    period: string; 
    revenue: number;
    expense: number;
    purchase: number;
    capital: number; 
    profit: number;  
}

export interface ShopSettings {
    name: string;
    address?: string;
    phone?: string;
    footer_note?: string;
    logo_uri?: string;
    business_type?: string;
    receipt_font_size?: number;
    receipt_color?: string;
    paper_size?: '58mm' | '80mm';
}

// --- Initialization & Migrations ---
let initPromise: Promise<void> | null = null;
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const initDatabase = async (retries = 3): Promise<void> => {
    if (initPromise) return initPromise;
    initPromise = (async () => {
        let attempt = 0;
        while (attempt < retries) {
            try {
                const db = getDB();
                await db.withTransactionAsync(async () => {
                    // Core Tables
                    db.execSync(`CREATE TABLE IF NOT EXISTS kategori (id_kategori INTEGER PRIMARY KEY AUTOINCREMENT, nama_kategori TEXT NOT NULL);`);
                    db.execSync(`CREATE TABLE IF NOT EXISTS barang (kode_barang TEXT PRIMARY KEY NOT NULL, nama_barang TEXT NOT NULL, id_kategori INTEGER DEFAULT 0, harga_jual INTEGER NOT NULL DEFAULT 0, stok INTEGER NOT NULL DEFAULT 0);`);
                    ['barcode', 'merek', 'tipe_motor', 'satuan', 'harga_beli', 'harga_beli_dus', 'lokasi_rak'].forEach(col => { try { db.execSync(`ALTER TABLE barang ADD COLUMN ${col} TEXT`); } catch (e) {} });
                    
                    db.execSync(`CREATE TABLE IF NOT EXISTS transaksi (id_transaksi TEXT PRIMARY KEY NOT NULL, tanggal_transaksi TEXT DEFAULT CURRENT_TIMESTAMP, total_harga INTEGER NOT NULL);`);
                    ['payment_method', 'service_fee', 'mechanic_id', 'mechanic_name', 'notes', 'is_synced'].forEach(col => { try { db.execSync(`ALTER TABLE transaksi ADD COLUMN ${col} TEXT`); } catch (e) {} });
                    
                    db.execSync(`CREATE TABLE IF NOT EXISTS detail_transaksi (id_transaksi TEXT, kode_barang TEXT, nama_barang TEXT, jumlah INTEGER, harga_jual INTEGER, subtotal INTEGER, harga_beli INTEGER DEFAULT 0);`);
                    db.execSync(`CREATE TABLE IF NOT EXISTS mechanics (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);`);
                    db.execSync(`CREATE TABLE IF NOT EXISTS shop_settings (id INTEGER PRIMARY KEY CHECK (id = 1), name TEXT NOT NULL);`);
                    ['address', 'phone', 'footer_note', 'logo_uri', 'business_type', 'receipt_font_size', 'receipt_color', 'paper_size', 'is_synced'].forEach(col => { try { db.execSync(`ALTER TABLE shop_settings ADD COLUMN ${col} TEXT`); } catch (e) {} });

                    db.execSync(`CREATE TABLE IF NOT EXISTS pengeluaran (id INTEGER PRIMARY KEY AUTOINCREMENT, tanggal TEXT DEFAULT CURRENT_TIMESTAMP, kategori TEXT, jumlah INTEGER, keterangan TEXT, is_synced INTEGER DEFAULT 0);`);
                    db.execSync(`CREATE TABLE IF NOT EXISTS pembelian (id TEXT PRIMARY KEY, tanggal TEXT DEFAULT CURRENT_TIMESTAMP, supplier TEXT, total_harga INTEGER, is_synced INTEGER DEFAULT 0);`);
                    db.execSync(`CREATE TABLE IF NOT EXISTS detail_pembelian (id_pembelian TEXT, kode_barang TEXT, nama_barang TEXT, jumlah INTEGER, harga_beli INTEGER, subtotal INTEGER);`);
                    db.execSync(`CREATE TABLE IF NOT EXISTS financial_stats (period TEXT PRIMARY KEY, revenue INTEGER DEFAULT 0, expense INTEGER DEFAULT 0, purchase INTEGER DEFAULT 0, capital INTEGER DEFAULT 0, profit INTEGER DEFAULT 0);`);

                    // 🏎️ PRO PERFORMANCE INDEXES
                    // Make search by name and code ultra fast (for warehouses with 10k+ items)
                    db.execSync(`CREATE INDEX IF NOT EXISTS idx_barang_nama ON barang(nama_barang);`);
                    db.execSync(`CREATE INDEX IF NOT EXISTS idx_barang_kode ON barang(kode_barang);`);
                    db.execSync(`CREATE INDEX IF NOT EXISTS idx_transaksi_tanggal ON transaksi(tanggal_transaksi DESC);`);
                });
                return;
            } catch (error) {
                attempt++;
                if (attempt < retries) { await delay(500 * attempt); continue; }
                throw error;
            }
        }
    })();
    return initPromise;
};

// --- Financial Aggregator Logic ---
const updateFinancialStats = async (db: SQLite.SQLiteDatabase, period: string, updates: Partial<Omit<FinancialStats, 'period' | 'profit'>>) => {
    await db.runAsync(`INSERT OR IGNORE INTO financial_stats (period) VALUES (?)`, [period]);
    const setClause = Object.keys(updates).map(k => `${k} = ${k} + ?`).join(', ');
    const values = Object.values(updates);
    await db.runAsync(`UPDATE financial_stats SET ${setClause} WHERE period = ?`, [...values, period]);
    await db.runAsync(`UPDATE financial_stats SET profit = revenue - capital - expense WHERE period = ?`, [period]);
};

// --- PRO ENGINE SEARCH & QUERIES ---

/**
 * 🏎️ High Performance Product Search (Database-side)
 * Supports pagination, category filtering, and low stock filtering.
 */
export const searchProducts = async (options: { 
    query?: string, 
    categoryId?: number, 
    lowStockOnly?: boolean, 
    limit?: number, 
    offset?: number 
}): Promise<BarangDB[]> => {
    const db = getDB();
    const { query, categoryId, lowStockOnly, limit = 50, offset = 0 } = options;
    
    let sql = 'SELECT * FROM barang WHERE 1=1';
    const params: any[] = [];

    if (query) {
        // Use LIKE for fuzzy search on name, barcode, and code
        sql += ' AND (nama_barang LIKE ? OR kode_barang LIKE ? OR barcode LIKE ?)';
        const fuzzy = `%${query}%`;
        params.push(fuzzy, fuzzy, fuzzy);
    }

    if (categoryId && categoryId !== 0) {
        sql += ' AND id_kategori = ?';
        params.push(categoryId);
    }

    if (lowStockOnly) {
        sql += ' AND stok <= 5';
    }

    sql += ' ORDER BY nama_barang ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await db.getAllAsync(sql, params) as BarangDB[];
};

export const addTransaction = async (t: any) => {
    const db = getDB();
    const date = t.date || new Date().toISOString();
    const period = date.substring(0, 7);
    const totalRev = t.total;

    await db.withTransactionAsync(async () => {
        await db.runAsync(
            'INSERT INTO transaksi (id_transaksi, tanggal_transaksi, total_harga, payment_method, service_fee, mechanic_id, mechanic_name, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [t.id, date, totalRev, t.paymentMethod || 'Tunai', t.serviceFee || 0, t.mechanicId || null, t.mechanicName || null, t.notes || null]
        );

        let totalCapital = 0;
        for (const item of t.items) {
            const p = await db.getFirstAsync('SELECT harga_beli FROM barang WHERE kode_barang = ?', [item.id]) as { harga_beli: number };
            const buyPrice = p?.harga_beli || 0;
            totalCapital += (buyPrice * item.quantity);

            await db.runAsync('INSERT INTO detail_transaksi (id_transaksi, kode_barang, nama_barang, jumlah, harga_jual, subtotal, harga_beli) VALUES (?, ?, ?, ?, ?, ?, ?)', [t.id, item.id, item.name, item.quantity, item.price, item.price * item.quantity, buyPrice]);
            await db.runAsync('UPDATE barang SET stok = stok - ? WHERE kode_barang = ?', [item.quantity, item.id]);
        }
        await updateFinancialStats(db, period, { revenue: totalRev, capital: totalCapital });
    });
};

export const addExpense = async (e: any) => {
    const db = getDB();
    const date = e.date || new Date().toISOString();
    const period = date.substring(0, 7);
    await db.withTransactionAsync(async () => {
        await db.runAsync('INSERT INTO pengeluaran (kategori, jumlah, keterangan, tanggal) VALUES (?, ?, ?, ?)', [e.kategori, e.jumlah, e.keterangan, date]);
        await updateFinancialStats(db, period, { expense: e.jumlah });
    });
};

export const addPurchase = async (p: any) => {
    const db = getDB();
    const date = p.date || new Date().toISOString();
    const period = date.substring(0, 7);
    const total = p.items.reduce((s: any, i: any) => s + (i.harga_beli * i.jumlah), 0);
    await db.withTransactionAsync(async () => {
        await db.runAsync('INSERT INTO pembelian (id, supplier, total_harga, tanggal) VALUES (?, ?, ?, ?)', [p.id, p.supplier, total, date]);
        for (const item of p.items) {
            await db.runAsync('INSERT INTO detail_pembelian (id_pembelian, kode_barang, nama_barang, jumlah, harga_beli, subtotal) VALUES (?, ?, ?, ?, ?, ?)', [p.id, item.kode_barang, item.nama_barang, item.jumlah, item.harga_beli, item.harga_beli * item.jumlah]);
            await db.runAsync('UPDATE barang SET stok = stok + ?, harga_beli = ? WHERE kode_barang = ?', [item.jumlah, item.harga_beli, item.kode_barang]);
        }
        await updateFinancialStats(db, period, { purchase: total });
    });
};

// --- Getters ---
export const getFinancialStats = (period?: string) => getDB().getAllAsync(period ? 'SELECT * FROM financial_stats WHERE period = ?' : 'SELECT * FROM financial_stats ORDER BY period DESC', period ? [period] : []);
export const getTransactions = (limit = 20) => getDB().getAllAsync('SELECT * FROM transaksi ORDER BY tanggal_transaksi DESC LIMIT ?', [limit]);
export const getTransactionDetails = (txId: string) => getDB().getAllAsync('SELECT * FROM detail_transaksi WHERE id_transaksi = ?', [txId]);
export const getProducts = (limit = 200) => getDB().getAllAsync('SELECT * FROM barang ORDER BY nama_barang LIMIT ?', [limit]);
export const getMechanics = () => getDB().getAllAsync('SELECT * FROM mechanics ORDER BY name');
export const getCategories = () => getDB().getAllAsync('SELECT * FROM kategori ORDER BY nama_kategori');
export const getShopSettings = () => getDB().getFirstAsync('SELECT * FROM shop_settings WHERE id = 1');

export const getPengeluaran = async (startDate: string, endDate: string) => {
    return await getDB().getAllAsync('SELECT * FROM pengeluaran WHERE tanggal >= ? AND tanggal <= ? ORDER BY tanggal DESC', [startDate, endDate]);
};

export const getPembelian = async (startDate: string, endDate: string) => {
    return await getDB().getAllAsync('SELECT * FROM pembelian WHERE tanggal >= ? AND tanggal <= ? ORDER BY tanggal DESC', [startDate, endDate]);
};

export const getKeuanganSummary = async (startDate: string, endDate: string) => {
    const db = getDB();
    const pemasukan = await db.getAllAsync('SELECT SUM(total_harga) as total FROM transaksi WHERE tanggal_transaksi >= ? AND tanggal_transaksi <= ?', [startDate, endDate]) as { total: number }[];
    const pengeluaran = await db.getAllAsync('SELECT SUM(jumlah) as total FROM pengeluaran WHERE tanggal >= ? AND tanggal <= ?', [startDate, endDate]) as { total: number }[];
    const pembelian = await db.getAllAsync('SELECT SUM(total_harga) as total FROM pembelian WHERE tanggal >= ? AND tanggal <= ?', [startDate, endDate]) as { total: number }[];
    
    const revenue = pemasukan[0]?.total || 0;
    const ops = pengeluaran[0]?.total || 0;
    const pur = pembelian[0]?.total || 0;
    
    return {
        totalRevenue: revenue,
        totalKeluar: ops + pur,
        saldoBersih: revenue - (ops + pur)
    };
};

// --- Standard Mutations ---
export const addKategori = (nama: string) => getDB().runSync('INSERT INTO kategori (nama_kategori) VALUES (?)', [nama]);
export const deleteKategori = (id: number) => getDB().runSync('DELETE FROM kategori WHERE id_kategori=?', [id]);
export const addMechanic = (name: string) => getDB().runSync('INSERT INTO mechanics (name) VALUES (?)', [name]);
export const addBarang = (b: Partial<BarangDB>) => getDB().runSync('INSERT INTO barang (kode_barang, nama_barang, id_kategori, harga_jual, stok, barcode, merek, tipe_motor, satuan, harga_beli, harga_beli_dus, lokasi_rak) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [b.kode_barang ?? '', b.nama_barang ?? '', b.id_kategori ?? 0, b.harga_jual ?? 0, b.stok ?? 0, b.barcode ?? null, b.merek ?? null, b.tipe_motor ?? null, b.satuan ?? null, b.harga_beli ?? 0, b.harga_beli_dus ?? 0, b.lokasi_rak ?? null]);
export const updateBarang = (b: Partial<BarangDB>) => getDB().runSync('UPDATE barang SET nama_barang=?, id_kategori=?, harga_jual=?, stok=?, barcode=?, merek=?, tipe_motor=?, satuan=?, harga_beli=?, harga_beli_dus=?, lokasi_rak=? WHERE kode_barang=?', [b.nama_barang ?? '', b.id_kategori ?? 0, b.harga_jual ?? 0, b.stok ?? 0, b.barcode ?? null, b.merek ?? null, b.tipe_motor ?? null, b.satuan ?? null, b.harga_beli ?? 0, b.harga_beli_dus ?? 0, b.lokasi_rak ?? null, b.kode_barang ?? '']);
export const deleteBarang = (kode: string) => getDB().runSync('DELETE FROM barang WHERE kode_barang=?', [kode]);
export const clearAllData = async () => { const db = getDB(); ['detail_transaksi', 'transaksi', 'barang', 'mechanics', 'kategori', 'shop_settings', 'pengeluaran', 'pembelian', 'detail_pembelian', 'financial_stats'].forEach(t => { try { db.execSync(`DELETE FROM ${t}`); } catch (e) {} }); };
export const updateShopSettings = async (s: any) => { const db = getDB(); const c = await getShopSettings() as any; db.runSync('INSERT OR REPLACE INTO shop_settings (id, name, address, phone, footer_note, logo_uri, business_type, receipt_font_size, receipt_color, paper_size) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [s.name || c?.name || 'mOTO', s.address ?? c?.address ?? null, s.phone ?? c?.phone ?? null, s.footer_note ?? c?.footer_note ?? null, s.logo_uri ?? c?.logo_uri ?? null, s.business_type ?? c?.business_type ?? null, s.receipt_font_size ?? c?.receipt_font_size ?? 11, s.receipt_color ?? c?.receipt_color ?? '#000000', s.paper_size ?? c?.paper_size ?? '58mm']); };

// Consistency Aliases
export const addProduct = addBarang;
export const updateProduct = updateBarang;
export const deleteProduct = deleteBarang;
export const addCategory = addKategori;
export const deleteCategory = deleteKategori;
