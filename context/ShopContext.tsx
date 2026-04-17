import { 
    BarangDB, 
    getCategories as getLocalCategories, 
    getProducts as getLocalProducts, 
    getTransactions as getLocalTransactions,
    getShopSettings,
    ShopSettings,
    getFinancialStats,
    FinancialStats,
    addTransaction as dbAddTransaction,
    searchProducts as dbSearchProducts
} from '@/database/db';
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

export interface Product {
    id: string; 
    barcode?: string;
    name: string; 
    stock: number;
    price: number; 
    buyPrice?: number; 
    buyPriceBox?: number; 
    category: string;
    categoryId: number;
    rack?: string; 
    brand?: string; 
    motorType?: string; 
    unit?: string; 
    image: string;
}

export interface Category {
    id: number;
    name: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Transaction {
    id: string;
    date: string;
    items: CartItem[];
    total: number;
    paymentMethod: string;
    serviceFee: number;
    mechanicId?: number;
    mechanicName?: string;
    notes?: string;
}

interface ShopContextType {
    products: Product[];
    categories: Category[];
    transactions: Transaction[];
    cart: CartItem[];
    shopInfo: ShopSettings | null;
    paymentMethod: string;
    serviceFee: number;
    mechanicId: number | null;
    mechanicName: string;
    notes: string;
    stats: FinancialStats | null;
    isSyncing: boolean;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    checkout: () => Promise<void>;
    refreshData: () => Promise<void>;
    searchInWarehouse: (query: string, categoryId?: number, lowStockOnly?: boolean) => Promise<Product[]>;
    setPaymentMethod: (method: string) => void;
    setServiceFee: (fee: number) => void;
    setMechanicId: (id: number | null) => void;
    setMechanicName: (name: string) => void;
    setNotes: (notes: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethodState] = useState<string>('Tunai');
    const [serviceFee, setServiceFeeState] = useState<number>(0);
    const [mechanicId, setMechanicId] = useState<number | null>(null);
    const [mechanicName, setMechanicName] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [shopInfo, setShopInfo] = useState<ShopSettings | null>(null);
    const [stats, setStats] = useState<FinancialStats | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [info, localCats, localProducts, localTransactions, periodStats] = await Promise.all([
                getShopSettings(),
                getLocalCategories(),
                getLocalProducts(200),
                getLocalTransactions(20),
                getFinancialStats(new Date().toISOString().substring(0, 7))
            ]);

            setShopInfo(info as ShopSettings | null);
            const cats: Category[] = localCats.map((c: any) => ({ id: c.id_kategori, name: c.nama_kategori }));
            setCategories(cats);
            
            setProducts(localProducts.map((p: any) => mapToProduct(p as BarangDB, cats)));
            setTransactions(localTransactions.map((t: any) => ({
                id: t.id_transaksi, date: t.tanggal_transaksi, total: t.total_harga,
                items: [], paymentMethod: t.payment_method || 'Tunai', serviceFee: t.service_fee || 0,
                mechanicId: t.mechanic_id, mechanicName: t.mechanic_name, notes: t.notes
            })));
            setStats(periodStats[0] as FinancialStats || null);

        } catch (e) {
            console.error("❌ Data load failure:", e);
        }
    };

    const mapToProduct = (p: BarangDB, cats: Category[]): Product => ({
        id: p.kode_barang, barcode: p.barcode, name: p.nama_barang, stock: p.stok,
        price: p.harga_jual, buyPrice: p.harga_beli, buyPriceBox: p.harga_beli_dus,
        categoryId: p.id_kategori, category: (cats.find(c => c.id === p.id_kategori)?.name || 'Umum'),
        rack: p.lokasi_rak, brand: p.merek, motorType: p.tipe_motor, unit: p.satuan,
        image: 'https://placehold.co/200?text=' + encodeURIComponent(p.nama_barang.substring(0, 4))
    });

    /**
     * 🏎️ PRO Search Engine Accessor
     */
    const searchInWarehouse = async (query: string, cid?: number, lowStock?: boolean) => {
        const results = await dbSearchProducts({ query, categoryId: cid, lowStockOnly: lowStock, limit: 100 });
        return results.map(p => mapToProduct(p, categories));
    };

    const checkout = async () => {
        if (cart.length === 0) return;
        const trxId = 'TRX-' + Date.now();
        const date = new Date().toISOString();
        try {
            await dbAddTransaction({ id: trxId, date, total: cart.reduce((s, i) => s + (i.price * i.quantity), 0) + serviceFee, items: cart, paymentMethod, serviceFee, mechanicId, mechanicName, notes });
            setCart([]); setPaymentMethodState('Tunai'); setServiceFeeState(0); setMechanicId(null); setMechanicName(''); setNotes('');
            await loadData();
        } catch (error) { throw error; }
    };

    const value = useMemo(() => ({
        products, categories, cart, transactions, shopInfo, paymentMethod, serviceFee, mechanicId, mechanicName, notes, stats, isSyncing: false,
        addToCart: (p: Product) => setCart(prev => {
            const ex = prev.find(i => i.id === p.id);
            if (ex) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { ...p, quantity: 1 }];
        }),
        removeFromCart: (pid: string) => setCart(prev => prev.filter(i => i.id !== pid)),
        updateCartQuantity: (pid: string, qty: number) => setCart(prev => prev.map(i => i.id === pid ? { ...i, quantity: Math.max(1, qty) } : i)),
        checkout, refreshData: loadData, searchInWarehouse,
        setPaymentMethod: setPaymentMethodState, setServiceFee: setServiceFeeState, setMechanicId, setMechanicName, setNotes
    }), [products, categories, cart, transactions, shopInfo, paymentMethod, serviceFee, mechanicId, mechanicName, notes, stats]);

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) throw new Error('useShop must be used within a ShopProvider');
    return context;
};
