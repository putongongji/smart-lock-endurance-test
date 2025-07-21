/**
 * 蓝牙服务模块
 * 负责处理蓝牙设备的连接、通信和管理
 */

class BluetoothService {
  constructor() {
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.isConnected = false;
    this.listeners = new Map();
    
    // 智能锁服务UUID (示例)
    this.SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
    this.CHARACTERISTIC_UUID = '87654321-4321-4321-4321-cba987654321';
    
    // 模拟模式相关
    this.simulationMode = true; // 默认开启模拟模式
    this.simulatedDevices = [
      { 
        id: 'sim-001', 
        name: '智能锁-001', 
        battery: 85, 
        signalStrength: -45, 
        temperature: 25, 
        lockStatus: 'locked' 
      },
      { 
        id: 'sim-002', 
        name: '智能锁-002', 
        battery: 92, 
        signalStrength: -38, 
        temperature: 23, 
        lockStatus: 'unlocked' 
      },
      { 
        id: 'sim-003', 
        name: 'SmartLock-003', 
        battery: 67, 
        signalStrength: -52, 
        temperature: 27, 
        lockStatus: 'locked' 
      }
    ];
    this.currentSimulatedDevice = null;
  }

  /**
   * 初始化蓝牙服务
   */
  initialize() {
    console.log('BluetoothService initialized');
    // 可以在这里添加初始化逻辑
  }

  /**
   * 清理蓝牙服务资源
   */
  cleanup() {
    if (this.isConnected) {
      this.disconnect();
    }
    this.listeners.clear();
    console.log('BluetoothService cleaned up');
  }

  /**
   * 设置模拟模式
   */
  setSimulationMode(enabled) {
    this.simulationMode = enabled;
    console.log(`模拟模式${enabled ? '已开启' : '已关闭'}`);
  }

  /**
   * 获取模拟设备列表
   */
  getSimulatedDevices() {
    return this.simulatedDevices;
  }

