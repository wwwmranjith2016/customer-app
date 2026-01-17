import React, { useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import AddressScreen from '../screens/cart/AddressScreen';
import PlaceOrderScreen from '../screens/cart/PlaceOrderScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import notificationService from '../services/notification.service';
import authService from '../services/auth.service';

export type RootStackParamList = {
  Main: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  Address: {
    phone: string;
    name?: string;
    addresses: any[];
    userId?: string;
  };
  PlaceOrder: {
    phone: string;
    name?: string;
    addressId?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  OrderDetail: { orderId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const navigationRef = useRef<any>();

  useEffect(() => {
    const setupNotifications = async () => {
      console.log('Setting up notifications...');
      // Setup notification handlers
      const unsubscribe = notificationService.setupNotificationHandlers(navigationRef.current);

      // If user is authenticated, register/update FCM token
      const authenticated = await authService.isAuthenticated();
      console.log('User authenticated:', authenticated);
      if (authenticated) {
        console.log('Registering FCM token...');
        await authService.registerFCMToken();
      }

      return unsubscribe;
    };

    const cleanup = setupNotifications();

    return () => {
      cleanup.then(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen 
          name="ProductDetail" 
          component={ProductDetailScreen}
          options={{ headerShown: true, title: 'Product Details' }}
        />
        <Stack.Screen 
          name="Cart" 
          component={CartScreen}
          options={{ headerShown: true, title: 'Shopping Cart' }}
        />
        <Stack.Screen 
          name="Checkout" 
          component={CheckoutScreen}
          options={{ headerShown: true, title: 'Checkout' }}
        />
        <Stack.Screen 
          name="Address" 
          component={AddressScreen}
          options={{ headerShown: true, title: 'Delivery Address' }}
        />
        <Stack.Screen 
          name="PlaceOrder" 
          component={PlaceOrderScreen}
          options={{ headerShown: true, title: 'Place Order' }}
        />
        <Stack.Screen 
          name="OrderDetail" 
          component={OrderDetailScreen}
          options={{ headerShown: true, title: 'Order Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
