import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api';
import { Product, ApiResponse } from '../types';

class ProductService {
  async getProducts(available?: boolean): Promise<Product[]> {
    const params = available !== undefined ? { available } : {};
    const response = await apiService.get<ApiResponse<Product[]>>(
      API_ENDPOINTS.PRODUCTS.LIST,
      params
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch products');
  }

  async getAllProducts(available?: boolean): Promise<Product[]> {
    return this.getProducts(available);
  }

  async getProductById(id: string): Promise<Product> {
    const response = await apiService.get<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.DETAILS(id)
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch product details');
  }
}

export default new ProductService();
