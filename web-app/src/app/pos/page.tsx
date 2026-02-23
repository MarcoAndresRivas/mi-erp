"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import usePosStore, { Product } from '@/store/posStore';
import { ShoppingCart, Search, Plus, Minus, Trash2, CreditCard, Banknote, UndoIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function PosPage() {
    const user = useAuthStore((state: any) => state.user);
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);

    const {
        products, fetchProducts, isLoadingProducts,
        cart, subtotal, tax, total, searchQuery, isProcessingPayment,
        setSearchQuery, addToCart, removeFromCart, updateQuantity, clearCart, processPayment
    } = usePosStore();

    const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta'>('Efectivo');

    // Muestra UI y Carga productos de MySQL en inicio
    useEffect(() => {
        setIsMounted(true);
        fetchProducts();
    }, [fetchProducts]);

    // Solo Vendedores, Cajeros o Admin pueden ver esto
    useEffect(() => {
        if (isMounted) {
            if (!user) {
                router.push('/login');
            } else if (!['Administrador', 'Vendedor', 'Cajero'].includes(user.rol)) {
                router.push('/dashboard');
                toast.error('No tienes permisos para acceder al POS');
            }
        }
    }, [user, router, isMounted]);

    if (!isMounted || !user) return null;

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.codigoBarras.includes(searchQuery)
    );

    const handleCheckout = async () => {
        if (cart.length === 0) return toast.error('El carrito está vacío');

        const result = await processPayment(paymentMethod);
        if (result.success) {
            toast.success(result.message);
        }
    };

    return (
        <div className="h-screen flex bg-neutral-100 overflow-hidden">
            <Toaster position="top-right" />

            {/* Sección Izquierda: Productos */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
                {/* Header POS */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 mb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <ShoppingCart className="text-blue-600" />
                            Punto de Venta
                        </h1>
                        <p className="text-sm text-neutral-500">Cajero: {user.nombre} ({user.rol})</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200"
                    >
                        <UndoIcon className="w-4 h-4" />
                        Volver
                    </button>
                </div>

                {/* Búsqueda */}
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-neutral-800"
                        placeholder="Buscar por nombre o escanear código de barras..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Grilla de productos (simulando lectura rapida) */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between h-32"
                            >
                                <div>
                                    <p className="font-semibold text-neutral-800 text-sm line-clamp-2">{product.nombre}</p>
                                    <p className="text-xs text-neutral-400 mt-1">Ref: {product.codigoBarras}</p>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <p className="text-lg font-bold text-blue-600">${product.precioVenta.toLocaleString('es-CL')}</p>
                                    <p className="text-xs text-neutral-500">{product.stockActual} en stock</p>
                                </div>
                            </button>
                        ))}

                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-10 text-center text-neutral-500">
                                No se encontraron productos
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sección Derecha: Ticket / Carrito */}
            <div className="w-96 bg-white border-l border-neutral-200 flex flex-col shadow-xl z-10">
                <div className="bg-neutral-900 text-white p-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        Ticket de Venta
                    </h2>
                </div>

                {/* Lista de Carrito */}
                <div className="flex-1 overflow-y-auto p-4 bg-neutral-50">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4">
                            <ShoppingCart className="w-16 h-16 opacity-20" />
                            <p>El carrito está vacío</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-neutral-100 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-semibold max-w-[180px] leading-tight text-neutral-800">{item.nombre}</p>
                                        <p className="font-bold text-neutral-800">${item.subtotal.toLocaleString('es-CL')}</p>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-neutral-500">${item.precioVenta.toLocaleString('es-CL')} c/u</p>

                                        <div className="flex items-center gap-3 bg-neutral-100 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                                                className="p-1 text-neutral-600 hover:text-red-500 hover:bg-white rounded transition-colors"
                                            >
                                                {item.cantidad === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                            </button>
                                            <span className="font-medium text-sm w-6 text-center">{item.cantidad}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                                                className="p-1 text-neutral-600 hover:text-blue-600 hover:bg-white rounded transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Resumen Totales y Pago */}
                <div className="border-t border-neutral-200 p-4 bg-white">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-neutral-500">
                            <span>Subtotal</span>
                            <span>${subtotal.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between text-sm text-neutral-500">
                            <span>IVA (19%)</span>
                            <span>${tax.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-neutral-800 pt-2 border-t border-dashed">
                            <span>TOTAL</span>
                            <span className="text-blue-600">${total.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <button
                            onClick={() => setPaymentMethod('Efectivo')}
                            className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 border-2 transition-all font-medium ${paymentMethod === 'Efectivo'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                }`}
                        >
                            <Banknote className="w-5 h-5" />
                            Efectivo
                        </button>
                        <button
                            onClick={() => setPaymentMethod('Tarjeta')}
                            className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 border-2 transition-all font-medium ${paymentMethod === 'Tarjeta'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                }`}
                        >
                            <CreditCard className="w-5 h-5" />
                            Tarjeta
                        </button>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isProcessingPayment}
                        className={`w-full py-4 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg transition-all ${cart.length === 0
                            ? 'bg-neutral-300 cursor-not-allowed'
                            : isProcessingPayment
                                ? 'bg-blue-400 cursor-wait'
                                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25'
                            }`}
                    >
                        {isProcessingPayment ? 'Procesando...' : 'COBRAR'}
                    </button>

                    <div className="mt-3 text-center">
                        <button
                            onClick={clearCart}
                            disabled={cart.length === 0 || isProcessingPayment}
                            className="text-sm text-neutral-400 hover:text-red-500 transition-colors"
                        >
                            Cancelar venta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
