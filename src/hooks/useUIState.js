import { useState, useCallback, useContext, createContext } from 'react';

// Create UI State Context
const UIStateContext = createContext();

/**
 * UI State Provider Component
 * Provides global UI state management for alerts, modals, loading states, etc.
 */
export const UIStateProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [modals, setModals] = useState({});
  const [loading, setLoading] = useState({});
  const [theme, setTheme] = useState('light');

  // Alert management
  const showAlert = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const alert = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      timestamp: new Date().toISOString()
    };
    
    setAlerts(prev => [...prev, alert]);
    
    if (duration > 0) {
      setTimeout(() => {
        dismissAlert(id);
      }, duration);
    }
    
    return id;
  }, []);

  const dismissAlert = useCallback((alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Modal management
  const showModal = useCallback((modalId, props = {}) => {
    setModals(prev => ({
      ...prev,
      [modalId]: { visible: true, props }
    }));
  }, []);

  const hideModal = useCallback((modalId) => {
    setModals(prev => ({
      ...prev,
      [modalId]: { visible: false, props: {} }
    }));
  }, []);

  const isModalVisible = useCallback((modalId) => {
    return modals[modalId]?.visible || false;
  }, [modals]);

  const getModalProps = useCallback((modalId) => {
    return modals[modalId]?.props || {};
  }, [modals]);

  // Loading state management
  const setLoadingState = useCallback((key, isLoading) => {
    setLoading(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const isLoading = useCallback((key) => {
    return loading[key] || false;
  }, [loading]);

  // Theme management
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const value = {
    // Alert state and methods
    alerts,
    showAlert,
    dismissAlert,
    clearAllAlerts,
    
    // Modal state and methods
    modals,
    showModal,
    hideModal,
    isModalVisible,
    getModalProps,
    
    // Loading state and methods
    loading,
    setLoadingState,
    isLoading,
    
    // Theme state and methods
    theme,
    setTheme,
    toggleTheme
  };

  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
};

/**
 * Custom hook for accessing UI state
 * Provides access to global UI state and methods for managing alerts, modals, loading states, etc.
 */
export const useUIState = () => {
  const context = useContext(UIStateContext);
  
  if (!context) {
    // Fallback implementation when used outside of provider
    const [alerts, setAlerts] = useState([]);
    const [modals, setModals] = useState({});
    const [loading, setLoading] = useState({});
    const [theme, setTheme] = useState('light');

    const showAlert = useCallback((message, type = 'info', duration = 5000) => {
      const id = Date.now() + Math.random();
      const alert = {
        id,
        message,
        type,
        timestamp: new Date().toISOString()
      };
      
      setAlerts(prev => [...prev, alert]);
      
      if (duration > 0) {
        setTimeout(() => {
          setAlerts(prev => prev.filter(a => a.id !== id));
        }, duration);
      }
      
      return id;
    }, []);

    const dismissAlert = useCallback((alertId) => {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }, []);

    const clearAllAlerts = useCallback(() => {
      setAlerts([]);
    }, []);

    const showModal = useCallback((modalId, props = {}) => {
      setModals(prev => ({
        ...prev,
        [modalId]: { visible: true, props }
      }));
    }, []);

    const hideModal = useCallback((modalId) => {
      setModals(prev => ({
        ...prev,
        [modalId]: { visible: false, props: {} }
      }));
    }, []);

    const isModalVisible = useCallback((modalId) => {
      return modals[modalId]?.visible || false;
    }, [modals]);

    const getModalProps = useCallback((modalId) => {
      return modals[modalId]?.props || {};
    }, [modals]);

    const setLoadingState = useCallback((key, isLoading) => {
      setLoading(prev => ({
        ...prev,
        [key]: isLoading
      }));
    }, []);

    const isLoading = useCallback((key) => {
      return loading[key] || false;
    }, [loading]);

    const toggleTheme = useCallback(() => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }, []);

    return {
      alerts,
      showAlert,
      dismissAlert,
      clearAllAlerts,
      modals,
      showModal,
      hideModal,
      isModalVisible,
      getModalProps,
      loading,
      setLoadingState,
      isLoading,
      theme,
      setTheme,
      toggleTheme
    };
  }
  
  return context;
};