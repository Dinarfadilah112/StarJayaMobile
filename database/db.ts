import * as SQLite from 'expo-sqlite';

const DB_NAME = 'starjaya_internal.db'; // Nama file DB baru

// Buka Database
const db = SQLite.openDatabaseSync(DB_NAME);

export interface BarangDB {
    kode_barang: string;
    nama_barang: string;
    stok: number;
    harga_jual: number;
    id_kategori: number;
}

export interface TransaksiDB {
    id_transaksi: string;
    tanggal_transaksi: string;
    total_harga: number;
}

// Inisialisasi: Buat Tabel & Seed Data
export const initDatabase = () => {
    try {
        // 1. Buat Tabel Produk (Barang)
        db.execSync(`
      CREATE TABLE IF NOT EXISTS barang (
        kode_barang TEXT PRIMARY KEY NOT NULL,
        nama_barang TEXT NOT NULL,
        stok INTEGER NOT NULL DEFAULT 0,
        harga_jual INTEGER NOT NULL DEFAULT 0,
        id_kategori INTEGER DEFAULT 0
      );
    `);

        // 2. Buat Tabel Transaksi
        db.execSync(`
      CREATE TABLE IF NOT EXISTS transaksi (
        id_transaksi TEXT PRIMARY KEY NOT NULL,
        tanggal_transaksi TEXT NOT NULL,
        total_harga INTEGER NOT NULL,
        status_lunas TEXT DEFAULT 'Lunas'
      );
    `);

        // 3. Buat Tabel Detail Transaksi
        db.execSync(`
      CREATE TABLE IF NOT EXISTS detail_transaksi (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_transaksi TEXT NOT NULL,
        kode_barang TEXT NOT NULL,
        nama_barang TEXT NOT NULL,
        jumlah INTEGER NOT NULL,
        harga_satuan INTEGER NOT NULL,
        subtotal INTEGER NOT NULL,
        FOREIGN KEY(id_transaksi) REFERENCES transaksi(id_transaksi)
      );
    `);

        console.log('Database tables initialized.');

        // 4. Cek Data Awal (Seed)
        const result = db.getFirstSync('SELECT count(*) as count FROM barang') as { count: number };
        if (result.count === 0) {
            console.log("Seeding initial data...");
            seedDatabase();
        }

    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

const seedDatabase = () => {
    const INITIAL_PRODUCTS = [
        { id: 'OLI001', name: 'Oli Mesin MPX1', stock: 24, price: 55000, cat: 1 },
        { id: 'PART001', name: 'Kampas Rem Depan Beat', stock: 15, price: 45000, cat: 2 },
        { id: 'SRV001', name: 'Jasa Service Ringan', stock: 999, price: 60000, cat: 3 }, // Kategori 3 = Service
        { id: 'BAN001', name: 'Ban Luar IRC 90/90', stock: 8, price: 230000, cat: 2 },
        { id: 'PART002', name: 'Filter Udara Vario', stock: 4, price: 85000, cat: 2 },
        { id: 'OLI002', name: 'Oli Gardan Honda', stock: 30, price: 15000, cat: 1 },
    ];

    try {
        INITIAL_PRODUCTS.forEach(p => {
            db.runSync(
                'INSERT INTO barang (kode_barang, nama_barang, stok, harga_jual, id_kategori) VALUES (?, ?, ?, ?, ?)',
                [p.id, p.name, p.stock, p.price, p.cat]
            );
        });
        console.log('Data seeded successfully!');
    } catch (e) {
        console.error("Error seeding data:", e);
    }
};

// --- CRUD Helpers --- //

export const getProducts = (): BarangDB[] => {
    return db.getAllSync('SELECT * FROM barang') as BarangDB[];
};

export const updateProductStock = (kode_barang: string, newStock: number) => {
    db.runSync('UPDATE barang SET stok = ? WHERE kode_barang = ?', [newStock, kode_barang]);
};

export const getTransactions = (): TransaksiDB[] => {
    return db.getAllSync('SELECT * FROM transaksi ORDER BY tanggal_transaksi DESC') as TransaksiDB[];
};

export const addTransaction = (t: { id: string, date: string, total: number, items: any[] }) => {
    try {
        // Insert Header
        db.runSync(
            'INSERT INTO transaksi (id_transaksi, tanggal_transaksi, total_harga, status_lunas) VALUES (?, ?, ?, ?)',
            [t.id, t.date, t.total, 'Lunas']
        );

        // Insert Detail
        t.items.forEach(item => {
            db.runSync(
                'INSERT INTO detail_transaksi (id_transaksi, kode_barang, nama_barang, jumlah, harga_satuan, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
                [t.id, item.id, item.name, item.quantity, item.price, (item.price * item.quantity)]
            );
        });
    } catch (e) {
        console.error("Error saving transaction:", e);
    }
};

export const addProduct = (p: { id: string, name: string, stock: number, price: number }) => {
    try {
        db.runSync(
            'INSERT INTO barang (kode_barang, nama_barang, stok, harga_jual, id_kategori) VALUES (?, ?, ?, ?, ?)',
            [p.id, p.name, p.stock, p.price, 2] // Default kategori 2 (Sparepart)
        );
    } catch (e) {
        console.error("Error adding product:", e);
    }
};
