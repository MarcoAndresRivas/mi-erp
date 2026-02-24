import { create } from 'zustand';
import api from '../api/axios';

export interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    codigo_barras: string;
}

export interface CartItem extends Product {
    quantity: number;
}

interface PosState {
    products: Product[];
    cart: CartItem[];
    isLoading: boolean;
    fetchProducts: () => Promise<void>;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    checkout: (metodoPago: string) => Promise<void>;
    cartTotal: () => number;
}

export const usePosStore = create<PosState>((set, get) => ({
    products: [],
    cart: [],
    isLoading: false,

    fetchProducts: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/productos');
            set({ products: response.data });
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    addToCart: (product) => {
        const cart = get().cart;
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            set({
                cart: cart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            });
        } else {
            set({ cart: [...cart, { ...product, quantity: 1 }] });
        }
    },

    removeFromCart: (productId) => {
        set({ cart: get().cart.filter(item => item.id !== productId) });
    },

    updateQuantity: (productId, quantity) => {
        const cart = get().cart;
        const existingItem = cart.find(item => item.id === productId);
        if (!existingItem) return;

        if (quantity <= 0) {
            set({ cart: cart.filter(item => item.id !== productId) });
        } else if (quantity <= existingItem.stock) {
            set({
                cart: cart.map(item =>
                    item.id === productId
                        ? { ...item, quantity }
                        : item
                )
            });
        }
    },

    clearCart: () => set({ cart: [] }),

    cartTotal: () => {
        return get().cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
    },

    checkout: async (metodoPago: string) => {
        const { cart, cartTotal, clearCart } = get();
        if (cart.length === 0) throw new Error("El carrito está vacío");

        const items = cart.map(item => ({
            id: item.id,
            cantidad: item.quantity,
            precioVenta: item.precio,
            subtotal: item.precio * item.quantity
        }));

        const total = cartTotal();
        const impuestos = total * 0.19;

        set({ isLoading: true });
        try {
            await api.post('/ventas', {
                cart: items,
                method: metodoPago,
                subtotal: total - impuestos,
                tax: impuestos,
                total: total
            });
            clearCart();
        } catch (error: any) {
            console.error('Error during checkout:', error);
            throw new Error(error.response?.data?.message || 'Error al procesar la venta');
        } finally {
            set({ isLoading: false });
        }
    }
}));
