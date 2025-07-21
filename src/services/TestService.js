/**
 * 测试服务模块
 * 负责管理测试流程、数据收集和分析
 */

import bluetoothService from './BluetoothService.js';

class TestService {
  constructor() {
    this.currentTest = null;
    this.testResults = [];
    this.isRunning = false;
    this.isPaused = false;
    this.listeners = new Map();
    
    // 绑定蓝牙事件
    this.bindBluetoothEvents();
  }

  /**
   * 初始化测试服务
   */
  initialize() {
    console.log('TestService initialized');
    // 服务已在构造函数中初始化
  }

  /**
   * 清理测试服务资源
   */
  cleanup() {
    if (this.isRunning) {
      this.stopTest();
    }
    this.listeners.clear();
    console.log('TestService cleaned up');
  }

  /**
   * 绑定蓝牙服务事件
   */
  bindBluetoothEvents() {
    bluetoothService.on('unlockResult', (result) => {
      this.handleUnlockResult(result);
    });

    bluetoothService.on('lockResult', (result) => {
      this.handleLockResult(result);
    });

    bluetoothService.on('disconnected', () => {
      this.handleDeviceDisconnected();
    });
  }

  /**
   * 开始测试
   */
  async startTest(config) {
    try {
      if (this.isRunning) {
        throw new Error('测试已在运行中');
      }

      if (!bluetoothService.isConnected) {
        throw new Error('设备未连接');
      }

      this.currentTest = {
        id: this.generateTestId(),
        config: { ...config },
        startTime: new Date(),
        endTime: null,
        currentCycle: 0,
        totalCycles: config.testCount || 100,
        successCount: 0,
        failureCount: 0,
        results: [],
        status: 'running'
      };

      this.isRunning = true;
      this.isPaused = false;

      this.emit('testStarted', this.currentTest);
      
      // 开始执行测试循环
      await this.runTestCycle();
      
      return this.currentTest;
    } catch (error) {
      console.error('开始测试失败:', error);
      throw error;
    }
  }

  /**
   * 暂停测试
   */
  pauseTest() {
    if (!this.isRunning) {
      throw new Error('没有正在运行的测试');
    }

    this.isPaused = true;
    this.currentTest.status = 'paused';
    this.emit('testPaused', this.currentTest);
  }

  /**
   * 恢复测试
   */
  async resumeTest() {
    if (!this.isRunning || !this.isPaused) {
      throw new Error('没有可恢复的测试');
    }

    this.isPaused = false;
    this.currentTest.status = 'running';
    this.emit('testResumed', this.currentTest);
    
    // 继续执行测试循环
    await this.runTestCycle();
  }

  /**
   * 停止测试
   */
  stopTest() {
    if (!this.isRunning) {
      throw new Error('没有正在运行的测试');
    }

    this.isRunning = false;
    this.isPaused = false;
    
    if (this.currentTest) {
      this.currentTest.endTime = new Date();
      this.currentTest.status = 'stopped';
      
      // 保存测试结果
      this.saveTestResult(this.currentTest);
      
      this.emit('testStopped', this.currentTest);
    }
  }

  /**
   * 执行测试循环
   */
  async runTestCycle() {
    while (this.isRunning && !this.isPaused && 
           this.currentTest.currentCycle < this.currentTest.totalCycles) {
      
      try {
        const cycleStartTime = Date.now();
        
        // 执行开锁测试
        const unlockResult = await this.performUnlockTest();
        
        // 等待间隔时间
        if (this.currentTest.config.interval) {
          await this.sleep(this.currentTest.config.interval);
        }
        
        // 执行锁定测试
        const lockResult = await this.performLockTest();
        
        const cycleEndTime = Date.now();
        const cycleDuration = cycleEndTime - cycleStartTime;
        
        // 记录测试结果
        const cycleResult = {
          cycle: this.currentTest.currentCycle + 1,
          unlockResult,
          lockResult,
          duration: cycleDuration,
          timestamp: new Date(cycleStartTime)
        };
        
        this.currentTest.results.push(cycleResult);
        this.currentTest.currentCycle++;
        
        // 更新统计信息
        if (unlockResult.success && lockResult.success) {
          this.currentTest.successCount++;
        } else {
          this.currentTest.failureCount++;
        }
        
        // 发送进度更新
        this.emit('testProgress', {
          test: this.currentTest,
          cycleResult,
          progress: (this.currentTest.currentCycle / this.currentTest.totalCycles) * 100
        });
        
      } catch (error) {
        console.error('测试循环执行失败:', error);
        this.currentTest.failureCount++;
        
        // 记录错误
        this.currentTest.results.push({
          cycle: this.currentTest.currentCycle + 1,
          error: error.message,
          timestamp: new Date()
        });
        
        this.currentTest.currentCycle++;
      }
    }
    
    // 测试完成
    if (this.isRunning && this.currentTest.currentCycle >= this.currentTest.totalCycles) {
      this.completeTest();
    }
  }

