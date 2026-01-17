import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../../contexts/CartContext';
import { RootStackParamList } from '../../navigation/AppNavigator';
import orderService from '../../services/order.service';
import authService from '../../services/auth.service';
import notificationService from '../../services/notification.service';

type PlaceOrderScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PlaceOrderScreenRouteProp = RouteProp<RootStackParamList, 'PlaceOrder'>;

const PlaceOrderScreen = () => {
  const navigation = useNavigation<PlaceOrderScreenNavigationProp>();
  const route = useRoute<PlaceOrderScreenRouteProp>();
  const { items, getTotal, clearCart } = useCart();

  const { phone, name, addressId, address } = route.params;

  const [selectedPayment, setSelectedPayment] = useState<'COD' | 'CARD' | 'UPI'>('COD');
  const [loading, setLoading] = useState(false);

  const subtotal = getTotal();
  const deliveryFee = 50;
  const tax = subtotal * 0.05;
  const total = subtotal + deliveryFee + tax;

  const paymentMethods = [
    { id: 'COD', label: 'Cash on Delivery', icon: 'cash-outline' },
    { id: 'CARD', label: 'Credit/Debit Card', icon: 'card-outline' },
    { id: 'UPI', label: 'UPI Payment', icon: 'phone-portrait-outline' },
  ];

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }

    const fcmToken = await notificationService.getFCMToken();

    let orderData: any = {
      phone,
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      paymentMethod: selectedPayment,
      notes: '',
      fcmToken: fcmToken || undefined,
    };

    if (addressId) {
      orderData.addressId = addressId;
    } else {
      if (!name || !address) {
        Alert.alert('Error', 'Name and address are required for new orders');
        return;
      }
      orderData.name = name;
      orderData.address = address;
    }

    console.log('Order data being sent:', JSON.stringify(orderData, null, 2));

    setLoading(true);
    try {
      const response = await orderService.createOrder(orderData);
      const { order, accessToken, refreshToken, user } = response;

      await AsyncStorage.setItem('userPhone', phone);
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // Register FCM token after login/order placement
      await authService.registerFCMToken();

      clearCart();

      Alert.alert(
        'Order Placed Successfully!',
        `Order #${order.orderNumber} has been placed`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Main'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Order error:', error);
      Alert.alert('Order Failed', error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="cart-outline" size={20} color="#e74c3c" />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>
          {items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.itemName}>
                {item.product.name} x {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                ₹{(item.product.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="card-outline" size={20} color="#e74c3c" />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                selectedPayment === method.id && styles.paymentOptionSelected,
              ]}
              onPress={() => setSelectedPayment(method.id as any)}
            >
              <View style={styles.paymentLeft}>
                <Icon
                  name={method.icon as any}
                  size={24}
                  color={selectedPayment === method.id ? '#e74c3c' : '#666'}
                />
                <Text
                  style={[
                    styles.paymentLabel,
                    selectedPayment === method.id && styles.paymentLabelSelected,
                  ]}
                >
                  {method.label}
                </Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedPayment === method.id && styles.radioButtonSelected,
                ]}
              >
                {selectedPayment === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="receipt-outline" size={20} color="#e74c3c" />
            <Text style={styles.sectionTitle}>Bill Summary</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValue}>₹{deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Tax (5%)</Text>
            <Text style={styles.billValue}>₹{tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.billRow, styles.billRowTotal]}>
            <Text style={styles.billLabelTotal}>Total</Text>
            <Text style={styles.billValueTotal}>₹{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
              <Icon name="checkmark-circle" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentOptionSelected: {
    borderColor: '#e74c3c',
    backgroundColor: '#fff5f5',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  paymentLabelSelected: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#e74c3c',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e74c3c',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  billLabel: {
    fontSize: 14,
    color: '#666',
  },
  billValue: {
    fontSize: 14,
    color: '#333',
  },
  billRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
    paddingTop: 12,
  },
  billLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  billValueTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  placeOrderButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default PlaceOrderScreen;
