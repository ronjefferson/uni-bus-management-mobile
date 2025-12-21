import { useState } from 'react';
import { Alert } from 'react-native';
import { registerParent } from './loginService';

export const useParentRegisterViewModel = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    child_university_id: '',
    child_registration_code: ''
  });

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setError(null);
  };

  const validate = () => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.phone_number) {
      setError("Please fill in all personal details.");
      return false;
    }
    if (!formData.child_university_id || !formData.child_registration_code) {
      setError("Child verification details are required.");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setError(null);

    try {
      await registerParent(formData);
      Alert.alert(
        "Success", 
        "Account created successfully! Please log in.",
        [{ text: "OK", onPress: () => {
            setFormData({
                email: '', password: '', first_name: '', last_name: '', 
                phone_number: '', child_university_id: '', child_registration_code: ''
            });
            if (onSuccess) onSuccess();
        }}]
      );
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || "Registration failed. Please check your inputs.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    handleRegister,
    isLoading,
    error,
    setError
  };
};