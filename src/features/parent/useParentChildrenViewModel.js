import { useState, useCallback, useEffect } from 'react';
import { getMyChildren } from './parentService';

export const useParentChildrenViewModel = () => {
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchChildren = useCallback(async () => {
    setError(null);
    try {
      const data = await getMyChildren();
      setChildren(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load children accounts.');
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchChildren();
    setIsRefreshing(false);
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchChildren();
      setIsLoading(false);
    };
    init();
  }, [fetchChildren]);

  return {
    children,
    isLoading,
    isRefreshing,
    error,
    handleRefresh
  };
};