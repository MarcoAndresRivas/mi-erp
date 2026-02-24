import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { usePosStore, Product } from '../store/posStore';
import { ArrowLeft, Package } from 'lucide-react-native';

export default function InventoryScreen({ navigation }: any) {
    const { products, isLoading, fetchProducts } = usePosStore();

    useEffect(() => {
        fetchProducts();
    }, []);

    const renderProduct = ({ item }: { item: Product }) => (
        <View style={styles.productCard}>
            <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.nombre}</Text>
                <Text style={styles.productCode}>Código: {item.codigo_barras || 'N/A'}</Text>
            </View>
            <View style={styles.stockBadge}>
                <Text style={styles.stockText}>{item.stock} en stock</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color="#111827" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Inventario</Text>
                <View style={{ width: 24 }} />
            </View>

            {isLoading ? (
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
    listContainer: { padding: 16, gap: 12 },
    productCard: {
        backgroundColor: '#ffffff', borderRadius: 12, padding: 16,
        flexDirection: 'row', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
    },
    productName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
    productCode: { fontSize: 12, color: '#6b7280', marginTop: 4 },
    stockBadge: { backgroundColor: '#e0e7ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    stockText: { fontSize: 14, fontWeight: 'bold', color: '#4338ca' }
});