  /**
   * 扫描蓝牙设备
   */
  async scanDevices() {
    if (this.simulationMode) {
      // 模拟模式：返回模拟设备列表
      console.log('模拟模式：返回模拟设备列表');
      return this.simulatedDevices;
    }

    try {
      if (!navigator.bluetooth) {
        throw new Error('此浏览器不支持Web Bluetooth API');
      }

      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [this.SERVICE_UUID] },
          { namePrefix: '智能锁' },
          { namePrefix: 'SmartLock' }
        ],
        optionalServices: [this.SERVICE_UUID]
      });

      return device;
    } catch (error) {
      console.error('扫描设备失败:', error);
      throw error;
    }
  }

  /**
   * 连接到蓝牙设备
   */
  async connect(device) {
    if (this.simulationMode) {
      // 模拟模式：模拟连接过程
      return this.simulateConnect(device);
    }

    try {
      this.device = device;
      
      // 监听设备断开连接事件
      device.addEventListener('gattserverdisconnected', () => {
        this.isConnected = false;
        this.emit('disconnected');
      });

      // 连接到GATT服务器
      this.server = await device.gatt.connect();
      
      // 获取服务
      const service = await this.server.getPrimaryService(this.SERVICE_UUID);
      
      // 获取特征值
      this.characteristic = await service.getCharacteristic(this.CHARACTERISTIC_UUID);
      
      // 启用通知
      await this.characteristic.startNotifications();
      
      // 监听数据变化
      this.characteristic.addEventListener('characteristicvaluechanged', (event) => {
        this.handleDataReceived(event.target.value);
      });

      this.isConnected = true;
      this.emit('connected', device);
      
      return true;
    } catch (error) {
      console.error('连接设备失败:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * 模拟连接设备
   */
  async simulateConnect(device) {
    try {
      console.log('开始模拟连接到设备:', device);
      console.log('当前模拟模式状态:', this.simulationMode);
      console.log('事件监听器数量:', this.listeners.size);
      
      // 模拟连接延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 设置当前模拟设备
      this.currentSimulatedDevice = device;
      this.device = {
        name: device.name,
        id: device.id,
        battery: device.battery,
        signalStrength: device.signalStrength,
        temperature: device.temperature,
        lockStatus: device.lockStatus,
        gatt: { connected: true }
      };
      
      this.isConnected = true;
      console.log(`模拟连接成功，设备信息:`, this.device);
      console.log('isConnected状态:', this.isConnected);
      console.log('发送connected事件...');
      
      // 检查是否有监听器
      if (this.listeners.has('connected')) {
        console.log('connected事件监听器数量:', this.listeners.get('connected').length);
      } else {
        console.warn('没有connected事件监听器!');
      }
      
      this.emit('connected', this.device);
      console.log('connected事件已发送');
      
      // 模拟初始状态更新
      setTimeout(() => {
        console.log('发送状态更新...');
        this.simulateStatusUpdate();
        this.simulateBatteryUpdate();
      }, 500);
      
      return true;
    } catch (error) {
      console.error('模拟连接失败:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * 断开连接
   */
  async disconnect() {
    try {
      if (this.simulationMode) {
        // 模拟断开连接
        console.log('模拟断开连接');
        await new Promise(resolve => setTimeout(resolve, 300));
      } else if (this.server && this.server.connected) {
        await this.server.disconnect();
      }
      
      this.isConnected = false;
      this.device = null;
      this.server = null;
      this.characteristic = null;
      this.currentSimulatedDevice = null;
      this.emit('disconnected');
    } catch (error) {
      console.error('断开连接失败:', error);
      throw error;
    }
  }

  /**
   * 发送开锁命令
   */
  async sendUnlockCommand() {
    if (!this.isConnected) {
      throw new Error('设备未连接');
    }

    if (this.simulationMode) {
      return this.simulateUnlockCommand();
    }

    if (!this.characteristic) {
      throw new Error('设备特征值未初始化');
    }

    try {
      const command = new TextEncoder().encode('UNLOCK');
      await this.characteristic.writeValue(command);
      return true;
    } catch (error) {
      console.error('发送开锁命令失败:', error);
      throw error;
    }
  }

  /**
   * 模拟开锁命令
   */
  async simulateUnlockCommand() {
    try {
      console.log('模拟发送开锁命令');
      
      // 模拟命令处理延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 更新模拟设备状态
      if (this.currentSimulatedDevice) {
        this.currentSimulatedDevice.status = 'unlocked';
      }
      
      // 模拟开锁结果响应
      const response = {
        type: 'unlock_result',
        success: Math.random() > 0.1, // 90% 成功率
        timestamp: Date.now(),
        message: '开锁成功'
      };
      
      setTimeout(() => {
        this.emit('unlockResult', response);
        this.simulateStatusUpdate();
      }, 200);
      
      return true;
    } catch (error) {
      console.error('模拟开锁命令失败:', error);
      throw error;
    }
  }

  /**
   * 发送锁定命令
   */
  async sendLockCommand() {
    if (!this.isConnected) {
      throw new Error('设备未连接');
    }

    if (this.simulationMode) {
      return this.simulateLockCommand();
    }

    if (!this.characteristic) {
      throw new Error('设备特征值未初始化');
    }

    try {
      const command = new TextEncoder().encode('LOCK');
      await this.characteristic.writeValue(command);
      return true;
    } catch (error) {
      console.error('发送锁定命令失败:', error);
      throw error;
    }
  }

  /**
   * 模拟锁定命令
   */
  async simulateLockCommand() {
    try {
      console.log('模拟发送锁定命令');
      
      // 模拟命令处理延迟
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // 更新模拟设备状态
      if (this.currentSimulatedDevice) {
        this.currentSimulatedDevice.status = 'locked';
      }
      
      // 模拟锁定结果响应
      const response = {
        type: 'lock_result',
        success: Math.random() > 0.05, // 95% 成功率
        timestamp: Date.now(),
        message: '锁定成功'
      };
      
      setTimeout(() => {
        this.emit('lockResult', response);
        this.simulateStatusUpdate();
      }, 200);
      
      return true;
    } catch (error) {
      console.error('模拟锁定命令失败:', error);
      throw error;
    }
  }

  /**
   * 获取设备状态
   */
  async getDeviceStatus() {
    if (!this.isConnected) {
      throw new Error('设备未连接');
    }

    if (this.simulationMode) {
      return this.simulateGetDeviceStatus();
    }

    if (!this.characteristic) {
      throw new Error('设备特征值未初始化');
    }

    try {
      const command = new TextEncoder().encode('STATUS');
      await this.characteristic.writeValue(command);
      // 状态会通过通知返回
    } catch (error) {
      console.error('获取设备状态失败:', error);
      throw error;
    }
  }

  /**
   * 模拟获取设备状态
   */
  async simulateGetDeviceStatus() {
    try {
      console.log('模拟获取设备状态');
      
      // 模拟查询延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTimeout(() => {
        this.simulateStatusUpdate();
        this.simulateBatteryUpdate();
      }, 100);
      
      return true;
    } catch (error) {
      console.error('模拟获取设备状态失败:', error);
      throw error;
    }
  }

  /**
   * 模拟状态更新
   */
  simulateStatusUpdate() {
    if (!this.currentSimulatedDevice) return;
    
    const response = {
      type: 'status',
      status: this.currentSimulatedDevice.status,
      timestamp: Date.now(),
      deviceId: this.currentSimulatedDevice.id,
      temperature: Math.round(20 + Math.random() * 10), // 20-30°C
      humidity: Math.round(40 + Math.random() * 20), // 40-60%
      signalStrength: Math.round(-40 - Math.random() * 20) // -40 to -60 dBm
    };
    
    this.emit('statusUpdate', response);
  }

  /**
   * 模拟电量更新
   */
  simulateBatteryUpdate() {
    if (!this.currentSimulatedDevice) return;
    
    // 模拟电量缓慢下降
    if (Math.random() < 0.1) {
      this.currentSimulatedDevice.battery = Math.max(0, this.currentSimulatedDevice.battery - 1);
    }
    
    const response = {
      type: 'battery',
      level: this.currentSimulatedDevice.battery,
      voltage: (3.0 + (this.currentSimulatedDevice.battery / 100) * 1.2).toFixed(2),
      timestamp: Date.now(),
      deviceId: this.currentSimulatedDevice.id
    };
    
    this.emit('batteryUpdate', response);
  }

  /**
   * 处理接收到的数据
   */
  handleDataReceived(value) {
    try {
      const data = new TextDecoder().decode(value);
      const response = JSON.parse(data);
      
      this.emit('dataReceived', response);
      
      // 根据响应类型触发特定事件
      switch (response.type) {
        case 'unlock_result':
          this.emit('unlockResult', response);
          break;
        case 'lock_result':
          this.emit('lockResult', response);
          break;
        case 'status':
          this.emit('statusUpdate', response);
          break;
        case 'battery':
          this.emit('batteryUpdate', response);
          break;
        default:
          console.log('未知响应类型:', response.type);
      }
    } catch (error) {
      console.error('解析接收数据失败:', error);
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      deviceName: this.device?.name || null,
      deviceId: this.device?.id || null
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
const bluetoothService = new BluetoothService();

export default bluetoothService;