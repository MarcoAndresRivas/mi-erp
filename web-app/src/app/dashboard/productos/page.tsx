"use client";

import { useState, useEffect, useRef } from 'react';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Package, Plus, Search, Edit2, Trash2, UploadCloud, X, Store, Users, ShoppingCart, Truck, LogOut } from 'lucide-react';
import Link from 'next/link';
import Papa from 'papaparse';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

import usePosStore from '@/store/posStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProductosPage() {
    const user = useAuthStore((state: any) => state.user);
    const router = useRouter();
    const logout = useAuthStore((state: any) => state.logout);

    // UI states
    const [searchTerm, setSearchTerm] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        nombre: '', codigoBarras: '', precioVenta: '', precioCosto: '', categoria: '', stockInicial: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { products, fetchProducts } = usePosStore();

    useEffect(() => {
        setIsMounted(true);
        fetchProducts();
    }, [fetchProducts]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post(`${API_URL}/productos`, formData);
            toast.success('Producto creado exitosamente');
            setIsModalOpen(false);
            setFormData({ nombre: '', codigoBarras: '', precioVenta: '', precioCosto: '', categoria: '', stockInicial: '' });
            fetchProducts(); // Refresh list
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al crear producto');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const data = results.data as any[];
                let successCount = 0;
                let errorCount = 0;

                toast.loading(`Importando ${data.length} productos...`, { id: 'csv-import' });

                for (const row of data) {
                    try {
                        // Mapeo básico asumiendo columnas CSV: Nombre, CodigoBarras, PrecioVenta, Costo, Categoria, Stock
                        const productData = {
                            sku: row.SKU || row.sku || '',
                            nombre: row.NOMBRE_PRO || row.Nombre || row.nombre,
                            codigoBarras: row.BARRA_EXT || row.BARRA_EXTERNA || row.CodigoBarras || row.codigoBarras || row.codigo,
                            precioVenta: parseFloat(row.PRECIO_BRUT || row.PrecioVenta || row.precio || 0),
                            precioNeto: parseFloat(row.PRECIO_NETC || row.PrecioNeto || 0),
                            precioCosto: parseFloat(row.PRECIO_PROM || row.Costo || row.costo || 0),
                            categoria: row.Categoria || row.categoria || 'Importado',
                            stockInicial: parseInt(row.UNIDADES_VE || row.Stock || row.stock || 0)
                        };

                        if (productData.nombre && productData.precioVenta > 0) {
                            await axios.post(`${API_URL}/productos`, productData);
                            successCount++;
                        } else {
                            errorCount++;
                        }
                    } catch (err) {
                        errorCount++;
                    }
                }

                toast.dismiss('csv-import');
                if (successCount > 0) {
                    toast.success(`${successCount} productos importados correctly`);
                    fetchProducts();
                }
                if (errorCount > 0) {
                    toast.error(`Hubo errores en ${errorCount} filas del archivo`);
                }

                // Reset file input
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            error: (error) => {
                toast.error(`Error procesando CSV: ${error.message}`);
            }
        });
    };

    if (!isMounted) return null;

    if (!user || user.rol !== 'Administrador') {
        return (
            <div className="p-8 text-center text-red-500">
                No tienes permisos para ver el inventario.
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigoBarras.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-neutral-100 flex">
            {/* Sidebar - Extraído de Dashboard pero consistente */}
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
                    <Link href="/dashboard/productos" className="flex items-center space-x-3 px-4 py-3 bg-blue-600 rounded-lg text-white">
                        <Package className="w-5 h-5" />
                        <span>Inventario</span>
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
            <main className="flex-1 p-8 overflow-y-auto relative">
                <Toaster position="top-right" />
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-neutral-800">Gestión de Inventario</h2>
                        <p className="text-neutral-500">Administra tus productos, precios y stock</p>
                    </div>
                    <div className="flex gap-3">
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        <a
                            href="/template_productos.csv"
                            download
                            className="flex items-center gap-2 bg-neutral-100 border border-neutral-300 hover:bg-neutral-200 text-neutral-600 px-4 py-2.5 rounded-lg shadow-sm font-medium transition-colors text-sm"
                            title="Descatgar Plantilla Formato CSV CSV"
                        >
                            Ver Plantilla
                        </a>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-5 py-2.5 rounded-lg shadow-sm font-medium transition-colors"
                        >
                            <UploadCloud className="w-5 h-5 text-neutral-500" />
                            Importar CSV
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Nuevo Producto
                        </button>
                    </div>
                </div>

                {/* Buscador superior */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 mb-6 flex items-center gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-neutral-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Buscar producto por nombre o código de barras..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabla de Productos */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">SKU / Código</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nombre del Producto</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Categoría</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Costo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Precio Venta</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Stock</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                            {filteredProducts.map((producto) => (
                                <tr key={producto.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap flex flex-col">
                                        <span className="text-xs text-neutral-500 font-mono">SKU: {producto.sku || '-'}</span>
                                        <span className="text-sm font-medium text-neutral-900">{producto.codigoBarras}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                                        {producto.nombre}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-neutral-100 text-neutral-800">
                                            {producto.categoria || 'Sin Categoría'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                        ${(producto.costo || 0).toLocaleString('es-CL')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap flex flex-col">
                                        <span className="text-sm font-medium text-blue-600">${(producto.precioVenta || 0).toLocaleString('es-CL')} BRUTO</span>
                                        <span className="text-xs font-semibold text-neutral-500">${(producto.precioNeto || 0).toLocaleString('es-CL')} NETO</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <span className={`px-2 py-1 rounded-md ${producto.stockActual > 50 ? 'bg-green-100 text-green-800' :
                                            producto.stockActual > 20 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {producto.stockActual} u.
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 mr-4 transition-colors">
                                            <Edit2 className="w-4 h-4 inline" />
                                        </button>
                                        <button className="text-red-500 hover:text-red-700 transition-colors">
                                            <Trash2 className="w-4 h-4 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                                        No se encontraron productos coincidentes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal Crear Producto */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
                                <h3 className="text-lg font-bold text-neutral-800">Crear Nuevo Producto</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre del Producto *</label>
                                        <input required name="nombre" value={formData.nombre} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Arroz Grano Largo 1kg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Código de Barras</label>
                                        <input name="codigoBarras" value={formData.codigoBarras} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. 78012345678" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Categoría</label>
                                        <input name="categoria" value={formData.categoria} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Abarrotes" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Costo Unitario ($)</label>
                                        <input name="precioCosto" value={formData.precioCosto} onChange={handleInputChange} type="number" min="0" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Precio de Venta ($) *</label>
                                        <input required name="precioVenta" value={formData.precioVenta} onChange={handleInputChange} type="number" min="1" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Stock Inicial Físico (Opcional)</label>
                                        <input name="stockInicial" value={formData.stockInicial} onChange={handleInputChange} type="number" min="0" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cantidad de cajas, envases, etc..." />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-neutral-100">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-neutral-600 font-medium hover:bg-neutral-100 rounded-lg transition-colors">
                                        Cancelar
                                    </button>
                                    <button disabled={isSubmitting} type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                        {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
