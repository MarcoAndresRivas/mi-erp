"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { Store, LogOut, Package, Users, ShoppingCart, Truck } from 'lucide-react';

export default function DashboardPage() {
    const user = useAuthStore((state: any) => state.user);
    const logout = useAuthStore((state: any) => state.logout);
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Protección de ruta básica
    useEffect(() => {
        if (isMounted && !user) {
            router.push('/login');
        }
    }, [user, router, isMounted]);

    if (!isMounted || !user) return null; // Evitar flash de contenido no autorizado

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-neutral-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-neutral-900 text-white flex flex-col">
                <div className="p-6 flex items-center space-x-3 border-b border-neutral-800">
                    <Store className="w-8 h-8 text-blue-500" />
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Mi ERP</h1>
                        <p className="text-xs text-neutral-400">{user.empresa}</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {['Administrador', 'Vendedor', 'Cajero'].includes(user.rol) && (
                        <a href="/pos" className="flex items-center space-x-3 px-4 py-3 bg-blue-600 rounded-lg text-white">
                            <ShoppingCart className="w-5 h-5" />
                            <span>Punto de Venta</span>
                        </a>
                    )}

                    {['Administrador'].includes(user.rol) && (
                        <>
                            <a href="/dashboard/productos" className="flex items-center space-x-3 px-4 py-3 text-neutral-300 hover:bg-neutral-800 rounded-lg transition-colors">
                                <Package className="w-5 h-5" />
                                <span>Inventario</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-neutral-300 hover:bg-neutral-800 rounded-lg transition-colors">
                                <Users className="w-5 h-5" />
                                <span>Usuarios</span>
                            </a>
                        </>
                    )}

                    {['Administrador', 'Repartidor'].includes(user.rol) && (
                        <a href="#" className="flex items-center space-x-3 px-4 py-3 text-neutral-300 hover:bg-neutral-800 rounded-lg transition-colors">
                            <Truck className="w-5 h-5" />
                            <span>Despachos</span>
                        </a>
                    )}
                </nav>

                <div className="p-4 border-t border-neutral-800">
                    <div className="mb-4 px-4">
                        <p className="text-sm font-medium">{user.nombre}</p>
                        <p className="text-xs text-neutral-400">{user.rol}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2 w-full text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="mb-8">
                    <h2 className="text-3xl font-bold text-neutral-800">Panel de Control</h2>
                    <p className="text-neutral-500">Bienvenido de vuelta, {user.nombre}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tarjetas de estadísticas de ejemplo */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                        <h3 className="text-neutral-500 text-sm font-medium mb-2">Ventas del Día</h3>
                        <p className="text-3xl font-bold text-neutral-800">$1,250.00</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                        <h3 className="text-neutral-500 text-sm font-medium mb-2">Pedidos Pendientes</h3>
                        <p className="text-3xl font-bold text-neutral-800">12</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                        <h3 className="text-neutral-500 text-sm font-medium mb-2">Stock Bajo</h3>
                        <p className="text-3xl font-bold text-red-500">5 productos</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
