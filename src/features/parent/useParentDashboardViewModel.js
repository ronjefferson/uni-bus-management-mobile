import { useState, useCallback, useEffect } from 'react';
import { getParentProfile } from './parentService';

const MOCK_NEWS = [
  {
    id: 1,
    category: 'Event',
    date: 'Dec 12, 2025',
    title: 'Winter Science Fair',
    content: 'Join us in the main hall for the annual Science Fair showcasing student projects from grades 9-12.',
    color: '#3B82F6' // Blue
  },
  {
    id: 2,
    category: 'Academic',
    date: 'Dec 10, 2025',
    title: 'Final Exam Schedule Released',
    content: 'The finalized schedule for the Fall semester examinations is now available on the student portal.',
    color: '#10B981' // Green
  },
  {
    id: 3,
    category: 'Sports',
    date: 'Dec 08, 2025',
    title: 'Football Team Regionals',
    content: 'Our varsity team has qualified for the regionals! Come support them this Friday at 6 PM.',
    color: '#F59E0B' // Orange
  },
  {
    id: 4,
    category: 'Announcement',
    date: 'Dec 05, 2025',
    title: 'Library Renovation Update',
    content: 'The west wing of the library will be closed for renovations until January 15th.',
    color: '#8B5CF6' // Purple
  }
];

export const useParentDashboardViewModel = () => {
  const [parentName, setParentName] = useState('');
  const [news, setNews] = useState(MOCK_NEWS);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const profileData = await getParentProfile();
      setParentName(profileData.first_name);
      // In a real app, you would fetch news here too
      setNews(MOCK_NEWS); 
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getCurrentDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    return new Date().toLocaleDateString(undefined, options);
  };

  return {
    parentName,
    news,
    currentDate: getCurrentDate(),
    isLoading,
    isRefreshing,
    handleRefresh
  };
};