export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface OrderCreateResponse {
  order: Order;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  unit: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  addressId: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: 'COD' | 'CARD' | 'UPI';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  notes?: string;
  estimatedDeliveryTime?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  address: Address;
}

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PREPARED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Notification {
  id: string;
  userId: string;
  orderId?: string;
  title: string;
  body: string;
  type: 'ORDER_STATUS' | 'PROMOTIONAL' | 'SYSTEM';
  read: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
