import { useState } from 'react';
import { useRouter } from 'expo-router';
import { studentLogin, userLogin } from './loginService'; 

export const useLoginViewModel = () => {
  const router = useRouter();

  // Distinct inputs
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // 'student', 'parent', or 'admin'
  const [loginType, setLoginType] = useState('student');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. STUDENT FLOW (Email only)
      if (loginType === 'student') {
        if (!email) throw new Error('Please enter your email.');
        
        await studentLogin(email);
        router.replace('/(app)/(student)');
      } 
      
      // 2. PARENT FLOW (Email + Password)
      else if (loginType === 'parent') {
        if (!email || !password) throw new Error('Please enter email and password.');
        
        // Parents use Email as their identifier
        await userLogin(email, password); 
        router.replace('/(app)/(parent)');
      }

      // 3. ADMIN FLOW (Username + Password)
      else if (loginType === 'admin') {
        if (!username || !password) throw new Error('Please enter username and password.');
        
        // Admins use Username as their identifier
        await userLogin(username, password);
        router.replace('/(app)/(admin)');
      }

    } catch (err) {
      console.error("Login Error:", err);
      const msg = err.response?.data?.detail || err.message || "Login failed";
      setError(msg);
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