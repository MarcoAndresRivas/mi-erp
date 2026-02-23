import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useDeliveryStore } from '../store/deliveryStore';
import { Package, MapPin, CheckCircle, Clock } from 'lucide-react-native';

export default function OrderDetailsScreen({ route, navigation }: any) {
    const { order } = route.params;
    const { updateOrderStatus } = useDeliveryStore();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdateStatus = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            await updateOrderStatus(order.id, newStatus);
            Alert.alert('Éxito', `Pedido marcado como ${newStatus}`);
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar el estado del pedido');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>&larr; Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Detalle del Pedido</Text>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    <View style={styles.orderHeader}>
                        <Package color="#2563eb" size={32} />
                        <View style={styles.orderInfo}>
                            <Text style={styles.orderId}>Pedido #{order.id}</Text>
                            <Text style={styles.orderDate}>{new Date(order.fecha).toLocaleDateString()}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Cliente:</Text>
                        <Text style={styles.value}>{order.cliente}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.addressContainer}>
                            <MapPin color="#6b7280" size={20} style={{ marginRight: 8 }} />
                            <Text style={styles.addressText}>{order.direccion}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Total a cobrar:</Text>
                        <Text style={styles.price}>${order.total.toLocaleString('es-CL')}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Estado Actual:</Text>
                        <Text style={[styles.statusText, order.estado === 'Entregado' ? { color: '#059669' } : {}]}>
                            {order.estado}
                        </Text>
                    </View>
                </View>

                {order.estado !== 'Entregado' && (
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.btnSuccess]}
                            onPress={() => handleUpdateStatus('Entregado')}
                            disabled={isUpdating}
                        >
                            {isUpdating ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <CheckCircle color="#fff" size={24} />
                                    <Text style={styles.actionBtnText}>Marcar Entregado</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionBtn, styles.btnWarning]}
                            onPress={() => handleUpdateStatus('Reprogramado')}
                            disabled={isUpdating}
                        >
                            {isUpdating ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <Clock color="#fff" size={24} />
                                    <Text style={styles.actionBtnText}>Aplazar / No Entregado</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: {
        backgroundColor: '#ffffff',
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backBtn: { padding: 8, width: 60 },
    backText: { color: '#2563eb', fontSize: 16, fontWeight: '500' },
    title: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    content: { flex: 1, padding: 20 },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 24,
    },
    orderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    orderInfo: { marginLeft: 16 },
    orderId: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
    orderDate: { fontSize: 14, color: '#6b7280', marginTop: 4 },
    divider: { height: 1, backgroundColor: '#e5e7eb', marginBottom: 20 },
    detailRow: { marginBottom: 16 },
    label: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
    value: { fontSize: 18, color: '#111827', fontWeight: '500' },
    addressContainer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#f9fafb', padding: 12, borderRadius: 8 },
    addressText: { flex: 1, fontSize: 16, color: '#374151', lineHeight: 24 },
    price: { fontSize: 24, fontWeight: 'bold', color: '#059669' },
    statusText: { fontSize: 18, fontWeight: '600', color: '#d97706' },
    actionsContainer: { gap: 16 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 12 },
    btnSuccess: { backgroundColor: '#10b981' },
    btnWarning: { backgroundColor: '#f59e0b' },
    actionBtnText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
