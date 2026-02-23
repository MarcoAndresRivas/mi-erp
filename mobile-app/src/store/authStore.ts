import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';

interface User {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    empresa: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: true,
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, usuario: user } = response.data;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            set({ token, user });
        } catch (error: any) {
            console.error('Login Error:', error.message);
            if (!error.response) {
                throw new Error('No se pudo conectar al servidor. Intenta revisar tu conexión.');
            }
            throw new Error(error.response?.data?.message || 'Error de inicio de sesión');
        }
    },
    logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        set({ user: null, token: null });
    },
    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const token = await AsyncStorage.getItem('token');
            const userStr = await AsyncStorage.getItem('user');

            if (token && userStr) {
                set({ token, user: JSON.parse(userStr) });
            }
        } catch (error) {
            console.error('Failed to load auth state', error);
        } finally {
            set({ isLoading: false });
        }
    }
}));
