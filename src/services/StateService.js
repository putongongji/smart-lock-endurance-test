/**
 * 状态管理服务
 * 负责管理应用的全局状态
 */

import bluetoothService from './BluetoothService.js';
import testService from './TestService.js';

class StateService {
  constructor() {
    this.state = {
      // 蓝牙连接状态
      bluetooth: {
        isConnected: false,
        device: null,
        isScanning: false,
        availableDevices: [],
        connectionError: null
      },
      
      // 测试状态
      test: {
        isRunning: false,
        isPaused: false,
        currentTest: null,
        progress: 0,
        statistics: {
          totalTests: 0,
          successRate: 0,
          avgResponseTime: 0,
          lastTestDate: null
        }
      },
      
      // 设备状态
      device: {
        battery: 0,
        signalStrength: 0,
        temperature: 0,
        lockStatus: 'unknown', // 'locked', 'unlocked', 'unknown'
        lastUpdate: null
      },
      
      // 应用设置
      settings: {
        theme: 'light',
        language: 'zh-CN',
        notifications: true,
        autoSave: true,
        testConfig: {
          defaultTestCount: 100,
          defaultInterval: 1000,
          timeout: 5000
        }
      },
      
      // UI状态
      ui: {
        activeTab: 'dashboard',
        isLoading: false,
        alerts: [],
        modals: {
          deviceSelector: false,
          testConfig: false,
          settings: false
        }
      }
    };
    
    this.listeners = new Map();
    this.initializeServices();
    this.loadSettings();
  }

  /**
   * 初始化状态服务
   */
  initialize() {
    console.log('StateService initialized');
    // 初始化服务间的事件监听
    this.initializeServices();
  }

  /**
   * 清理状态服务资源
   */
  cleanup() {
    this.listeners.clear();
    console.log('StateService cleaned up');
  }

  /**
   * 初始化服务监听
   */
  initializeServices() {
    console.log('StateService.initializeServices() 开始初始化...');
    
    // 确保BluetoothService已初始化
    if (!bluetoothService.listeners) {
      console.warn('BluetoothService未正确初始化，尝试重新初始化...');
      bluetoothService.initialize();
    }
    
    // 监听蓝牙服务事件
    console.log('注册connected事件监听器...');
    bluetoothService.on('connected', (device) => {
      console.log('StateService收到connected事件:', device);
      console.log('更新前的蓝牙状态:', this.state.bluetooth);
      
      this.updateState('bluetooth', {
        isConnected: true,
        device: {
          id: device.id,
          name: device.name,
          battery: device.battery || 85,
          signalStrength: device.signalStrength || -45,
          temperature: device.temperature || 25
        },
        connectionError: null
      });
      
      // 同时更新设备状态
      this.updateState('device', {
        battery: device.battery || 85,
        signalStrength: device.signalStrength || -45,
        temperature: device.temperature || 25,
        lockStatus: device.lockStatus || 'locked',
        lastUpdate: new Date()
      });
      
      console.log('StateService更新后的蓝牙状态:', this.state.bluetooth);
      console.log('发送stateChanged事件...');
    });
    
    console.log('connected事件监听器注册完成');

    bluetoothService.on('disconnected', () => {
      this.updateState('bluetooth', {
        isConnected: false,
        device: null
      });
      
      this.updateState('device', {
        battery: 0,
        signalStrength: 0,
        temperature: 0,
        lockStatus: 'unknown',
        lastUpdate: null
      });
    });

    bluetoothService.on('statusUpdate', (status) => {
      this.updateState('device', {
        ...status,
        lastUpdate: new Date()
      });
    });

    bluetoothService.on('batteryUpdate', (battery) => {
      this.updateState('device', {
        battery: battery.level,
        lastUpdate: new Date()
      });
    });

    // 监听测试服务事件
    testService.on('testStarted', (test) => {
      this.updateState('test', {
        isRunning: true,
        isPaused: false,
        currentTest: test,
        progress: 0
      });
    });

    testService.on('testProgress', (data) => {
      this.updateState('test', {
        currentTest: data.test,
        progress: data.progress
      });
    });

    testService.on('testPaused', (test) => {
      this.updateState('test', {
        isPaused: true,
        currentTest: test
      });
    });

    testService.on('testResumed', (test) => {
      this.updateState('test', {
        isPaused: false,
        currentTest: test
      });
    });

    testService.on('testCompleted', (test) => {
      this.updateState('test', {
        isRunning: false,
        isPaused: false,
        currentTest: test,
        progress: 100
      });
      
      // 更新统计信息
      this.updateTestStatistics(test);
    });

    testService.on('testStopped', (test) => {
      this.updateState('test', {
        isRunning: false,
        isPaused: false,
        currentTest: test
      });
    });

    testService.on('testInterrupted', (reason) => {
      this.updateState('test', {
        isRunning: false,
        isPaused: false
      });
      
      this.addAlert({
        type: 'error',
        title: '测试中断',
        message: reason,
        duration: 5000
      });
    });
  }

