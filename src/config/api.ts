import { Platform } from 'react-native';

const getLocalApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://192.168.1.41:3000/api';
  }
  return 'http://192.168.1.41:3000/api';
};

export const API_BASE_URL = getLocalApiUrl();

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    FCM_TOKEN: '/auth/fcm-token',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAILS: (id: string) => `/products/${id}`,
  },
  ORDERS: {
    GUEST_CREATE: '/orders/guest',
    CREATE: '/orders',
    LIST: '/orders',
    DETAILS: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },
  ADDRESSES: {
    LIST: '/addresses',
    CREATE: '/addresses',
    UPDATE: (id: string) => `/addresses/${id}`,
    DELETE: (id: string) => `/addresses/${id}`,
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
};
