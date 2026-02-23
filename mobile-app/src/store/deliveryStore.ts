import { create } from 'zustand';
import api from '../api/axios';

export interface Order {
    id: number;
    cliente: string;
    direccion: string;
    estado: string;
    fecha: string;
    total: number;
}

interface DeliveryState {
    orders: Order[];
    isLoading: boolean;
    fetchOrders: () => Promise<void>;
    updateOrderStatus: (orderId: number, status: string) => Promise<void>;
}

export const useDeliveryStore = create<DeliveryState>((set) => ({
    orders: [],
    isLoading: false,

    fetchOrders: async () => {
        set({ isLoading: true });
        try {
            // Re-using the logic from the web-app but hitting a delivery specific endpoint
            // Note: Endpoints will be implemented in the backend later if needed
            const response = await api.get('/pedidos/repartidor');
            set({ orders: response.data });
        } catch (error) {
            console.error('Error fetching orders:', error);
            // Fallback for UI demonstration until API is ready
            set({
                orders: [
                    { id: 101, cliente: 'Juan Pérez', direccion: 'Av Libertad 123, Concepción', estado: 'Pendiente', fecha: new Date().toISOString(), total: 15000 },
                    { id: 102, cliente: 'María González', direccion: 'Calle Prat 456, Hualpén', estado: 'Pendiente', fecha: new Date().toISOString(), total: 8500 },
                ]
            });
        } finally {
            set({ isLoading: false });
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            await api.put(`/pedidos/${orderId}/estado`, { estado: status });
            // Refresh orders after updating
            const response = await api.get('/pedidos/repartidor');
            set({ orders: response.data });
        } catch (error) {
            console.error('Error updating order:', error);
            // Fallback local update for UI demonstration
            set((state) => ({
                orders: state.orders.map(order =>
                    order.id === orderId ? { ...order, estado: status } : order
                )
            }));
        }
    }
}));
