/**
 * 应用状态管理 Hook
 * 提供便捷的状态管理接口
 */

import { useState, useEffect, useCallback } from 'react';
import stateService from '../services/StateService.js';
import bluetoothService from '../services/BluetoothService.js';
import testService from '../services/TestService.js';

/**
 * 主要的应用状态 Hook
 */
export function useAppState() {
  const [state, setState] = useState(stateService.getState());

  useEffect(() => {
    const handleStateChange = (data) => {
      setState(stateService.getState());
    };

    stateService.on('stateChanged', handleStateChange);

    return () => {
      stateService.off('stateChanged', handleStateChange);
    };
  }, []);

  return state;
}

/**
 * 蓝牙连接状态 Hook
 */
export function useBluetoothState() {
  const [bluetoothState, setBluetoothState] = useState(stateService.getState('bluetooth'));

  useEffect(() => {
    const handleStateChange = (data) => {
      if (data.section === 'bluetooth') {
        setBluetoothState(data.newState.bluetooth);
      }
    };

    stateService.on('stateChanged', handleStateChange);

    return () => {
      stateService.off('stateChanged', handleStateChange);
    };
  }, []);

  const scanDevices = useCallback(async () => {
    try {
      stateService.updateState('bluetooth', { isScanning: true });
      const device = await bluetoothService.scanDevices();
      return device;
    } catch (error) {
      stateService.updateState('bluetooth', { 
        isScanning: false,
        connectionError: error.message 
      });
      throw error;
    } finally {
      stateService.updateState('bluetooth', { isScanning: false });
    }
  }, []);

  const connectDevice = useCallback(async (device) => {
    try {
      stateService.setLoading(true);
      await bluetoothService.connect(device);
      stateService.addAlert({
        type: 'success',
        title: '连接成功',
        message: `已连接到设备: ${device.name}`,
        duration: 3000
      });
    } catch (error) {
      stateService.updateState('bluetooth', { 
        connectionError: error.message 
      });
      stateService.addAlert({
        type: 'error',
        title: '连接失败',
        message: error.message,
        duration: 5000
      });
      throw error;
    } finally {
      stateService.setLoading(false);
    }
  }, []);

  const disconnectDevice = useCallback(async () => {
    try {
      await bluetoothService.disconnect();
      stateService.addAlert({
        type: 'info',
        title: '已断开连接',
        message: '设备连接已断开',
        duration: 3000
      });
    } catch (error) {
      stateService.addAlert({
        type: 'error',
        title: '断开连接失败',
        message: error.message,
        duration: 5000
      });
      throw error;
    }
  }, []);

  return {
    ...bluetoothState,
    scanDevices,
    connectDevice,
    disconnectDevice
  };
}

/**
 * 测试状态 Hook
 */
export function useTestState() {
  const [testState, setTestState] = useState(stateService.getState('test'));

  useEffect(() => {
    const handleStateChange = (data) => {
      if (data.section === 'test') {
        setTestState(data.newState.test);
      }
    };

    stateService.on('stateChanged', handleStateChange);

    return () => {
      stateService.off('stateChanged', handleStateChange);
    };
  }, []);

  const startTest = useCallback(async (config) => {
    try {
      if (!stateService.getState('bluetooth').isConnected) {
        throw new Error('设备未连接');
      }

      const test = await testService.startTest(config);
      stateService.addAlert({
        type: 'success',
        title: '测试开始',
        message: `开始执行 ${config.testCount} 次测试`,
        duration: 3000
      });
      return test;
    } catch (error) {
      stateService.addAlert({
        type: 'error',
        title: '启动测试失败',
        message: error.message,
        duration: 5000
      });
      throw error;
    }
  }, []);

  const pauseTest = useCallback(() => {
    try {
      testService.pauseTest();
      stateService.addAlert({
        type: 'info',
        title: '测试已暂停',
        message: '测试已暂停，可以随时恢复',
        duration: 3000
      });
    } catch (error) {
      stateService.addAlert({
        type: 'error',
        title: '暂停测试失败',
        message: error.message,
        duration: 5000
      });
      throw error;
    }
  }, []);

  const resumeTest = useCallback(async () => {
    try {
      await testService.resumeTest();
      stateService.addAlert({
        type: 'success',
        title: '测试已恢复',
        message: '测试继续执行',
        duration: 3000
      });
    } catch (error) {
      stateService.addAlert({
        type: 'error',
        title: '恢复测试失败',
        message: error.message,
        duration: 5000
      });
      throw error;
    }
  }, []);

  const stopTest = useCallback(() => {
    try {
      testService.stopTest();
      stateService.addAlert({
        type: 'warning',
        title: '测试已停止',
        message: '测试已手动停止',
        duration: 3000
      });
    } catch (error) {
      stateService.addAlert({
        type: 'error',
        title: '停止测试失败',
        message: error.message,
        duration: 5000
      });
      throw error;
    }
  }, []);

  return {
    ...testState,
    startTest,
    pauseTest,
    resumeTest,
    stopTest
  };
}

