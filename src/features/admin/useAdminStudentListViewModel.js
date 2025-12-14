import { useState, useCallback, useEffect } from 'react';
import { getAdminStudents } from './adminService';

export const useAdminStudentListViewModel = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = useCallback(async (query = '') => {
    try {
      const data = await getAdminStudents(query);
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStudents(searchQuery);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
  };

  const handleCloseDetail = () => {
    setSelectedStudent(null);
  };

  useEffect(() => {
    setIsLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchStudents(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchStudents]);

  return {
    students,
    searchQuery,
    isLoading,
    isRefreshing,
    selectedStudent,
    handleRefresh,
    handleSearch,
    handleSelectStudent,
    handleCloseDetail
  };
};