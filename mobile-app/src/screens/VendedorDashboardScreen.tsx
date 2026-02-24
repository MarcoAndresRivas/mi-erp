import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { LogOut, ShoppingCart, Package } from 'lucide-react-native';

export default function VendedorDashboardScreen({ navigation }: any) {
    const { user, logout } = useAuthStore();

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
                <Text style={styles.sectionTitle}>Panel de Control</Text>

                <View style={styles.grid}>
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('POS')}
                    >
                        <ShoppingCart color="#2563eb" size={48} />
                        <Text style={styles.cardTitle}>Punto de Venta</Text>
                        <Text style={styles.cardDesc}>Realiza ventas y genera boletas</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('Inventory')}
                    >
                        <Package color="#059669" size={48} />
                        <Text style={styles.cardTitle}>Inventario</Text>
                        <Text style={styles.cardDesc}>Revisa el stock de productos</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: {
        backgroundColor: '#ffffff',
        paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
    },
    greeting: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    role: { fontSize: 14, color: '#6b7280', marginTop: 4 },
    logoutBtn: { padding: 8 },
    content: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: {
        backgroundColor: '#ffffff',
        width: '48%',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
        marginBottom: 16
    },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginTop: 12, textAlign: 'center' },
    cardDesc: { fontSize: 12, color: '#6b7280', marginTop: 8, textAlign: 'center' }
});
