import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api';
import { Order, ApiResponse, OrderCreateResponse } from '../types';

interface GuestOrderData {
  phone: string;
  name?: string;
  addressId?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: { productId: string; quantity: number }[];
  paymentMethod: 'COD' | 'CARD' | 'UPI';
  notes?: string;
}

class OrderService {
  async createOrder(data: GuestOrderData): Promise<OrderCreateResponse> {
    const response = await apiService.post<ApiResponse<OrderCreateResponse>>(
      API_ENDPOINTS.ORDERS.GUEST_CREATE,
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to create order');
  }

  async getUserOrders(): Promise<Order[]> {
    const response = await apiService.get<ApiResponse<Order[]>>(
      API_ENDPOINTS.ORDERS.LIST
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch orders');
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await apiService.get<ApiResponse<Order>>(
      API_ENDPOINTS.ORDERS.DETAILS(id)
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch order details');
  }

  async cancelOrder(id: string): Promise<Order> {
    const response = await apiService.put<ApiResponse<Order>>(
      API_ENDPOINTS.ORDERS.CANCEL(id)
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to cancel order');
  }
}

export default new OrderService();
