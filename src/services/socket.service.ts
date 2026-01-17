import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

const getSocketUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://192.168.1.41:3000';
  }
  return 'http://192.168.1.41:3000';
};

const SOCKET_URL = getSocketUrl();

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(userId: string) {
    if (this.socket?.connected) {
      return;
    }

    console.log(`[SocketService] Connecting to socket server: ${SOCKET_URL} for user ${userId}`);
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      query: { userId, userType: 'customer' },
    });

    this.socket.on('connect', () => {
      console.log('✅ [SocketService] Socket connected successfully');
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`❌ [SocketService] Socket disconnected: ${reason}`);
    });

    this.socket.on('order:status-changed', (data) => {
      console.log('🔔 [SocketService] Order status update received:', JSON.stringify(data, null, 2));
      console.log('📢 [SocketService] Emitting orderStatusUpdate event to listeners');
      this.emit('orderStatusUpdate', data);
      console.log('📱 [SocketService] Sending FCM notification');
      this.sendFCMNotification(data);
    });

    this.socket.on('error', (error) => {
      console.error('⚠️ [SocketService] Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((callback) => {
      callback(data);
    });
  }

  joinOrderRoom(orderId: string) {
    this.socket?.emit('joinOrder', orderId);
  }

  leaveOrderRoom(orderId: string) {
    this.socket?.emit('leaveOrder', orderId);
  }

  private async sendFCMNotification(data: any) {
    try {
      console.log('🔄 [SocketService] Loading notification service');
      const notificationService = (await import('./notification.service')).default;
      console.log('📲 [SocketService] Getting FCM token');
      const fcmToken = await notificationService.getFCMToken();
      
      if (fcmToken) {
        console.log('📱 [SocketService] FCM token available, sending notification');
        const notificationData = {
          orderId: data.orderId,
          status: data.status,
        };
        
        await notificationService.sendNotification(
          fcmToken,
          'Order Status Update',
          `Your order status has been updated to ${data.status}`,
          notificationData
        );
        console.log('✅ [SocketService] FCM notification sent successfully');
      } else {
        console.log('❌ [SocketService] No FCM token available, cannot send notification');
      }
    } catch (error) {
      console.error('⚠️ [SocketService] Failed to send FCM notification:', error);
    }
  }
}

export default new SocketService();
