import { useState, useCallback, useEffect } from 'react';
import { getStudentReport } from './adminService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const useAdminAttendanceReport = () => {
  const getCurrentDay = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const [students, setStudents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReport = useCallback(async (day) => {
    try {
      const data = await getStudentReport(day);
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleDayChange = (day) => {
    if (day === selectedDay) return;
    setSelectedDay(day);
    setIsLoading(true);
    fetchReport(day);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchReport(selectedDay);
  };

  useEffect(() => {
    fetchReport(selectedDay);
  }, []);

  return {
    students,
    selectedDay,
    daysList: DAYS,
    isLoading,
    isRefreshing,
    handleDayChange,
    handleRefresh
  };
};