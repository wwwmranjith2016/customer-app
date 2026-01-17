import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance, AndroidVisibility } from '@notifee/react-native';

class NotificationService {
  async createNotificationChannels() {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'order_updates',
        name: 'Order Updates',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        vibrationPattern: [300, 500, 300, 500],
        visibility: AndroidVisibility.PUBLIC,
      });
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      await this.createNotificationChannels();
      
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } else {
        const authStatus = await messaging().requestPermission();
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async getFCMToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('Notification permission not granted');
        return null;
      }

      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      await AsyncStorage.setItem('fcm_token', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  setupNotificationHandlers(navigation: any) {
    console.log('Registering message handlers');
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app:', remoteMessage);
      this.handleNotification(remoteMessage, navigation);
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App opened from quit state:', remoteMessage);
          this.handleNotification(remoteMessage, navigation);
        }
      });

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('RECEIVED FOREGROUND NOTIFICATION:', JSON.stringify(remoteMessage, null, 2));
      
      if (remoteMessage.notification) {
        await notifee.displayNotification({
          title: remoteMessage.notification.title,
          body: remoteMessage.notification.body,
          android: {
            channelId: 'order_updates',
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
            },
            vibrationPattern: [300, 500, 300, 500],
            sound: 'default',
          },
        });
        
        Alert.alert(
          remoteMessage.notification.title || 'Notification',
          remoteMessage.notification.body || '',
          [
            { text: 'Dismiss', style: 'cancel' },
            {
              text: 'View',
              onPress: () => this.handleNotification(remoteMessage, navigation),
            },
          ]
        );
      }
    });

    return unsubscribe;
  }

  private handleNotification(remoteMessage: any, navigation: any) {
    const data = remoteMessage.data;
    
    if (data?.orderId) {
      navigation.navigate('OrderDetail', { orderId: data.orderId });
    } else if (data?.type === 'order_status') {
      navigation.navigate('Orders');
    }
  }

  async subscribeToTopic(topic: string) {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error('Failed to subscribe to topic:', error);
    }
  }

  async unsubscribeFromTopic(topic: string) {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error('Failed to unsubscribe from topic:', error);
    }
  }

  async sendNotification(
    token: string,
    title: string,
    body: string,
    data: any
  ): Promise<void> {
    try {
      await messaging().sendMessage({
        token,
        notification: {
          title,
          body,
        },
        data,
      });
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }
}

export default new NotificationService();
