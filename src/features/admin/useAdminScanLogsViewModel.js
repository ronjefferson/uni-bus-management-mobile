import { useState, useCallback, useEffect } from 'react';
import { getAdminScanLogs } from './adminService';

export const useAdminScanLogsViewModel = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [filters, setFilters] = useState({
    status: '',
    timestamp__date: '',
    student__university_id: '',
    bus_number: ''
  });

  const fetchLogs = useCallback(async (currentFilters = null) => {
    try {
      const activeFilters = currentFilters || filters;
      const data = await getAdminScanLogs(activeFilters);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatBusString = (val) => {
    if (!val) return val;
    const match = val.match(/\d+/);
    if (match) {
      return `BUS-${parseInt(match[0], 10).toString().padStart(2, '0')}`;
    }
    return val;
  };

  const normalizeBusFilter = () => {
    if (filters.bus_number) {
      const formatted = formatBusString(filters.bus_number);
      if (formatted !== filters.bus_number) {
        updateFilter('bus_number', formatted);
      }
    }
  };

  const applyFilters = () => {
    setIsLoading(true);
    const filtersToSend = { ...filters };
    if (filtersToSend.bus_number) {
      filtersToSend.bus_number = formatBusString(filtersToSend.bus_number);
      if (filtersToSend.bus_number !== filters.bus_number) {
        setFilters(prev => ({ ...prev, bus_number: filtersToSend.bus_number }));
      }
    }
    fetchLogs(filtersToSend);
  };

  const resetFilters = () => {
    const emptyFilters = {
      status: '',
      timestamp__date: '',
      student__university_id: '',
      bus_number: ''
    };
    setFilters(emptyFilters);
    setIsLoading(true);
    fetchLogs(emptyFilters);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLogs(filters);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    isLoading,
    isRefreshing,
    filters,
    updateFilter,
    normalizeBusFilter,
    applyFilters,
    resetFilters,
    handleRefresh
  };
};