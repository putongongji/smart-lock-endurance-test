import { useState, useEffect, useCallback } from 'react';
import { TestService } from '../services/TestService';
import { useUIState } from './useUIState';

/**
 * Custom hook for managing test history data
 * Provides functionality for fetching, filtering, and managing historical test records
 */
export const useTestHistory = () => {
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateRange: { start: null, end: null },
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const { showAlert } = useUIState();

  // Load test history from storage
  const loadTestHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const history = await TestService.getTestHistory();
      setTestHistory(history);
    } catch (err) {
      setError(err.message);
      showAlert('Failed to load test history', 'error');
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  // Filter and sort test history based on current filters
  const filteredHistory = useState(() => {
    let filtered = [...testHistory];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(test => 
        test.deviceName?.toLowerCase().includes(searchLower) ||
        test.testType?.toLowerCase().includes(searchLower) ||
        test.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(test => test.status === filters.status);
    }

    // Apply date range filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(test => 
        new Date(test.startTime) >= new Date(filters.dateRange.start)
      );
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(test => 
        new Date(test.startTime) <= new Date(filters.dateRange.end)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.startTime);
          bValue = new Date(b.startTime);
          break;
        case 'duration':
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case 'attempts':
          aValue = a.totalAttempts || 0;
          bValue = b.totalAttempts || 0;
          break;
        case 'successRate':
          aValue = a.successRate || 0;
          bValue = b.successRate || 0;
          break;
        default:
          aValue = a.startTime;
          bValue = b.startTime;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [testHistory, filters])[0];

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Delete a test record
  const deleteTest = useCallback(async (testId) => {
    try {
      await TestService.deleteTestRecord(testId);
      setTestHistory(prev => prev.filter(test => test.id !== testId));
      showAlert('Test record deleted successfully', 'success');
    } catch (err) {
      showAlert('Failed to delete test record', 'error');
    }
  }, [showAlert]);

  // Delete multiple test records
  const deleteMultipleTests = useCallback(async (testIds) => {
    try {
      await Promise.all(testIds.map(id => TestService.deleteTestRecord(id)));
      setTestHistory(prev => prev.filter(test => !testIds.includes(test.id)));
      showAlert(`${testIds.length} test records deleted successfully`, 'success');
    } catch (err) {
      showAlert('Failed to delete test records', 'error');
    }
  }, [showAlert]);

  // Export test history to CSV
  const exportToCSV = useCallback((tests = filteredHistory) => {
    try {
      const csvContent = TestService.exportTestsToCSV(tests);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `test-history-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showAlert('Test history exported successfully', 'success');
    } catch (err) {
      showAlert('Failed to export test history', 'error');
    }
  }, [filteredHistory, showAlert]);

  // Get test statistics
  const getStatistics = useCallback(() => {
    const total = filteredHistory.length;
    const completed = filteredHistory.filter(test => test.status === 'completed').length;
    const failed = filteredHistory.filter(test => test.status === 'failed').length;
    const running = filteredHistory.filter(test => test.status === 'running').length;
    const paused = filteredHistory.filter(test => test.status === 'paused').length;

    return {
      total,
      completed,
      failed,
      running,
      paused,
      successRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0
    };
  }, [filteredHistory]);

  // Load test history on mount
  useEffect(() => {
    loadTestHistory();
  }, [loadTestHistory]);

  return {
    testHistory: filteredHistory,
    loading,
    error,
    filters,
    updateFilters,
    loadTestHistory,
    deleteTest,
    deleteMultipleTests,
    exportToCSV,
    statistics: getStatistics()
  };
};