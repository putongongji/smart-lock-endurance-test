import React, { useState } from 'react'
import { Play, Pause, Square, Settings, Bluetooth, Battery, Wifi, AlertTriangle, CheckCircle, Clock, RotateCcw, Zap } from 'lucide-react'
import { useTestState, useBluetoothState, useUIState, useSettings } from '../hooks/useAppState'
import TestConfigModal from '../components/TestConfigModal'
import DeviceSelector from '../components/DeviceSelector'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'

const TestControl = () => {
  const {
    isRunning,
    isPaused,
    currentTest,
    progress,
    statistics,
    startTest,
    pauseTest,
    resumeTest,
    stopTest
  } = useTestState()
  
  const {
    isConnected,
    device: connectedDevice,
    isScanning,
    scanDevices,
    connectDevice,
    disconnectDevice
  } = useBluetoothState()
  
  const {
    modals,
    toggleModal,
    alerts,
    addAlert,
    removeAlert
  } = useUIState()
  
  const { testConfig } = useSettings()
  

  
  // 预测试检查
  const performPreCheck = () => {
    if (!isConnected) {
      addAlert('error', '设备未连接，请先连接蓝牙设备')
      return false
    }
    if (connectedDevice?.battery < 20) {
      addAlert('warning', '设备电量低于20%，建议充电后再进行测试')
    }
    if (connectedDevice?.signalStrength < -70) {
      addAlert('warning', '信号强度较弱，可能影响测试结果')
    }
    return true
  }
  
  // 开始测试处理
  const handleStartTest = async () => {
    if (!performPreCheck()) return
    
    try {
      // 尝试从本地存储加载配置，如果没有则使用默认配置
      let savedConfig = null;
      try {
        const savedSettings = localStorage.getItem('baguaFurnace_settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          if (parsedSettings.testConfig) {
            savedConfig = {
              testCount: parsedSettings.testConfig.defaultTestCount || testConfig.defaultTestCount || 100,
              interval: parsedSettings.testConfig.defaultInterval || testConfig.defaultInterval || 1000,
              timeout: parsedSettings.testConfig.timeout || testConfig.timeout || 5000,
              enableRetry: true,
              maxRetries: 3,
              retryDelay: 500
            };
          }
        }
      } catch (e) {
        console.error('加载保存的配置失败:', e);
      }
      
      // 如果没有保存的配置，使用默认配置
      const configToUse = savedConfig || {
        testCount: testConfig.defaultTestCount || 100,
        interval: testConfig.defaultInterval || 1000,
        timeout: testConfig.timeout || 5000,
        enableRetry: true,
        maxRetries: 3,
        retryDelay: 500
      };
      
      console.log('使用的测试配置:', configToUse);
      await startTest(configToUse);
      addAlert('success', '测试已开始');
    } catch (error) {
      addAlert('error', `启动测试失败: ${error.message}`);
    }
  }
  
  // 配置测试处理
  const handleConfigTest = async (config) => {
    if (!performPreCheck()) return
    
    try {
      await startTest(config)
      addAlert('success', '测试已开始')
      toggleModal('testConfig', false)
    } catch (error) {
      addAlert('error', `启动测试失败: ${error.message}`)
    }
  }
  
  // 暂停测试
  const handlePauseTest = async () => {
    try {
      await pauseTest()
      addAlert('info', '测试已暂停')
    } catch (error) {
      addAlert('error', `暂停测试失败: ${error.message}`)
    }
  }
  
  // 恢复测试
  const handleResumeTest = async () => {
    try {
      await resumeTest()
      addAlert('success', '测试已恢复')
    } catch (error) {
      addAlert('error', `恢复测试失败: ${error.message}`)
    }
  }
  
  // 停止测试
  const handleStopTest = async () => {
    try {
      await stopTest()
      addAlert('info', '测试已停止')
    } catch (error) {
      addAlert('error', `停止测试失败: ${error.message}`)
    }
  }
  
  // 连接设备
  const handleConnectDevice = () => {
    toggleModal('deviceSelector', true)
  }
  
  // 断开设备
  const handleDisconnectDevice = async () => {
    try {
      await disconnectDevice()
      addAlert('info', '设备已断开连接')
    } catch (error) {
      addAlert('error', `断开连接失败: ${error.message}`)
    }
  }
  
  // 格式化时间
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  // 格式化持续时间
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000)
    return formatTime(seconds)
  }
  
  // 计算预估剩余时间
  const getEstimatedTimeRemaining = () => {
    if (!currentTest || !isRunning) return '未知'
    if (currentTest.currentCycle === 0) return '计算中...'
    
    const remaining = currentTest.totalCycles - currentTest.currentCycle
    const avgCycleTime = currentTest.elapsedTime / currentTest.currentCycle
    
    if (!avgCycleTime || isNaN(avgCycleTime)) return '计算中...'
    
    const estimatedMs = remaining * avgCycleTime
    return formatDuration(estimatedMs)
  }

  const getProgressPercentage = () => {
    if (!currentTest) return 0
    return (currentTest.currentCycle / currentTest.totalCycles) * 100
  }

  const getSuccessRate = () => {
    if (!statistics || !statistics.totalAttempts || statistics.totalAttempts === 0) return 0
    const rate = (statistics.successCount / statistics.totalAttempts) * 100
    return isNaN(rate) ? 0 : rate
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* 警报容器 */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            type={alert.type}
            title={alert.title}
            message={alert.message}
            timestamp={alert.timestamp}
            onClose={() => removeAlert(alert.id)}
          />
        ))}
      </div>

      {/* 设备状态卡片 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">设备状态</h2>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            <Bluetooth className="w-4 h-4" />
            <span>{isConnected ? '已连接' : '未连接'}</span>
          </div>
        </div>
        
        {isConnected && connectedDevice ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-600">设备名称</span>
              <span className="font-medium text-slate-800">{connectedDevice.name || '未知设备'}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <Battery className={`w-6 h-6 mx-auto mb-2 ${
                  connectedDevice.battery > 50 ? 'text-green-600' :
                  connectedDevice.battery > 20 ? 'text-yellow-600' : 'text-red-600'
                }`} />
                <div className="text-2xl font-bold text-slate-800">{connectedDevice.battery || 0}%</div>
                <div className="text-sm text-slate-600">电池电量</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <Wifi className={`w-6 h-6 mx-auto mb-2 ${
                  connectedDevice.signalStrength > -50 ? 'text-green-600' :
                  connectedDevice.signalStrength > -70 ? 'text-yellow-600' : 'text-red-600'
                }`} />
                <div className="text-2xl font-bold text-slate-800">{connectedDevice.signalStrength || -50} dBm</div>
                <div className="text-sm text-slate-600">信号强度</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <Zap className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                <div className="text-2xl font-bold text-slate-800">{connectedDevice.temperature || 25}°C</div>
                <div className="text-sm text-slate-600">设备温度</div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleDisconnectDevice}
                className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors"
              >
                断开连接
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Bluetooth className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 mb-4">未连接设备</p>
            <button
              onClick={handleConnectDevice}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              连接设备
            </button>
          </div>
        )}
      </div>

      {/* 测试控制区域 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">测试控制</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isRunning && !isPaused ? 'bg-green-100 text-green-700' :
            isPaused ? 'bg-yellow-100 text-yellow-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {isRunning && !isPaused ? '运行中' :
             isPaused ? '已暂停' :
             '已停止'}
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex space-x-3 mb-6">
          {!isRunning && (
            <>
              <button
                onClick={handleStartTest}
                disabled={!isConnected}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>开始测试</span>
              </button>
              <button
                onClick={() => toggleModal('testConfig', true)}
                disabled={!isConnected}
                className="px-6 py-3 bg-slate-600 text-white rounded-xl font-medium hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                title="测试配置"
              >
                <Settings className="w-5 h-5" />
              </button>
            </>
          )}
          
          {isRunning && !isPaused && (
            <>
              <button
                onClick={handlePauseTest}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-xl font-medium hover:bg-yellow-700 transition-colors"
              >
                <Pause className="w-5 h-5" />
                <span>暂停</span>
              </button>
              <button
                onClick={handleStopTest}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                <Square className="w-5 h-5" />
                <span>停止</span>
              </button>
            </>
          )}
          
          {isPaused && (
            <>
              <button
                onClick={handleResumeTest}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>继续</span>
              </button>
              <button
                onClick={handleStopTest}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                <Square className="w-5 h-5" />
                <span>停止</span>
              </button>
            </>
          )}
        </div>
        
        {/* 当前测试信息 */}
        {currentTest && (
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-medium text-slate-800 mb-3">当前测试</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">测试次数:</span>
                <span className="ml-2 font-medium">{currentTest.totalCycles}</span>
              </div>
              <div>
                <span className="text-slate-600">间隔时间:</span>
                <span className="ml-2 font-medium">{currentTest.interval}ms</span>
              </div>
              <div>
                <span className="text-slate-600">超时时间:</span>
                <span className="ml-2 font-medium">{currentTest.timeout}ms</span>
              </div>
              <div>
                <span className="text-slate-600">重试:</span>
                <span className="ml-2 font-medium">{currentTest.retryEnabled ? '启用' : '禁用'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 测试进度 */}
      {(isRunning || isPaused) && currentTest && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">测试进度</h2>
            <div className="text-sm text-slate-600">
              {formatDuration(currentTest.elapsedTime || 0)}
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">总体进度</span>
              <span className="text-sm font-bold text-slate-900">
                {getProgressPercentage().toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
          
          {/* 统计信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="text-2xl font-bold text-slate-800">{currentTest.currentCycle}</div>
              <div className="text-sm text-slate-600">已完成</div>
              <div className="text-xs text-slate-500">/ {currentTest.totalCycles}</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className={`text-2xl font-bold ${
                getSuccessRate() >= 95 ? 'text-green-600' :
                getSuccessRate() >= 90 ? 'text-blue-600' : 'text-slate-600'
              }`}>
                {getSuccessRate().toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">成功率</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="text-2xl font-bold text-slate-800">
                {statistics?.avgResponseTime || 0}ms
              </div>
              <div className="text-sm text-slate-600">平均响应</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="text-2xl font-bold text-slate-800">
                {getEstimatedTimeRemaining()}
              </div>
              <div className="text-sm text-slate-600">剩余时间</div>
            </div>
          </div>
        </div>
      )}
      
      {/* 设备选择器模态框 */}
      {modals.deviceSelector && (
        <DeviceSelector />
      )}
      
      {/* 测试配置模态框 */}
      {modals.testConfig && (
        <TestConfigModal
          onClose={() => toggleModal('testConfig', false)}
          onStartTest={handleConfigTest}
        />
      )}
      
      {/* 底部间距 */}
      <div className="h-20"></div>
    </div>
  )
}

export default TestControl