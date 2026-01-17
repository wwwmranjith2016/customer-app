import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../navigation/AppNavigator';

type AddressScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AddressScreenRouteProp = RouteProp<RootStackParamList, 'Address'>;

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

const AddressScreen = () => {
  const navigation = useNavigation<AddressScreenNavigationProp>();
  const route = useRoute<AddressScreenRouteProp>();
  
  const { phone, name, addresses, userId } = route.params;
  
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.length > 0 ? addresses[0].id : ''
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(addresses.length === 0);
  
  const [newName, setNewName] = useState(name || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const handleContinue = () => {
    if (showNewAddressForm) {
      if (!newName || !street || !city || !state || !zipCode) {
        Alert.alert('Error', 'Please fill all address fields');
        return;
      }
      
      navigation.navigate('PlaceOrder', {
        phone,
        name: newName,
        addressId: undefined,
        address: { street, city, state, zipCode },
      });
    } else {
      if (!selectedAddressId) {
        Alert.alert('Error', 'Please select an address');
        return;
      }
      
      navigation.navigate('PlaceOrder', {
        phone,
        name,
        addressId: selectedAddressId,
        address: undefined,
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {addresses.length > 0 && !showNewAddressForm ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Delivery Address</Text>
            
            {addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                style={[
                  styles.addressCard,
                  selectedAddressId === address.id && styles.addressCardSelected,
                ]}
                onPress={() => setSelectedAddressId(address.id)}
              >
                <View style={styles.addressCardHeader}>
                  <View style={styles.radioButton}>
                    {selectedAddressId === address.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={styles.addressLabel}>{address.label}</Text>
                </View>
                <Text style={styles.addressText}>{address.street}</Text>
                <Text style={styles.addressText}>
                  {address.city}, {address.state} {address.zipCode}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.addNewButton}
              onPress={() => setShowNewAddressForm(true)}
            >
              <Icon name="add-circle-outline" size={24} color="#e74c3c" />
              <Text style={styles.addNewButtonText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enter Delivery Address</Text>

            {!userId && (
              <>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  value={newName}
                  onChangeText={setNewName}
                />
              </>
            )}

            <Text style={styles.inputLabel}>Street Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="House no, Building, Street"
              value={street}
              onChangeText={setStreet}
              multiline
            />

            <Text style={styles.inputLabel}>City *</Text>
            <TextInput
              style={styles.input}
              placeholder="City"
              value={city}
              onChangeText={setCity}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>State *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="State"
                  value={state}
                  onChangeText={setState}
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>ZIP Code *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ZIP"
                  value={zipCode}
                  onChangeText={setZipCode}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>

            {addresses.length > 0 && (
              <TouchableOpacity
                style={styles.backToSavedButton}
                onPress={() => setShowNewAddressForm(false)}
              >
                <Icon name="arrow-back" size={20} color="#e74c3c" />
                <Text style={styles.backToSavedButtonText}>Use Saved Address</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue to Payment</Text>
          <Icon name="arrow-forward" size={20} color="#fff" />
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
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  addressCard: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  addressCardSelected: {
    borderColor: '#e74c3c',
    backgroundColor: '#fff5f5',
  },
  addressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e74c3c',
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 32,
    lineHeight: 20,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addNewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  backToSavedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
  },
  backToSavedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
    marginLeft: 8,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  continueButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default AddressScreen;
