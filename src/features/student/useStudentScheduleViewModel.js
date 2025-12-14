import { useState, useCallback, useEffect } from 'react';
import { getStudentSchedule, getStudentScanHistory } from './studentService';

export const useStudentScheduleViewModel = () => {
  const [scheduleData, setScheduleData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    status: '',
    direction: '',
    bus_number: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSchedule = useCallback(async () => {
    try {
      const data = await getStudentSchedule();
      setScheduleData(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchHistory = useCallback(async (currentFilters) => {
    setIsHistoryLoading(true);

    try {
      const cleanFilters = {};
      
      Object.keys(currentFilters).forEach(key => {
        let value = currentFilters[key];

        if (key === 'bus_number' && value && typeof value === 'string') {
          const trimmed = value.trim();
          if (/^\d+$/.test(trimmed)) {
            const num = parseInt(trimmed, 10);
            value = `BUS-${String(num).padStart(2, '0')}`;
          }
        }

        if (value && typeof value === 'string' && value.trim() !== '') {
          cleanFilters[key] = value;
        }
      });

      const data = await getStudentScanHistory(cleanFilters);
      setHistoryData(data);
      
    } catch (err) {
      console.error(err);
      if (isLoading) setError('Could not load bus history.');
    } finally {
      setIsHistoryLoading(false);
    }
  }, [isLoading]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchHistory(filters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      from_date: '',
      to_date: '',
      status: '',
      direction: '',
      bus_number: ''
    };
    setFilters(emptyFilters);
    fetchHistory(emptyFilters);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchSchedule(), 
      fetchHistory(filters)
    ]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    let isActive = true;

    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);

      await Promise.all([
        fetchSchedule(), 
        fetchHistory(filters)
      ]);

      if (isActive) setIsLoading(false);
    };

    loadInitialData();

    return () => { isActive = false; };
  }, []);

  return {
    courseName: scheduleData?.schedule_details?.course || 'N/A',
    year: scheduleData?.schedule_details?.year || 'N/A',
    activeDays: scheduleData?.schedule_details?.days_list || [],
    historyData,
    filters,
    updateFilter,
    applyFilters,
    resetFilters,
    isHistoryLoading,
    isLoading,
    error,
    isRefreshing,
    handleRefresh
  };
};