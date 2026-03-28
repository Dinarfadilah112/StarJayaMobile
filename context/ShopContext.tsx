import { addProduct as addProductToDB, addTransaction, getProducts, getTransactions, initDatabase, updateProductStock } from '@/database/db';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Interface UI
export interface Product {
    id: string;
    name: string;
    stock: number;
    price: number;
    category: string;
    image: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Transaction {
    id: string;
    date: string;
    items: CartItem[];
    total: number;
}

interface ShopContextType {
    products: Product[];
    transactions: Transaction[];
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    checkout: () => void;
    addProduct: (product: Product) => void;
    updateStock: (productId: string, amount: number) => void;
    refreshData: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        // Inisialisasi DB saat start
        const start = () => {
            initDatabase();
            loadData();
        };
        start();
    }, []);

    const loadData = () => {
        try {
            // 1. Load Produk
            const dbProducts = getProducts();

            const mappedProducts: Product[] = dbProducts.map((p) => {
                // Mapping Kategori ID -> Nama
                let catName = 'Sparepart'; // Default
                if (p.id_kategori === 1) catName = 'Oli';
                if (p.id_kategori === 3) catName = 'Service';
                if (p.nama_barang.toLowerCase().includes('ban')) catName = 'Ban'; // Deteksi manual jika ID blm pas

                return {
                    id: p.kode_barang,
                    name: p.nama_barang,
                    stock: p.stok,
                    price: p.harga_jual,
                    category: catName,
                    image: 'https://placehold.co/200?text=' + encodeURIComponent(p.nama_barang.substring(0, 4))
                };
            });

            setProducts(mappedProducts);

            // 2. Load Transaksi
            const dbTransactions = getTransactions();
            const mappedTransactions: Transaction[] = dbTransactions.map(t => ({
                id: t.id_transaksi,
                date: t.tanggal_transaksi,
                total: t.total_harga,
                items: [] // Detail item skip dulu
            }));
            setTransactions(mappedTransactions);

        } catch (e) {
            console.error("Failed to load data from DB", e);
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

    const checkout = () => {
        if (cart.length === 0) return;

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const date = new Date().toISOString();
        const trxId = 'TRX-' + Date.now();

        // Simpan ke DB
        addTransaction({
            id: trxId,
            date: date,
            total: total,
            items: cart
        });

        // Update Stok
        cart.forEach(item => {
            if (item.category !== 'Service') {
                const newStock = item.stock - item.quantity;
                updateProductStock(item.id, newStock);
            }
        });

        setCart([]);
        loadData(); // Refresh UI
    };

    const addProduct = (product: Product) => {
        addProductToDB(product);
        loadData();
    };

    const updateStock = (productId: string, amount: number) => {
        updateProductStock(productId, amount);
        loadData();
    };

    return (
        <ShopContext.Provider value={{
            products,
            cart,
            transactions,
            addToCart,
            removeFromCart,
            checkout,
            addProduct,
            updateStock,
            refreshData: loadData
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
