import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { usePosStore, Product, CartItem } from '../store/posStore';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react-native';

export default function POSScreen({ navigation }: any) {
    const { products, cart, isLoading, fetchProducts, addToCart, removeFromCart, updateQuantity, cartTotal, checkout } = usePosStore();
    const [viewCart, setViewCart] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleCheckout = async () => {
        try {
            await checkout('Efectivo');
            Alert.alert('Éxito', 'Venta registrada correctamente');
            setViewCart(false);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity style={styles.productCard} onPress={() => addToCart(item)}>
            <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.nombre}</Text>
                <Text style={styles.productStock}>Stock: {item.stock}</Text>
            </View>
            <Text style={styles.productPrice}>${item.precio.toLocaleString('es-CL')}</Text>
            <View style={styles.addBtn}>
                <Plus color="#fff" size={20} />
            </View>
        </TouchableOpacity>
    );

    const renderCartItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cartItem}>
            <View style={{ flex: 1 }}>
                <Text style={styles.cartItemName}>{item.nombre}</Text>
                <Text style={styles.cartItemPrice}>${(item.precio * item.quantity).toLocaleString('es-CL')}</Text>
            </View>
            <View style={styles.cartActions}>
                <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>
                    <Minus color="#374151" size={16} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
                    <Plus color="#374151" size={16} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={[styles.qtyBtn, { backgroundColor: '#fee2e2', marginLeft: 8 }]}>
                    <Trash2 color="#ef4444" size={16} />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (viewCart) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setViewCart(false)} style={styles.backBtn}>
                        <ArrowLeft color="#111827" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Carrito de Ventas</Text>
                    <View style={{ width: 24 }} />
                </View>

                <FlatList
                    data={cart}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderCartItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>El carrito está vacío</Text>}
                />

                <View style={styles.footer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalText}>Total:</Text>
                        <Text style={styles.totalAmount}>${cartTotal().toLocaleString('es-CL')}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.checkoutBtn, cart.length === 0 && styles.checkoutBtnDisabled]}
                        disabled={cart.length === 0 || isLoading}
                        onPress={handleCheckout}
                    >
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkoutBtnText}>Procesar Venta (Efectivo)</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color="#111827" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Punto de Venta</Text>
                <TouchableOpacity onPress={() => setViewCart(true)} style={styles.cartIconBtn}>
                    <ShoppingCart color="#111827" size={24} />
                    {cart.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{cart.reduce((acc, item) => acc + item.quantity, 0)}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {isLoading && !cart.length ? (
                <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderProduct}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: {
        backgroundColor: '#ffffff',
        paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    cartIconBtn: { padding: 4, position: 'relative' },
    badge: {
        position: 'absolute', top: -5, right: -5,
        backgroundColor: '#ef4444', borderRadius: 10,
        width: 20, height: 20, justifyContent: 'center', alignItems: 'center'
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    listContainer: { padding: 16, gap: 12 },
    productCard: {
        backgroundColor: '#ffffff', borderRadius: 12, padding: 16,
        flexDirection: 'row', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
    },
    productName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
    productStock: { fontSize: 12, color: '#6b7280', marginTop: 4 },
    productPrice: { fontSize: 16, fontWeight: 'bold', color: '#059669', marginRight: 16 },
    addBtn: {
        backgroundColor: '#2563eb', borderRadius: 8, padding: 8
    },
    cartItem: {
        backgroundColor: '#ffffff', borderRadius: 12, padding: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
    },
    cartItemName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
    cartItemPrice: { fontSize: 14, fontWeight: 'bold', color: '#059669', marginTop: 4 },
    cartActions: { flexDirection: 'row', alignItems: 'center' },
    qtyBtn: { backgroundColor: '#f3f4f6', borderRadius: 8, padding: 6, marginHorizontal: 4 },
    qtyText: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 8, color: '#1f2937' },
    emptyText: { textAlign: 'center', color: '#6b7280', marginTop: 40, fontSize: 16 },
    footer: {
        backgroundColor: '#ffffff', padding: 20, paddingBottom: 40,
        borderTopWidth: 1, borderTopColor: '#e5e7eb',
    },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    totalText: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    totalAmount: { fontSize: 24, fontWeight: 'bold', color: '#059669' },
    checkoutBtn: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center' },
    checkoutBtnDisabled: { backgroundColor: '#9ca3af' },
    checkoutBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});
