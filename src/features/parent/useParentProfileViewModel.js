import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getParentProfile, linkStudentAccount } from './parentService';
import { logout } from '../auth/loginService';

export const useParentProfileViewModel = () => {
  const router = useRouter();
  const [parent, setParent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
 
  const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);
  

  const [linkForm, setLinkForm] = useState({
    child_university_id: '',
    child_registration_code: ''
  });

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getParentProfile();
      setParent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateForm = (key, value) => {
    setLinkForm(prev => ({ ...prev, [key]: value }));
  };

  const handleLinkSubmit = async () => {
    if (!linkForm.child_university_id || !linkForm.child_registration_code) {
      Alert.alert("Missing Information", "Please fill in both fields.");
      return;
    }

    setIsLinking(true);
    try {
      await linkStudentAccount(linkForm);
      Alert.alert("Success", "Child account linked successfully!");
      setIsLinkModalVisible(false);
      setLinkForm({ child_university_id: '', child_registration_code: '' });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to link account. Please check the ID and Code.");
    } finally {
      setIsLinking(false);
    }
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

  const handleLogout = () => {
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

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    parent,
    isLoading,
    isLinking,
    isLinkModalVisible,
    setLinkModalVisible: setIsLinkModalVisible,
    linkForm,
    handleUpdateForm,
    handleLinkSubmit,
    handleLogout
  };
};