import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getStudentInfo, getConnectedAccounts } from './studentService';
import { logout } from '../auth/loginService';

export const useStudentProfileViewModel = () => {
  const router = useRouter();
  
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getStudentInfo();
      setStudent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const handleOpenAccounts = async () => {
    setShowAccountsModal(true);
    
    if (connectedAccounts.length === 0) {
      setIsAccountsLoading(true);
      try {
        const data = await getConnectedAccounts();
        setConnectedAccounts(data);
      } catch (err) {
        console.error("Failed to load parents", err);
        Alert.alert("Error", "Could not load connected accounts.");
      } finally {
        setIsAccountsLoading(false);
      }
    }
  };

  const handleCloseAccounts = () => {
    setShowAccountsModal(false);
  };

  const handleLogoutPress = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: performLogout }
    ]);
  };

  const performLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.warn("Logout failed, navigating anyway");
    } finally {
      router.replace('/(auth)'); 
    }
  };

  return {
    student,
    isLoading,
    handleLogoutPress,
    connectedAccounts,
    isAccountsLoading,
    showAccountsModal,
    handleOpenAccounts,
    handleCloseAccounts
  };
};