  /**
   * 更新状态
   */
  updateState(section, updates) {
    const oldState = { ...this.state };
    
    if (section) {
      this.state[section] = {
        ...this.state[section],
        ...updates
      };
    } else {
      this.state = {
        ...this.state,
        ...updates
      };
    }
    
    console.log(`StateService.updateState - section: ${section}, updates:`, updates);
    console.log('stateChanged事件监听器数量:', this.listeners.has('stateChanged') ? this.listeners.get('stateChanged').length : 0);
    
    this.emit('stateChanged', {
      section,
      oldState,
      newState: this.state,
      updates
    });
    
    console.log('stateChanged事件已发送');
  }

  /**
   * 获取状态
   */
  getState(section = null) {
    if (section) {
      return this.state[section];
    }
    return this.state;
  }

  /**
   * 更新测试统计信息
   */
  updateTestStatistics(test) {
    const savedTests = testService.getSavedTests();
    const totalTests = savedTests.length;
    
    if (totalTests > 0) {
      const totalSuccessRate = savedTests.reduce((sum, t) => {
        return sum + (t.statistics?.successRate || 0);
      }, 0) / totalTests;
      
      const totalAvgResponseTime = savedTests.reduce((sum, t) => {
        return sum + (t.statistics?.avgResponseTime || 0);
      }, 0) / totalTests;
      
      this.updateState('test', {
        statistics: {
          totalTests,
          successRate: Math.round(totalSuccessRate * 100) / 100,
          avgResponseTime: Math.round(totalAvgResponseTime),
          lastTestDate: test.endTime
        }
      });
    }
  }

  /**
   * 添加警报 - 只显示关键通知
   */
  addAlert(alert) {
    // 定义关键通知类型
    const criticalTypes = ['error', 'warning'];
    const criticalMessages = [
      '连接失败', '设备断开', '测试失败', '电池电量低', 
      '设备错误', '超时', '异常', '故障'
    ];
    
    // 检查是否为关键通知
    const isCritical = criticalTypes.includes(alert.type) || 
                      criticalMessages.some(keyword => 
                        alert.message?.toLowerCase().includes(keyword.toLowerCase())
                      );
    
    // 只显示关键通知
    if (!isCritical) {
      return;
    }
    
    const alertWithId = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      ...alert
    };
    
    const currentAlerts = [...this.state.ui.alerts];
    currentAlerts.push(alertWithId);
    
    // 限制警报数量为5个
    if (currentAlerts.length > 5) {
      currentAlerts.splice(0, currentAlerts.length - 5);
    }
    
    this.updateState('ui', {
      alerts: currentAlerts
    });
    
    // 自动移除警报
    const duration = alert.duration || 5000; // 默认5秒
    setTimeout(() => {
      this.removeAlert(alertWithId.id);
    }, duration);
  }

  /**
   * 移除警报
   */
  removeAlert(alertId) {
    const currentAlerts = this.state.ui.alerts.filter(alert => alert.id !== alertId);
    this.updateState('ui', {
      alerts: currentAlerts
    });
  }

  /**
   * 清除所有警报
   */
  clearAlerts() {
    this.updateState('ui', {
      alerts: []
    });
  }

  /**
   * 设置加载状态
   */
  setLoading(isLoading) {
    this.updateState('ui', {
      isLoading
    });
  }

  /**
   * 设置活动标签
   */
  setActiveTab(tab) {
    this.updateState('ui', {
      activeTab: tab
    });
  }

  /**
   * 显示/隐藏模态框
   */
  toggleModal(modalName, isVisible = null) {
    const currentModals = { ...this.state.ui.modals };
    currentModals[modalName] = isVisible !== null ? isVisible : !currentModals[modalName];
    
    this.updateState('ui', {
      modals: currentModals
    });
  }

  /**
   * 更新设置
   */
  updateSettings(settings) {
    this.updateState('settings', settings);
    this.saveSettings();
  }

  /**
   * 保存设置到本地存储
   */
  saveSettings() {
    try {
      localStorage.setItem('baguaFurnace_settings', JSON.stringify(this.state.settings));
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  }

  /**
   * 从本地存储加载设置
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('baguaFurnace_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.updateState('settings', {
          ...this.state.settings,
          ...settings
        });
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }

  /**
   * 重置设置
   */
  resetSettings() {
    const defaultSettings = {
      theme: 'light',
      language: 'zh-CN',
      notifications: true,
      autoSave: true,
      testConfig: {
        defaultTestCount: 100,
        defaultInterval: 1000,
        timeout: 5000
      }
    };
    
    this.updateState('settings', defaultSettings);
    this.saveSettings();
  }

  /**
   * 获取设备连接状态摘要
   */
  getConnectionSummary() {
    const { bluetooth, device } = this.state;
    
    return {
      isConnected: bluetooth.isConnected,
      deviceName: bluetooth.device?.name || '未连接',
      battery: device.battery,
      signalStrength: device.signalStrength,
      lockStatus: device.lockStatus,
      lastUpdate: device.lastUpdate
    };
  }

  /**
   * 获取测试状态摘要
   */
  getTestSummary() {
    const { test } = this.state;
    
    return {
      isRunning: test.isRunning,
      isPaused: test.isPaused,
      progress: test.progress,
      currentTest: test.currentTest,
      statistics: test.statistics
    };
  }

  /**
   * 事件监听器管理
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('事件回调执行失败:', error);
        }
      });
    }
  }
}

// 创建单例实例
const stateService = new StateService();

export default stateService;