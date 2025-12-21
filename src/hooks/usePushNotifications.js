import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { sendTokenToBackend } from '../services/notificationService';

export const usePushNotifications = () => {
  
  useEffect(() => {
    const configureNotifications = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          const fcmToken = await messaging().getToken();
          console.log("FCM Token:", fcmToken);

          await sendTokenToBackend(fcmToken);
        } else {
          console.log("Notification permission rejected");
        }
      } catch (error) {
        console.error("Notification setup failed:", error);
      }
    };

    configureNotifications();

    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', remoteMessage);
      
      const { title, body } = remoteMessage.notification || {};
      
      Alert.alert(
        title || "New Notification",
        body || "You have a new message",
        [{ text: "OK" }]
      );
    });

    const unsubscribeToken = messaging().onTokenRefresh(async (newToken) => {
      try {
        await sendTokenToBackend(newToken);
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeToken();
    };
  }, []);
};