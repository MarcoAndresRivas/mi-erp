import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Product type for typesafety later
export interface Product {
    id: number;
    sku?: string;
    nombre: string;
    codigoBarras: string;
    precioVenta: number;
    precioNeto?: number;
    stockActual: number;
    categoria?: string;
    costo?: number;
}

export interface CartItem extends Product {
    cantidad: number;
    subtotal: number;
}

interface PosStore {
    products: Product[];
    cart: CartItem[];
    total: number;
    subtotal: number;
    tax: number;
    searchQuery: string;
    isProcessingPayment: boolean;
    isLoadingProducts: boolean;

    // Actions
    fetchProducts: () => Promise<void>;
    setSearchQuery: (query: string) => void;
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    processPayment: (method: string) => Promise<{ success: boolean; message: string }>;
}

const usePosStore = create<PosStore>((set, get) => ({
    products: [],
    cart: [],
    total: 0,
    subtotal: 0,
    tax: 0,
    searchQuery: '',
    isProcessingPayment: false,
    isLoadingProducts: false,

    fetchProducts: async () => {
        set({ isLoadingProducts: true });
        try {
            const response = await axios.get(`${API_URL}/productos`);
            set({ products: response.data, isLoadingProducts: false });
        } catch (error) {
            console.error('Error fetching API products:', error);
            set({ isLoadingProducts: false });
        }
    },

    setSearchQuery: (query) => set({ searchQuery: query }),

    addToCart: (product, quantity = 1) => {
        set((state) => {
            const existingItem = state.cart.find((item) => item.id === product.id);
            let newCart;

            if (existingItem) {
                newCart = state.cart.map((item) =>
                    item.id === product.id
                        ? {
                            ...item,
                            cantidad: item.cantidad + quantity,
                            subtotal: (item.cantidad + quantity) * item.precioVenta,
                        }
                        : item
                );
            } else {
                newCart = [...state.cart, { ...product, cantidad: quantity, subtotal: product.precioVenta * quantity }];
            }

            // Calculate totals
            const { sub, tax, t } = calculateTotals(newCart);
            return { cart: newCart, subtotal: sub, tax, total: t, searchQuery: '' };
        });
    },

    removeFromCart: (productId) => {
        set((state) => {
            const newCart = state.cart.filter((item) => item.id !== productId);
            const { sub, tax, t } = calculateTotals(newCart);
            return { cart: newCart, subtotal: sub, tax, total: t };
        });
    },

    updateQuantity: (productId, quantity) => {
        set((state) => {
            if (quantity <= 0) {
                get().removeFromCart(productId);
                return state;
            }

            const newCart = state.cart.map((item) =>
                item.id === productId
                    ? { ...item, cantidad: quantity, subtotal: quantity * item.precioVenta }
                    : item
            );

            const { sub, tax, t } = calculateTotals(newCart);
            return { cart: newCart, subtotal: sub, tax, total: t };
        });
    },

    clearCart: () => set({ cart: [], total: 0, subtotal: 0, tax: 0 }),

    processPayment: async (method) => {
        set({ isProcessingPayment: true });

        // Aquí iria el llamado al backend real con axios
        // await axios.post('/api/ventas', { cart: get().cart, method, total: get().total });

        return new Promise((resolve) => {
            setTimeout(() => {
                get().clearCart();
                set({ isProcessingPayment: false });
                resolve({ success: true, message: 'Pago procesado y boleta generada' });
            }, 1500); // Simulando tiempo de red
        });
    }
}));

// Helper logic for Taxes
function calculateTotals(cart: CartItem[]) {
    const sub = cart.reduce((acc, item) => acc + item.subtotal, 0);
    const tax = sub * 0.19; // IVA Chile 19%
    const t = sub + tax;
    return { sub, tax, t };
}

export default usePosStore;