  /**
   * 执行开锁测试
   */
  async performUnlockTest() {
    const startTime = Date.now();
    
    try {
      await bluetoothService.sendUnlockCommand();
      
      // 等待响应（设置超时）
      const result = await this.waitForResponse('unlock', 5000);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      return {
        success: result.success,
        responseTime,
        error: result.error || null
      };
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      return {
        success: false,
        responseTime,
        error: error.message
      };
    }
  }

  /**
   * 执行锁定测试
   */
  async performLockTest() {
    const startTime = Date.now();
    
    try {
      await bluetoothService.sendLockCommand();
      
      // 等待响应（设置超时）
      const result = await this.waitForResponse('lock', 5000);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      return {
        success: result.success,
        responseTime,
        error: result.error || null
      };
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      return {
        success: false,
        responseTime,
        error: error.message
      };
    }
  }

  /**
   * 等待蓝牙响应
   */
  waitForResponse(type, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        bluetoothService.off(`${type}Result`, handler);
        reject(new Error('响应超时'));
      }, timeout);
      
      const handler = (result) => {
        clearTimeout(timer);
        bluetoothService.off(`${type}Result`, handler);
        resolve(result);
      };
      
      bluetoothService.on(`${type}Result`, handler);
    });
  }

  /**
   * 完成测试
   */
  completeTest() {
    this.isRunning = false;
    this.isPaused = false;
    
    if (this.currentTest) {
      this.currentTest.endTime = new Date();
      this.currentTest.status = 'completed';
      
      // 计算测试统计信息
      this.calculateTestStatistics();
      
      // 保存测试结果
      this.saveTestResult(this.currentTest);
      
      this.emit('testCompleted', this.currentTest);
    }
  }

  /**
   * 计算测试统计信息
   */
  calculateTestStatistics() {
    if (!this.currentTest || !this.currentTest.results.length) {
      return;
    }
    
    const results = this.currentTest.results.filter(r => !r.error);
    
    // 计算成功率
    const successRate = (this.currentTest.successCount / this.currentTest.currentCycle) * 100;
    
    // 计算平均响应时间
    const responseTimes = [];
    results.forEach(result => {
      if (result.unlockResult && result.unlockResult.responseTime) {
        responseTimes.push(result.unlockResult.responseTime);
      }
      if (result.lockResult && result.lockResult.responseTime) {
        responseTimes.push(result.lockResult.responseTime);
      }
    });
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
    
    // 计算测试持续时间
    const duration = this.currentTest.endTime - this.currentTest.startTime;
    
    this.currentTest.statistics = {
      successRate: Math.round(successRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime),
      totalDuration: duration,
      totalCycles: this.currentTest.currentCycle,
      successCount: this.currentTest.successCount,
      failureCount: this.currentTest.failureCount
    };
  }

  /**
   * 保存测试结果
   */
  saveTestResult(testResult) {
    try {
      // 保存到本地存储
      const savedTests = this.getSavedTests();
      savedTests.push(testResult);
      
      // 限制保存的测试数量（最多保存100个）
      if (savedTests.length > 100) {
        savedTests.splice(0, savedTests.length - 100);
      }
      
      localStorage.setItem('baguaFurnace_testResults', JSON.stringify(savedTests));
      
      this.emit('testSaved', testResult);
    } catch (error) {
      console.error('保存测试结果失败:', error);
    }
  }

  /**
   * 获取保存的测试结果
   */
  getSavedTests() {
    try {
      const saved = localStorage.getItem('baguaFurnace_testResults');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('读取保存的测试结果失败:', error);
      return [];
    }
  }

  /**
   * 删除测试结果
   */
  deleteTestResult(testId) {
    try {
      const savedTests = this.getSavedTests();
      const filteredTests = savedTests.filter(test => test.id !== testId);
      localStorage.setItem('baguaFurnace_testResults', JSON.stringify(filteredTests));
      
      this.emit('testDeleted', testId);
      return true;
    } catch (error) {
      console.error('删除测试结果失败:', error);
      return false;
    }
  }

  /**
   * 处理开锁结果
   */
  handleUnlockResult(result) {
    // 这里可以添加额外的处理逻辑
    console.log('收到开锁结果:', result);
  }

  /**
   * 处理锁定结果
   */
  handleLockResult(result) {
    // 这里可以添加额外的处理逻辑
    console.log('收到锁定结果:', result);
  }

  /**
   * 处理设备断开连接
   */
  handleDeviceDisconnected() {
    if (this.isRunning) {
      this.stopTest();
      this.emit('testInterrupted', '设备连接断开');
    }
  }

  /**
   * 生成测试ID
   */
  generateTestId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
    const randomStr = Math.random().toString(36).substr(2, 4); // 4位随机字符
    return `T${dateStr}${timeStr}${randomStr}`;
  }

  /**
   * 睡眠函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取当前测试状态
   */
  getCurrentTestStatus() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentTest: this.currentTest
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
const testService = new TestService();

export default testService;