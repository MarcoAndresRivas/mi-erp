import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
                    const { token, usuario } = response.data;

                    localStorage.setItem('erp_token', token);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    set({ user: usuario, token: token, isLoading: false });
                    return { success: true };
                } catch (error: any) {
                    set({ isLoading: false, error: error.response?.data?.message || 'Error al iniciar sesión' });
                    return { success: false, message: error.response?.data?.message };
                }
            },

            logout: () => {
                localStorage.removeItem('erp_token');
                delete axios.defaults.headers.common['Authorization'];
                set({ user: null, token: null });
            },

            checkAuth: () => {
                const token = typeof window !== 'undefined' ? localStorage.getItem('erp_token') : null;
                if (token) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    set({ token });
                }
            }
        }),
        {
            name: 'auth-storage', // nombre del item en localStorage
        }
    )
);

export default useAuthStore;
