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
            const token = localStorage.getItem('erp_token');
            const response = await axios.get(`${API_URL}/productos`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
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

        try {
            // Asegurarse de enviar el token
            const token = localStorage.getItem('erp_token');
            const response = await axios.post(`${API_URL}/ventas`, {
                cart: get().cart,
                method,
                subtotal: get().subtotal,
                tax: get().tax,
                total: get().total
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            get().clearCart();
            set({ isProcessingPayment: false });

            // Actualizar stock local si se quiere
            get().fetchProducts();

            return { success: true, message: 'Pago procesado y boleta generada' };
        } catch (error: any) {
            console.error('Error al procesar pago:', error);
            set({ isProcessingPayment: false });
            return {
                success: false,
                message: error.response?.data?.message || 'Error al conectar procesar la venta'
            };
        }
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
