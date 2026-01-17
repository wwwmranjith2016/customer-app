import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { API_BASE_URL } from '../../config/api';
import PhoneInputModal from '../../components/PhoneInputModal';

type CheckoutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface UserData {
  id: string;
  phone: string;
  name: string;
  email?: string;
}

const CheckoutScreen = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  
  const [loading, setLoading] = useState(true);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      checkStoredPhone();
    }, [])
  );

  const checkStoredPhone = async () => {
    try {
      const storedPhone = await AsyncStorage.getItem('userPhone');
      if (storedPhone) {
        await checkPhoneExists(storedPhone);
      } else {
        setLoading(false);
        setShowPhoneModal(true);
      }
    } catch (error) {
      console.error('Error checking stored phone:', error);
      setLoading(false);
      setShowPhoneModal(true);
    }
  };

  const checkPhoneExists = async (phoneNumber: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user/${phoneNumber}`);
      const result = await response.json();
      
      if (result.success && result.data.exists) {
        const userData: UserData = result.data.user;
        const addresses: Address[] = result.data.addresses;
        
        navigation.replace('Address', {
          phone: phoneNumber,
          name: userData.name,
          addresses: addresses,
          userId: userData.id,
        });
      } else {
        setLoading(false);
        setShowPhoneModal(true);
      }
    } catch (error) {
      console.error('Error checking phone:', error);
      setLoading(false);
      setShowPhoneModal(true);
    }
  };

  const handlePhoneSubmit = async (phone: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user/${phone}`);
      const result = await response.json();
      
      if (result.success && result.data.exists) {
        const userData: UserData = result.data.user;
        const addresses: Address[] = result.data.addresses;
        
        setShowPhoneModal(false);
        navigation.replace('Address', {
          phone: phone,
          name: userData.name,
          addresses: addresses,
          userId: userData.id,
        });
      } else {
        setShowPhoneModal(false);
        navigation.replace('Address', {
          phone: phone,
          name: undefined,
          addresses: [],
          userId: undefined,
        });
      }
    } catch (error) {
      throw error;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PhoneInputModal
        visible={showPhoneModal}
        onClose={() => navigation.goBack()}
        onSubmit={handlePhoneSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default CheckoutScreen;
