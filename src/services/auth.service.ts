import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api';
import { AuthResponse, User, ApiResponse } from '../types';

class AuthService {
  async register(phone: string, password: string, name: string): Promise<AuthResponse> {
    const response = await apiService.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      { phone, password, name }
    );

    if (response.success && response.data) {
      await this.saveAuthData(response.data);
      await this.registerFCMToken();
      return response.data;
    }

    throw new Error(response.error || 'Registration failed');
  }

  async login(phone: string, password: string): Promise<AuthResponse> {
    const response = await apiService.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      { phone, password }
    );

    if (response.success && response.data) {
      await this.saveAuthData(response.data);
      await this.registerFCMToken();
      return response.data;
    }

    throw new Error(response.error || 'Login failed');
  }

  async registerFCMToken(): Promise<void> {
    try {
      const notificationService = (await import('./notification.service')).default;
      const fcmToken = await notificationService.getFCMToken();
      if (fcmToken) {
        await this.updateFcmToken(fcmToken);
      }
    } catch (error) {
      console.log('FCM token registration skipped:', error);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearAuthData();
    }
  }

  async saveAuthData(authData: AuthResponse): Promise<void> {
    await AsyncStorage.multiSet([
      ['accessToken', authData.accessToken],
      ['refreshToken', authData.refreshToken],
      ['user', JSON.stringify(authData.user)],
    ]);
  }

  async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  }

  async getCurrentUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  }

  async updateFcmToken(fcmToken: string): Promise<void> {
    console.log('Updating FCM token on server:', fcmToken);
    await apiService.put(API_ENDPOINTS.AUTH.FCM_TOKEN, { fcmToken });
  }
}

export default new AuthService();