/**
 * 设备状态 Hook
 */
export function useDeviceState() {
  const [deviceState, setDeviceState] = useState(stateService.getState('device'));

  useEffect(() => {
    const handleStateChange = (data) => {
      if (data.section === 'device') {
        setDeviceState(data.newState.device);
      }
    };

    stateService.on('stateChanged', handleStateChange);

    return () => {
      stateService.off('stateChanged', handleStateChange);
    };
  }, []);

  const refreshDeviceStatus = useCallback(async () => {
    try {
      if (!stateService.getState('bluetooth').isConnected) {
        throw new Error('设备未连接');
      }
      
      await bluetoothService.getDeviceStatus();
    } catch (error) {
      stateService.addAlert({
        type: 'error',
        title: '获取设备状态失败',
        message: error.message,
        duration: 5000
      });
      throw error;
    }
  }, []);

  return {
    ...deviceState,
    refreshDeviceStatus
  };
}

/**
 * UI状态 Hook
 */
export function useUIState() {
  const [uiState, setUIState] = useState(stateService.getState('ui'));

  useEffect(() => {
    const handleStateChange = (data) => {
      if (data.section === 'ui') {
        setUIState(data.newState.ui);
      }
    };

    stateService.on('stateChanged', handleStateChange);

    return () => {
      stateService.off('stateChanged', handleStateChange);
    };
  }, []);

  const addAlert = useCallback((alert) => {
    stateService.addAlert(alert);
  }, []);

  const removeAlert = useCallback((alertId) => {
    stateService.removeAlert(alertId);
  }, []);

  const clearAlerts = useCallback(() => {
    stateService.clearAlerts();
  }, []);

  const setActiveTab = useCallback((tab) => {
    stateService.setActiveTab(tab);
  }, []);

  const toggleModal = useCallback((modalName, isVisible) => {
    stateService.toggleModal(modalName, isVisible);
  }, []);

  const setLoading = useCallback((isLoading) => {
    stateService.setLoading(isLoading);
  }, []);

  return {
    ...uiState,
    addAlert,
    removeAlert,
    clearAlerts,
    setActiveTab,
    toggleModal,
    setLoading
  };
}

/**
 * 设置 Hook
 */
export function useSettings() {
  const [settings, setSettings] = useState(stateService.getState('settings'));

  useEffect(() => {
    const handleStateChange = (data) => {
      if (data.section === 'settings') {
        setSettings(data.newState.settings);
      }
    };

    stateService.on('stateChanged', handleStateChange);

    return () => {
      stateService.off('stateChanged', handleStateChange);
    };
  }, []);

  const updateSettings = useCallback((newSettings) => {
    stateService.updateSettings(newSettings);
  }, []);

  const resetSettings = useCallback(() => {
    stateService.resetSettings();
  }, []);

  return {
    ...settings,
    updateSettings,
    resetSettings
  };
}

/**
 * 测试历史 Hook
 */
export function useTestHistory() {
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTestHistory = useCallback(async () => {
    try {
      setLoading(true);
      const history = testService.getSavedTests();
      setTestHistory(history.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
    } catch (error) {
      stateService.addAlert({
        type: 'error',
        title: '加载测试历史失败',
        message: error.message,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTest = useCallback(async (testId) => {
    try {
      const success = testService.deleteTestResult(testId);
      if (success) {
        setTestHistory(prev => prev.filter(test => test.id !== testId));
        stateService.addAlert({
          type: 'success',
          title: '删除成功',
          message: '测试记录已删除',
          duration: 3000
        });
      }
    } catch (error) {
      stateService.addAlert({
        type: 'error',
        title: '删除失败',
        message: error.message,
        duration: 5000
      });
    }
  }, []);

  useEffect(() => {
    loadTestHistory();

    // 监听测试保存事件
    const handleTestSaved = () => {
      loadTestHistory();
    };

    testService.on('testSaved', handleTestSaved);

    return () => {
      testService.off('testSaved', handleTestSaved);
    };
  }, [loadTestHistory]);

  return {
    testHistory,
    loading,
    loadTestHistory,
    deleteTest
  };
}

/**
 * 连接摘要 Hook
 */
export function useConnectionSummary() {
  const [summary, setSummary] = useState(stateService.getConnectionSummary());

  useEffect(() => {
    const handleStateChange = () => {
      setSummary(stateService.getConnectionSummary());
    };

    stateService.on('stateChanged', handleStateChange);

    return () => {
      stateService.off('stateChanged', handleStateChange);
    };
  }, []);

  return summary;
}

/**
 * 测试摘要 Hook
 */
export function useTestSummary() {
  const [summary, setSummary] = useState(stateService.getTestSummary());

  useEffect(() => {
    const handleStateChange = () => {
      setSummary(stateService.getTestSummary());
    };

    stateService.on('stateChanged', handleStateChange);

    return () => {
      stateService.off('stateChanged', handleStateChange);
    };
  }, []);

  return summary;
}