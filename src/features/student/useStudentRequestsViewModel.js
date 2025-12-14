import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { getStudentRequests, createStudentRequest } from './studentService';

export const useStudentRequestsViewModel = () => {
  const [requestsList, setRequestsList] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filters, setFilters] = useState({
    status: '',
    request_date__gte: '',
    request_date__lte: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [newRequestDate, setNewRequestDate] = useState(new Date());
  const [newRequestReason, setNewRequestReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCleanParams = (currentFilters, page) => {
    const params = { page };
    Object.keys(currentFilters).forEach(key => {
      if (currentFilters[key] && currentFilters[key].trim() !== '') {
        params[key] = currentFilters[key];
      }
    });
    return params;
  };

  const fetchRequests = useCallback(async (mode = 'initial', overrideFilters = null) => {
    if (mode === 'initial' && requestsList.length === 0) setIsLoading(true);
    if (mode === 'filter') setIsFiltering(true);
    
    setError(null);

    try {
      const activeFilters = overrideFilters || filters;
      const params = getCleanParams(activeFilters, 1);
      const data = await getStudentRequests(params);
      
      setRequestsList(data.results);
      setNextPageUrl(data.next);
      setCurrentPage(1);
      
    } catch (err) {
      console.error(err);
      setError('Could not load requests.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsFiltering(false);
    }
  }, [filters, requestsList.length]);

  const handleLoadMore = async () => {
    if (!nextPageUrl || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const params = getCleanParams(filters, nextPage);
      const data = await getStudentRequests(params);

      setRequestsList(prev => [...prev, ...data.results]);
      setNextPageUrl(data.next);
      setCurrentPage(nextPage);

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const submitRequest = async () => {
    if (!newRequestReason.trim()) {
      Alert.alert("Missing Info", "Please enter a reason for your request.");
      return false;
    }

    setIsSubmitting(true);

    try {
      const startDate = new Date(newRequestDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);

      const payload = {
        reason: newRequestReason,
        requested_valid_from: startDate.toISOString(),
        requested_valid_until: endDate.toISOString(),
      };

      await createStudentRequest(payload);
      
      Alert.alert("Success", "Request submitted successfully!");
      setNewRequestReason(''); 
      setNewRequestDate(new Date());
      
      fetchRequests('refresh'); 
      return true;

    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to create request. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchRequests('filter');
  };

  const resetFilters = () => {
    const emptyFilters = {
      status: '',
      request_date__gte: '',
      request_date__lte: '',
    };
    setFilters(emptyFilters);
    fetchRequests('filter', emptyFilters);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRequests('refresh');
  };

  useEffect(() => {
    fetchRequests('initial');
  }, []);

  return {
    requestsList,
    nextPageUrl,
    filters,
    updateFilter,
    applyFilters,
    resetFilters,
    isLoading,
    isFiltering,
    isLoadingMore,
    isRefreshing,
    error,
    handleRefresh,
    handleLoadMore,
    newRequestDate,
    setNewRequestDate,
    newRequestReason,
    setNewRequestReason,
    submitRequest,
    isSubmitting
  };
};