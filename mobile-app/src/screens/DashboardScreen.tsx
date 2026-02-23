import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useDeliveryStore, Order } from '../store/deliveryStore';
import { LogOut, Package } from 'lucide-react-native';

export default function DashboardScreen({ navigation }: any) {
    const { user, logout } = useAuthStore();
    const { orders, isLoading, fetchOrders } = useDeliveryStore();

    useEffect(() => {
        fetchOrders();
    }, []);

    const renderOrderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('OrderDetails', { order: item })}
        >
            <View style={styles.cardHeader}>
                <Package color="#2563eb" size={24} />
                <Text style={styles.orderId}>Pedido #{item.id}</Text>
                <View style={[
                    styles.badge,
                    item.estado === 'Entregado' ? styles.badgeSuccess :
                        item.estado === 'En Ruta' ? styles.badgeWarning : {}
                ]}>
                    <Text style={[
                        styles.badgeText,
                        item.estado === 'Entregado' ? styles.badgeTextSuccess :
                            item.estado === 'En Ruta' ? styles.badgeTextWarning : {}
                    ]}>{item.estado}</Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.clientName}>{item.cliente}</Text>
                <Text style={styles.address}>{item.direccion}</Text>
                <Text style={styles.price}>Total: ${item.total.toLocaleString('es-CL')}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hola, {user?.nombre}</Text>
                    <Text style={styles.role}>{user?.rol} - {user?.empresa}</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                    <LogOut color="#ef4444" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Tus Pedidos Asignados</Text>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={orders}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderOrderItem}
                        contentContainerStyle={styles.listContainer}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    header: {
        backgroundColor: '#ffffff',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    greeting: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    role: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    logoutBtn: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 16,
    },
    listContainer: {
        gap: 12,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginLeft: 8,
        flex: 1,
    },
    badge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeSuccess: {
        backgroundColor: '#dcfce7',
    },
    badgeWarning: {
        backgroundColor: '#ffedd5',
    },
    badgeText: {
        color: '#d97706',
        fontSize: 12,
        fontWeight: '600',
    },
    badgeTextSuccess: {
        color: '#166534',
    },
    badgeTextWarning: {
        color: '#9a3412',
    },
    cardBody: {
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
    },
    clientName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
    },
    address: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#059669',
        marginTop: 8,
    }
});
