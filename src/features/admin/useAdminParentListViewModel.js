import { useState, useCallback, useEffect } from 'react';
import { getAdminParents } from './adminService';

export const useAdminParentListViewModel = () => {
  const [parents, setParents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [selectedParent, setSelectedParent] = useState(null);

  const fetchParents = useCallback(async (query = '') => {
    try {
      const data = await getAdminParents(query);
      setParents(data);
    } catch (err) {
      console.error("Failed to fetch parents:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchParents(searchQuery);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleSelectParent = (parent) => {
    setSelectedParent(parent);
  };

  const handleCloseDetail = () => {
    setSelectedParent(null);
  };

  useEffect(() => {
    setIsLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchParents(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchParents]);

  return {
    parents,
    searchQuery,
    isLoading,
    isRefreshing,
    selectedParent,
    handleRefresh,
    handleSearch,
    handleSelectParent,
    handleCloseDetail
  };
};