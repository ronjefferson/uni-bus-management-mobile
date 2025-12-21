import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { logout } from '../auth/loginService';

export const useAdminDashboardViewModel = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const performLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (err) {
      console.warn("Logout failed, navigating anyway");
    } finally {
      setIsLoading(false);
      // Navigate back to the auth group (Login screen)
      router.replace('/(auth)'); 
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(
      "Log Out", 
      "Are you sure you want to log out?", 
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: performLogout 
        }
      ]
    );
  };

  return {
    isLoading,
    handleLogoutPress,
  };
};