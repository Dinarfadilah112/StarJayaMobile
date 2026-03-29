import { 
    BarangDB, 
    getCategories as getLocalCategories, 
    getProducts as getLocalProducts, 
    getTransactions as getLocalTransactions,
    getShopSettings,
    ShopSettings,
    getTotalRevenue,
    getTotalExpenses,
    getTotalPurchases
} from '@/database/db';
import {
    addCategorySupa as addCategoryToDB,
    addProductSupa as addProductToDB,
    addTransactionSupa as addTransaction,
    deleteCategorySupa as deleteCategoryToDB,
    deleteProductSupa as deleteProductInDB,
    getCategoriesSupa as getCategories,
    getProductsSupa as getProducts,
    getTransactionsSupa as getTransactions,
    updateProductSupa as updateProductInDB,
} from '@/services/supabaseService';
import React, { createContext, useContext, useEffect, useState } from 'react';

// ... imports

export interface Product {
    id: string; // kode_barang
    barcode?: string;
    name: string; // nama_barang
    stock: number;
    price: number; // harga_jual
    buyPrice?: number; // harga_beli
    buyPriceBox?: number; // harga_beli_dus
    category: string;
    categoryId: number;
    rack?: string; // lokasi_rak
    brand?: string; // merek
    motorType?: string; // tipe_motor
    unit?: string; // satuan
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
    stats: {
        totalRevenue: number;
        totalExpenses: number;
        totalPurchases: number;
        monthlyRevenue: number;
        monthlyExpenses: number;
        monthlyPurchases: number;
    };
    isSyncing: boolean;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    checkout: () => Promise<void>;
    addProduct: (product: Product) => void;
    updateProductData: (product: Product) => void;
    deleteProductData: (productId: string) => void;
    addNewCategory: (name: string) => void;
    removeCategory: (id: number) => void;
    updateStock: (productId: string, amount: number) => void;
    refreshData: () => void;
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
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [shopInfo, setShopInfo] = useState<ShopSettings | null>(null);

    // Financial Stats
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        totalPurchases: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        monthlyPurchases: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const info = await getShopSettings();
            setShopInfo(info);

            // Fetch Stats
            const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
            const totalRev = await getTotalRevenue();
            const totalExp = await getTotalExpenses();
            const totalPur = await getTotalPurchases();
            const monthRev = await getTotalRevenue(currentMonth);
            const monthExp = await getTotalExpenses(currentMonth);
            const monthPur = await getTotalPurchases(currentMonth);

            setStats({
                totalRevenue: totalRev,
                totalExpenses: totalExp,
                totalPurchases: totalPur,
                monthlyRevenue: monthRev,
                monthlyExpenses: monthExp,
                monthlyPurchases: monthPur,
            });

            // --- OFFLINE FIRST: Load from Local DB instantly ---
            const localCats = await getLocalCategories();
            const localProducts = await getLocalProducts();
            const localTransactions = await getLocalTransactions();

            const cats: Category[] = localCats.map(c => ({ id: c.id_kategori, name: c.nama_kategori }));
            setCategories(cats);

            const mappedLocalProducts: Product[] = localProducts.map((p) => {
                const catObj = cats.find(c => c.id === p.id_kategori);
                return {
                    id: p.kode_barang,
                    barcode: p.barcode,
                    name: p.nama_barang,
                    stock: p.stok,
                    price: p.harga_jual,
                    buyPrice: p.harga_beli,
                    buyPriceBox: p.harga_beli_dus,
                    categoryId: p.id_kategori,
                    category: catObj ? catObj.name : 'Umum',
                    rack: p.lokasi_rak,
                    brand: p.merek,
                    motorType: p.tipe_motor,
                    unit: p.satuan,
                    image: 'https://placehold.co/200?text=' + encodeURIComponent(p.nama_barang.substring(0, 4))
                };
            });
            setProducts(mappedLocalProducts);

            setTransactions(localTransactions.map(t => ({
                id: t.id_transaksi,
                date: t.tanggal_transaksi,
                total: t.total_harga,
                items: [],
                paymentMethod: t.payment_method || 'Tunai',
                serviceFee: t.service_fee || 0,
                mechanicId: t.mechanic_id,
                mechanicName: t.mechanic_name,
                notes: t.notes
            })));

            // --- BACKGROUND SYNC: Fetch from Supabase ---
            console.log("☁️ Syncing with cloud...");
            setIsSyncing(true);
            
            // 1. Sync Categories
            const dbCats = await getCategories();
            const freshCats: Category[] = dbCats.map(c => ({ id: c.id_kategori, name: c.nama_kategori }));
            setCategories(freshCats);

            // 2. Sync Products
            const dbProducts = await getProducts(); 
            const mappedFreshProducts: Product[] = dbProducts.map((p) => {
                const catObj = freshCats.find(c => c.id === p.id_kategori);
                return {
                    id: p.kode_barang,
                    barcode: p.barcode,
                    name: p.nama_barang,
                    stock: p.stok,
                    price: p.harga_jual,
                    buyPrice: p.harga_beli,
                    buyPriceBox: p.harga_beli_dus,
                    categoryId: p.id_kategori,
                    category: catObj ? catObj.name : 'Umum',
                    rack: p.lokasi_rak,
                    brand: p.merek,
                    motorType: p.tipe_motor,
                    unit: p.satuan,
                    image: 'https://placehold.co/200?text=' + encodeURIComponent(p.nama_barang.substring(0, 4))
                };
            });
            setProducts(mappedFreshProducts);

