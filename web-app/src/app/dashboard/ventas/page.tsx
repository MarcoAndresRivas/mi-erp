"use client";

import { useEffect, useState } from 'react';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Store, ShoppingCart, Package, Users, Truck, LogOut, Receipt, Search, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function HistorialVentasPage() {
    const user = useAuthStore((state: any) => state.user);
    const logout = useAuthStore((state: any) => state.logout);
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);
    const [ventas, setVentas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [selectedVenta, setSelectedVenta] = useState<any>(null);
    const [ventaDetalles, setVentaDetalles] = useState<any[]>([]);
    const [isLoadingDetalles, setIsLoadingDetalles] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            const fetchVentas = async () => {
                try {
                    const token = localStorage.getItem('erp_token');
                    const response = await axios.get(`${API_URL}/ventas`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setVentas(response.data);
                } catch (error) {
                    console.error("Error al cargar ventas", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchVentas();
        }
    }, [isMounted]);

    if (!isMounted) return null;

    if (!user || !['Administrador', 'Vendedor'].includes(user.rol)) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-screen bg-neutral-100">
                <div className="bg-white p-8 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold text-red-500 mb-4">Acceso Denegado</h2>
                    <p className="text-neutral-600 mb-6">No tienes permisos para ver el historial de ventas.</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-900 transition-colors"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const handleVerDetalle = async (venta: any) => {
        setSelectedVenta(venta);
        setIsLoadingDetalles(true);
        try {
            const token = localStorage.getItem('erp_token');
            const response = await axios.get(`${API_URL}/ventas/${venta.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVentaDetalles(response.data);
        } catch (error) {
            console.error("Error cargando detalle", error);
            setVentaDetalles([]);
        } finally {
            setIsLoadingDetalles(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString('es-CL')}`;
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: es });
    };

    const filteredVentas = ventas.filter(v =>
        (v.id?.toString().includes(searchTerm)) ||
        (v.cajero?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-neutral-100 flex">
            {/* Sidebar Consistente */}
            <aside className="w-64 bg-neutral-900 text-white flex flex-col">
                <div className="p-6 flex items-center space-x-3 border-b border-neutral-800">
                    <Store className="w-8 h-8 text-blue-500" />
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Mi ERP</h1>
                        <p className="text-xs text-neutral-400">{user.empresa}</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-neutral-300 hover:bg-neutral-800 rounded-lg transition-colors">
                        <Store className="w-5 h-5" />
                        <span>Inicio</span>
                    </Link>
                    <Link href="/pos" className="flex items-center space-x-3 px-4 py-3 text-neutral-300 hover:bg-neutral-800 rounded-lg transition-colors">
                        <ShoppingCart className="w-5 h-5" />
                        <span>Punto de Venta</span>
                    </Link>
                    <Link href="/dashboard/productos" className="flex items-center space-x-3 px-4 py-3 text-neutral-300 hover:bg-neutral-800 rounded-lg transition-colors">
                        <Package className="w-5 h-5" />
                        <span>Inventario</span>
                    </Link>
                    <Link href="/dashboard/ventas" className="flex items-center space-x-3 px-4 py-3 bg-blue-600 rounded-lg text-white">
                        <Receipt className="w-5 h-5" />
                        <span>Historial Ventas</span>
                    </Link>
                    <Link href="#" className="flex items-center space-x-3 px-4 py-3 text-neutral-300 hover:bg-neutral-800 rounded-lg transition-colors">
                        <Users className="w-5 h-5" />
                        <span>Usuarios</span>
                    </Link>
                    <Link href="#" className="flex items-center space-x-3 px-4 py-3 text-neutral-300 hover:bg-neutral-800 rounded-lg transition-colors">
                        <Truck className="w-5 h-5" />
                        <span>Despachos</span>
                    </Link>
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
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-neutral-800 flex items-center gap-2">
                        <Receipt className="w-8 h-8 text-blue-600" />
                        Historial de Ventas
                    </h2>
                    <p className="text-neutral-500 mt-1">Revisa las boletas y facturas emitidas por la empresa.</p>
                </div>

                {/* Filtro */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 mb-6 flex items-center gap-4">
                    <div className="relative w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-neutral-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Buscar por ID de Venta o Cajero..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center text-neutral-500">Cargando historial de ventas...</div>
                    ) : (
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">ID Documento</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Fecha / Hora</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Tipo</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Cajero</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Método Pago</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {filteredVentas.map((venta) => (
                                    <tr key={venta.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                            #{venta.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                            {formatDate(venta.fecha)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {venta.tipoDocumento}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                                            {venta.cajero}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                            {venta.metodoPago}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-neutral-900">
                                            {formatCurrency(venta.total)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleVerDetalle(venta)}
                                                className="text-blue-600 hover:text-blue-900 font-medium flex items-center justify-end w-full gap-1"
                                            >
                                                Ver Detalle <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {filteredVentas.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                                            No se encontraron ventas para esta búsqueda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Modal de Detalle */}
                {selectedVenta && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-800">Detalle de Venta #{selectedVenta.id}</h3>
                                    <p className="text-sm text-neutral-500">{formatDate(selectedVenta.fecha)}</p>
                                </div>
                                <button onClick={() => setSelectedVenta(null)} className="text-neutral-400 hover:text-neutral-700">
                                    <span className="sr-only">Cerrar</span>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 bg-neutral-50/50">
                                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                    <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                                        <p className="text-neutral-500 text-xs uppercase font-semibold">Cajero</p>
                                        <p className="font-medium text-neutral-900">{selectedVenta.cajero}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                                        <p className="text-neutral-500 text-xs uppercase font-semibold">Método de Pago</p>
                                        <p className="font-medium text-neutral-900">{selectedVenta.metodoPago}</p>
                                    </div>
                                </div>

                                <h4 className="font-bold text-neutral-800 mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-neutral-400" />
                                    Productos Vendidos
                                </h4>

                                {isLoadingDetalles ? (
                                    <div className="py-8 text-center text-neutral-500">Cargando productos...</div>
                                ) : (
                                    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                                        <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                            <thead className="bg-neutral-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium text-neutral-500">Producto</th>
                                                    <th className="px-4 py-2 text-right font-medium text-neutral-500">Cant.</th>
                                                    <th className="px-4 py-2 text-right font-medium text-neutral-500">Precio Unit.</th>
                                                    <th className="px-4 py-2 text-right font-medium text-neutral-500">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {ventaDetalles.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-3 text-neutral-800 font-medium">{item.producto}</td>
                                                        <td className="px-4 py-3 text-right text-neutral-600">{item.cantidad}</td>
                                                        <td className="px-4 py-3 text-right text-neutral-600">{formatCurrency(item.precio)}</td>
                                                        <td className="px-4 py-3 text-right text-neutral-900 font-bold">{formatCurrency(item.subtotal)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-neutral-50">
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-3 text-right font-bold text-neutral-700">TOTAL:</td>
                                                    <td className="px-4 py-3 text-right font-bold text-blue-600 text-lg">{formatCurrency(selectedVenta.total)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-neutral-200 p-4 bg-white flex justify-end">
                                <button
                                    onClick={() => setSelectedVenta(null)}
                                    className="px-6 py-2 bg-neutral-100 text-neutral-700 font-medium rounded-lg hover:bg-neutral-200 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
