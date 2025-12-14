import { useState, useEffect, useCallback } from 'react';
import { getStudentInfo } from './studentService';

export const useStudentDashboardViewModel = () => {
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStudentData = useCallback(async () => {
    setError(null);
    try {
      const data = await getStudentInfo();
      setStudent(data);
    } catch (err) {
      console.error(err);
      setError('Could not load student profile.');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      setIsLoading(true);
      await fetchStudentData();
      if (isMounted) setIsLoading(false);
    };

    init();

    return () => { isMounted = false; };
  }, [fetchStudentData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStudentData();
    setIsRefreshing(false);
  };

  return {
    student,
    isLoading,
    error,
    isRefreshing,
    handleRefresh 
  };
};