            // 3. Sync Transactions
            const dbTransactions = await getTransactions();
            setTransactions(dbTransactions.map(t => ({
                id: t.id_transaksi,
                date: t.tanggal_transaksi,
                total: t.total_harga,
                items: [],
                paymentMethod: t.payment_method || 'Tunai',
                serviceFee: t.service_fee || 0,
                mechanicId: t.mechanic_id,
                mechanicName: t.mechanic_name,
                notes: t.notes
            })));
            
            console.log("✅ Background sync complete.");
            setIsSyncing(false);

        } catch (e) {
            console.warn("Failed to sync cloud data, working with local cache:", e);
            setIsSyncing(false);
        }
    };

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (product.category !== 'Service' && existing.quantity >= product.stock) {
                    alert('Stok tidak mencukupi!');
                    return prev;
                }
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            if (product.category !== 'Service' && product.stock <= 0) {
                alert('Stok habis!');
                return prev;
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter(item => item.id !== productId));
    };

    const updateCartQuantity = (productId: string, quantity: number) => {
        setCart((prev) => {
            return prev.map(item => {
                if (item.id === productId) {
                    // Validation
                    if (item.category !== 'Service' && quantity > item.stock) {
                        alert(`Stok tidak mencukupi! Maksimal: ${item.stock}`);
                        return item;
                    }
                    return { ...item, quantity: Math.max(1, quantity) };
                }
                return item;
            });
        });
    };

    const checkout = async () => {
        if (cart.length === 0) return;

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + serviceFee;
        const date = new Date().toISOString();
        const trxId = 'TRX-' + Date.now();

        try {
            console.log('💰 Starting checkout...', trxId);

            // 1. Save transaction
            await addTransaction({
                id: trxId,
                date: date,
                total: total,
                items: cart,
                paymentMethod: paymentMethod,
                serviceFee: serviceFee,
                mechanicId: mechanicId || undefined,
                mechanicName: mechanicName || undefined,
                notes: notes || undefined
            });
            console.log('✅ Transaction saved');

            // 2. Update stock for non-service items
            for (const item of cart) {
                if (item.category !== 'Service') {
                    const newStock = item.stock - item.quantity;
                    console.log(`📦 Updating stock for ${item.name}: ${item.stock} → ${newStock}`);

                    // Import updateProductStockSupa from services
                    const { updateProductStockSupa } = require('@/services/supabaseService');
                    await updateProductStockSupa(item.id, newStock);
                }
            }
            console.log('✅ Stock updated');

            // 3. Reset cart and reload data
            setCart([]);
            setPaymentMethodState('Tunai');
            setServiceFeeState(0);
            setMechanicId(null);
            setMechanicName('');
            setNotes('');

            await loadData();
            console.log('✅ Checkout complete!');

        } catch (error) {
            console.error('❌ Checkout error:', error);
            throw error; // Re-throw so caller can handle
        }
    };

    const addProduct = (product: Product) => {
        // Convert UI Product to BarangDB
        const dbProduct: BarangDB = {
            kode_barang: product.id,
            nama_barang: product.name,
            stok: product.stock,
            harga_jual: product.price,
            id_kategori: product.categoryId,
            barcode: product.barcode,
            harga_beli: product.buyPrice,
            harga_beli_dus: product.buyPriceBox,
            lokasi_rak: product.rack,
            merek: product.brand,
            tipe_motor: product.motorType,
            satuan: product.unit
        };
        addProductToDB(dbProduct).then(() => loadData());
    };

    const updateProductData = (product: Product) => {
        const dbProduct: BarangDB = {
            kode_barang: product.id,
            nama_barang: product.name,
            stok: product.stock,
            harga_jual: product.price,
            id_kategori: product.categoryId,
            barcode: product.barcode,
            harga_beli: product.buyPrice,
            harga_beli_dus: product.buyPriceBox,
            lokasi_rak: product.rack,
            merek: product.brand,
            tipe_motor: product.motorType,
            satuan: product.unit
        };
        updateProductInDB(dbProduct).then(() => loadData());
    };

    const deleteProductData = (productId: string) => {
        deleteProductInDB(productId).then(() => loadData());
    };

    const addNewCategory = (name: string) => {
        addCategoryToDB(name).then(() => loadData());
    };

    const removeCategory = (id: number) => {
        deleteCategoryToDB(id).then(() => loadData());
    };

    const updateStock = (productId: string, amount: number) => {
        // updateProductStock(productId, amount);
        // loadData();
        // Implemented later when we add updateStockSupa
        alert("Fitur update stok langsung sedang diperbarui untuk Cloud.");
    };

    return (
        <ShopContext.Provider value={{
            products,
            categories,
            cart,
            transactions,
            shopInfo,
            paymentMethod,
            serviceFee,
            mechanicId,
            mechanicName,
            notes,
            stats,
            isSyncing,
            addToCart,
            removeFromCart,
            updateCartQuantity,
            checkout,
            addProduct,
            updateProductData,
            deleteProductData,
            addNewCategory,
            removeCategory,
            updateStock,
            refreshData: loadData,
            setPaymentMethod: setPaymentMethodState,
            setServiceFee: setServiceFeeState,
            setMechanicId,
            setMechanicName,
            setNotes
        }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) throw new Error('useShop must be used within a ShopProvider');
    return context;
};
