import { useState } from 'react';
import { useRouter } from 'expo-router';
import { studentLogin, userLogin } from './loginService'; 

export const useLoginViewModel = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [loginType, setLoginType] = useState('student');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (loginType === 'student') {
        if (!email) throw new Error('Please enter your email.');
        
        await studentLogin(email);
        router.replace('/(app)/(student)');
      } 
      
      else if (loginType === 'parent') {
        if (!email || !password) throw new Error('Please enter email and password.');
        
        await userLogin(email, password); 
        router.replace('/(app)/(parent)');
      }

      else if (loginType === 'admin') {
        if (!username || !password) throw new Error('Please enter username and password.');
        
        await userLogin(username, password);
        router.replace('/(app)/(admin)');
      }

    } catch (err) {
      if (loginType === 'student') {
        setError("Invalid student email");
      } else {
        const msg = err.response?.data?.detail || 
                    err.response?.data?.non_field_errors?.[0] || 
                    "Login failed. Please check your credentials.";
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email, setEmail,
    username, setUsername,
    password, setPassword,
    loginType, setLoginType,
    isLoading, error,
    handleLogin
  };
};