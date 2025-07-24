import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, Settings, Bluetooth, Battery, Wifi, AlertTriangle, CheckCircle, Clock, RotateCcw, Zap, ArrowLeft, Hash } from 'lucide-react'
import { useTestState, useBluetoothState, useUIState, useSettings } from '../hooks/useAppState'
import { useNavigate, useParams } from 'react-router-dom'
import DeviceSelector from '../components/DeviceSelector'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'
import testService from '../services/TestService.js'

const TestControl = () => {
  const navigate = useNavigate()
  const { taskId } = useParams()
  
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
  
  // 测试任务状态
  const [taskData, setTaskData] = useState(null)
  const [isTaskCompleted, setIsTaskCompleted] = useState(false)
  const [shouldAutoConnect, setShouldAutoConnect] = useState(false)
  
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
  
  // 测试参数配置状态
  const [config, setConfig] = useState({
    testCount: testConfig.defaultTestCount || 100,
    interval: testConfig.defaultInterval || 1000
  })
  
  const [configErrors, setConfigErrors] = useState({})
  
  // 从本地存储加载保存的配置
  useEffect(() => {
    try {
      const savedSettings = JSON.parse(localStorage.getItem('baguaFurnace_settings') || '{}')
      const savedTestConfig = savedSettings.testConfig || {}
      
      setConfig({
        testCount: savedTestConfig.defaultTestCount || testConfig.defaultTestCount || 100,
        interval: savedTestConfig.defaultInterval || testConfig.defaultInterval || 1000
      })
    } catch (error) {
      console.error('加载保存的配置失败:', error)
    }
  }, [testConfig])
  
  // 处理任务数据加载
  useEffect(() => {
    if (taskId) {
      // 从本地存储或服务中加载任务数据
      try {
        const savedTasks = JSON.parse(localStorage.getItem('testTasks') || '[]')
        const task = savedTasks.find(t => t.id === taskId)
        
        if (task) {
          setTaskData(task)
          setIsTaskCompleted(task.status === 'completed')
          
          // 如果是未完成的任务，设置自动连接之前的设备
          if (task.status !== 'completed' && task.deviceId) {
            setShouldAutoConnect(true)
          }
          
          // 加载任务的配置
          if (task.config) {
            setConfig(task.config)
          }
        }
      } catch (error) {
        console.error('加载任务数据时出错:', error)
      }
    }
  }, [taskId])
  
  // 自动连接设备
  useEffect(() => {
    if (shouldAutoConnect && taskData && taskData.deviceId && !isConnected) {
      // 模拟自动连接到指定设备
      const autoConnect = async () => {
        try {
          // 这里应该调用实际的设备连接逻辑
          // 暂时模拟连接成功
          await connectDevice({
            id: taskData.deviceId,
            name: taskData.deviceName || '智能门锁',
            firmwareVersion: taskData.firmwareVersion || '1.0.0',
            battery: 85, // 模拟当前电池电量
            signalStrength: -45 // 模拟当前信号强度
          })
          
          addAlert('success', `已自动连接到设备 ${taskData.deviceId}`)
          setShouldAutoConnect(false)
        } catch (error) {
          addAlert('error', `自动连接设备失败: ${error.message}`)
          setShouldAutoConnect(false)
        }
      }
      
      // 延迟1秒后自动连接
      const timer = setTimeout(autoConnect, 1000)
      return () => clearTimeout(timer)
    }
  }, [shouldAutoConnect, taskData, isConnected, connectDevice, addAlert])
  
  // 监听测试完成事件
  useEffect(() => {
    const handleTestCompleted = (testResult) => {
      console.log('测试完成:', testResult)
      setIsTaskCompleted(true)
      
      // 更新任务状态到本地存储
      if (taskId) {
        try {
          const savedTasks = JSON.parse(localStorage.getItem('testTasks') || '[]')
          const taskIndex = savedTasks.findIndex(t => t.id === taskId)
          if (taskIndex !== -1) {
            savedTasks[taskIndex].status = 'completed'
            savedTasks[taskIndex].completedAt = new Date().toISOString()
            localStorage.setItem('testTasks', JSON.stringify(savedTasks))
          }
        } catch (error) {
          console.error('更新任务状态失败:', error)
        }
      }
    }
    
    // 监听测试完成事件
    testService.on('testCompleted', handleTestCompleted)
    
    return () => {
      testService.off('testCompleted', handleTestCompleted)
    }
  }, [taskId])
  
  // 验证配置
  const validateConfig = () => {
    const newErrors = {}
    
    if (!config.testCount || config.testCount < 1) {
      newErrors.testCount = '测试次数必须大于0'
    } else if (config.testCount > 10000) {
      newErrors.testCount = '测试次数不能超过10000'
    }
    
    if (!config.interval || config.interval < 1000) {
      newErrors.interval = '测试间隔不能小于1秒'
    } else if (config.interval > 60000) {
      newErrors.interval = '测试间隔不能超过60秒'
    }
    
    setConfigErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // 处理配置输入变化
  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
    
    // 清除对应字段的错误
    if (configErrors[field]) {
      setConfigErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }
  
  // 保存配置
  const handleSaveConfig = () => {
    if (!validateConfig()) {
      return
    }
    
    try {
      const currentSettings = JSON.parse(localStorage.getItem('baguaFurnace_settings') || '{}')
      const updatedSettings = {
        ...currentSettings,
        testConfig: {
          ...currentSettings.testConfig,
          defaultTestCount: config.testCount,
          defaultInterval: config.interval
        }
      }
      
      localStorage.setItem('baguaFurnace_settings', JSON.stringify(updatedSettings))
      addAlert('success', '配置已保存成功！')
    } catch (error) {
      console.error('保存配置时出错:', error)
      addAlert('error', '保存配置失败，请重试')
    }
  }
  
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
    if (!validateConfig()) return
    
    try {
      console.log('使用的测试配置:', config)
      await startTest(config)
      addAlert('success', '测试已开始')
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
      {/* 返回按钮 */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">返回历史记录</span>
        </button>
      </div>
      
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
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600">设备ID</span>
                <span className="font-medium text-slate-800">{connectedDevice.id || taskData?.deviceId || '未知'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600">固件版本</span>
                <span className="font-medium text-slate-800">{connectedDevice.firmwareVersion || taskData?.firmwareVersion || '未知'}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            
            {!isTaskCompleted && (
              <div className="flex space-x-3">
                <button
                  onClick={handleDisconnectDevice}
                  className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors"
                >
                  断开连接
                </button>
              </div>
            )}
          </div>
        ) : (
          !isTaskCompleted && (
            <div className="text-center py-8">
              <Bluetooth className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600 mb-4">
                {shouldAutoConnect ? `需要连接设备: ${taskData?.deviceId || '未知设备'}` : '未连接设备'}
              </p>
              <button
                onClick={handleConnectDevice}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                {shouldAutoConnect ? '连接之前的设备' : '连接设备'}
              </button>
            </div>
          )
        )}
        
        {/* 已完成任务的设备信息显示 */}
        {isTaskCompleted && taskData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600">设备ID</span>
                <span className="font-medium text-slate-800">{taskData.deviceId || '未知'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600">固件版本</span>
                <span className="font-medium text-slate-800">{taskData.firmwareVersion || '未知'}</span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-lg font-bold text-green-800">测试已完成</div>
              <div className="text-sm text-green-600">任务于 {new Date(taskData.completedAt).toLocaleString()} 完成</div>
            </div>
          </div>
        )}
      </div>

      {/* 测试参数配置与控制 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            {isTaskCompleted ? '测试参数信息' : '测试参数与控制'}
          </h2>
          <div className="flex items-center space-x-3">
            {!isTaskCompleted && (
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>保存配置</span>
              </button>
            )}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              isRunning && !isPaused ? 'bg-green-100 text-green-700' :
              isPaused ? 'bg-yellow-100 text-yellow-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {isRunning && !isPaused ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>运行中</span>
                </>
              ) : isPaused ? (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>已暂停</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  <span>未开始</span>
                </>
              )}
         

            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 测试次数 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Hash className="w-4 h-4 inline mr-1" />
              测试次数
            </label>
            <input
              type="number"
              value={config.testCount}
              onChange={(e) => handleConfigChange('testCount', parseInt(e.target.value) || 0)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                configErrors.testCount ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="请输入测试次数"
              min="1"
              max="10000"
              disabled={isRunning || isPaused || isTaskCompleted}
              readOnly={isTaskCompleted}
            />
            {configErrors.testCount && (
              <p className="mt-1 text-sm text-red-600">{configErrors.testCount}</p>
            )}
          </div>
          
          {/* 测试间隔 */}
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">
               <Clock className="w-4 h-4 inline mr-1" />
               测试间隔 (秒)
             </label>
             <input
               type="number"
               value={Math.round(config.interval / 1000)}
               onChange={(e) => handleConfigChange('interval', (parseInt(e.target.value) || 0) * 1000)}
               className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                 configErrors.interval ? 'border-red-500' : 'border-slate-300'
               }`}
               placeholder="请输入测试间隔"
               min="1"
               max="60"
               disabled={isRunning || isPaused || isTaskCompleted}
               readOnly={isTaskCompleted}
             />
             {configErrors.interval && (
               <p className="mt-1 text-sm text-red-600">{configErrors.interval}</p>
             )}
           </div>
        </div>
        
        {/* 预估时长 */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <div className="text-sm text-slate-600 mb-1">预估测试时长</div>
          <div className="text-lg font-semibold text-slate-800">
            {(() => {
              const totalTime = config.testCount * config.interval
              const minutes = Math.floor(totalTime / 60000)
              const seconds = Math.floor((totalTime % 60000) / 1000)
              
              if (minutes > 0) {
                return `约 ${minutes} 分 ${seconds} 秒`
              }
              return `约 ${seconds} 秒`
            })()}
          </div>
        </div>



      </div>

      {/* 测试进度与结果记录 */}
      {(isRunning || isPaused || (currentTest && currentTest.currentCycle > 0) || isTaskCompleted) && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              {isTaskCompleted ? '测试结果' : '测试进度与结果记录'}
            </h2>
            <div className="text-sm text-slate-600">
              {currentTest && formatDuration(currentTest.elapsedTime || 0)}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="text-2xl font-bold text-slate-800">{currentTest?.currentCycle || 0}</div>
              <div className="text-sm text-slate-600">已完成</div>
              <div className="text-xs text-slate-500">/ {currentTest?.totalCycles || 0}</div>
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
                {((statistics?.avgResponseTime || 0) / 1000).toFixed(2)}秒
              </div>
              <div className="text-sm text-slate-600">平均执行时间</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="text-2xl font-bold text-slate-800">
                {isTaskCompleted ? '已完成' : getEstimatedTimeRemaining()}
              </div>
              <div className="text-sm text-slate-600">
                {isTaskCompleted ? '状态' : '剩余时间'}
              </div>
            </div>
          </div>
          
          {/* 测试结果记录 */}
          {currentTest && currentTest.results && currentTest.results.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-medium text-slate-800 mb-3">实时测试记录</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {currentTest.results.slice(-10).map((result, index) => {
                  // 判断测试是否成功（开锁和锁定都成功）
                  const isSuccess = result.unlockResult?.success && result.lockResult?.success;
                  // 计算平均响应时间
                  const avgResponseTime = result.unlockResult?.responseTime && result.lockResult?.responseTime 
                    ? Math.round((result.unlockResult.responseTime + result.lockResult.responseTime) / 2)
                    : result.unlockResult?.responseTime || result.lockResult?.responseTime || 0;
                  
                  return (
                    <div key={index} className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                      isSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      <span>第 {result.cycle} 次</span>
                      <span className="flex items-center space-x-2">
                        <span>{isSuccess ? '成功' : '失败'}</span>
                        {avgResponseTime > 0 && (
                          <span className="text-xs text-slate-600">({(avgResponseTime / 1000).toFixed(2)}秒)</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 设备选择器模态框 */}
      {modals.deviceSelector && (
        <DeviceSelector />
      )}
      
      {/* 固定在底部的按钮区域 */}
      {!isTaskCompleted && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-10">
          <div className="max-w-4xl mx-auto">
            {!isRunning && !isPaused ? (
              <button
                onClick={handleStartTest}
                disabled={!isConnected}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 shadow-lg"
              >
                <Play className="w-6 h-6" />
                <span className="text-lg">开始测试</span>
              </button>
            ) : (
              <div className="flex space-x-3">
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
            )}
          </div>
        </div>
      )}
       
       {/* 底部间距，避免固定按钮遮挡内容 */}
       <div className="h-24"></div>
     </div>
   )
}

export default TestControl