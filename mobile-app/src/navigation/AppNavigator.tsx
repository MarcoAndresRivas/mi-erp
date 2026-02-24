import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import VendedorDashboardScreen from '../screens/VendedorDashboardScreen';
import POSScreen from '../screens/POSScreen';
import InventoryScreen from '../screens/InventoryScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, isLoading, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator id="app-navigator" screenOptions={{ headerShown: false }}>
                {!user ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : user.rol === 'Repartidor' ? (
                    <>
                        <Stack.Screen name="Dashboard" component={DashboardScreen} />
                        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="VendedorDashboard" component={VendedorDashboardScreen} />
                        <Stack.Screen name="POS" component={POSScreen} />
                        <Stack.Screen name="Inventory" component={InventoryScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
