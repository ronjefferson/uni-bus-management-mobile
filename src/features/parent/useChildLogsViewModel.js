import { useState, useCallback, useEffect } from 'react';
import { getChildLogs } from './parentService';

export const useChildLogsViewModel = (studentId) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    status: '',
    direction: '',
    bus_number: ''
  });

  const fetchLogs = useCallback(async (currentFilters = null) => {
    if (!studentId) return;
    
    setError(null);
    try {
      const activeFilters = currentFilters || filters;
      const data = await getChildLogs(studentId, activeFilters);
      setLogs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load logs.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [studentId, filters]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Helper to format bus number (e.g., "1" -> "BUS-01")
  const formatBusString = (val) => {
    if (!val) return val;
    const match = val.match(/\d+/);
    if (match) {
      return `BUS-${parseInt(match[0], 10).toString().padStart(2, '0')}`;
    }
    return val;
  };

  // Called onEndEditing to update UI state
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
    
    // Create a copy of filters to ensure we send formatted data
    // even if the user didn't trigger onEndEditing (e.g. typed and hit Apply immediately)
    const filtersToSend = { ...filters };
    if (filtersToSend.bus_number) {
      filtersToSend.bus_number = formatBusString(filtersToSend.bus_number);
      // Sync state if it changed
      if (filtersToSend.bus_number !== filters.bus_number) {
        setFilters(prev => ({ ...prev, bus_number: filtersToSend.bus_number }));
      }
    }

    fetchLogs(filtersToSend);
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
    setIsLoading(true);
    fetchLogs(emptyFilters);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLogs(filters);
  };

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    
    getChildLogs(studentId, {})
      .then(data => {
        if (mounted) {
          setLogs(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          console.error(err);
          setIsLoading(false);
        }
      });

    return () => { mounted = false; };
  }, [studentId]);

  return {
    logs,
    isLoading,
    isRefreshing,
    error,
    filters,
    updateFilter,
    normalizeBusFilter, // Exposed for UI event
    applyFilters,
    resetFilters,
    handleRefresh
  };
};