import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, Bluetooth, Lock, Zap, Clock, AlertTriangle, CheckCircle, Battery, Wifi, FileText, Loader } from 'lucide-react'

const TestControl = () => {
  const [testStatus, setTestStatus] = useState('stopped') // stopped, running, paused, checking
  const [testConfig, setTestConfig] = useState({
    targetCount: 10000,
    interval: 5 // 秒
  })
  const [currentProgress, setCurrentProgress] = useState({
    count: 0,
    successCount: 0,
    failureCount: 0,
    duration: 0,
    lastUnlockTime: null,
    nextUnlockIn: 0,
    avgResponseTime: 0,
    consecutiveFailures: 0
  })
  const [deviceStatus, setDeviceStatus] = useState({
    connected: true,
    battery: 85,
    signalStrength: -45,
    temperature: 25
  })
  const [logs, setLogs] = useState([])
  const [alerts, setAlerts] = useState([])
  const [preCheckResults, setPreCheckResults] = useState(null)
  const [showPreCheckResults, setShowPreCheckResults] = useState(false)

  // 预测试检查
  const performPreCheck = async () => {
    setTestStatus('checking')
    
    // 模拟检查过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const results = {
      bluetoothConnection: deviceStatus.connected,
      batteryLevel: deviceStatus.battery > 20,
      signalStrength: deviceStatus.signalStrength > -70,
      deviceResponse: Math.random() > 0.1,
      estimatedDuration: Math.ceil((testConfig.targetCount * testConfig.interval) / 60)
    }
    
    setPreCheckResults(results)
    
    // 检查是否有阻塞性问题
    const hasBlockingIssues = !results.bluetoothConnection || !results.batteryLevel || !results.deviceResponse
    
    if (hasBlockingIssues) {
      setTestStatus('stopped')
      addAlert('检测到阻塞性问题，无法开始测试', 'error')
    } else {
      setTestStatus('stopped')
      addAlert('预检查完成，设备状态良好', 'success')
    }
    
    return results
  }

  // 添加警报
  const addAlert = (message, type = 'info') => {
    const alert = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    }
    setAlerts(prev => [alert, ...prev.slice(0, 4)])
    
    // 自动清除成功消息
    if (type === 'success') {
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== alert.id))
      }, 3000)
    }
  }

  // 模拟测试进度更新
  useEffect(() => {
    if (testStatus === 'running') {
      const interval = setInterval(() => {
        setCurrentProgress(prev => {
          const newCount = prev.count + 1
          const newDuration = prev.duration + testConfig.interval
          const success = Math.random() > 0.1 // 90% 成功率
          const responseTime = Math.floor(Math.random() * 100 + 50)
          
          const newSuccessCount = success ? prev.successCount + 1 : prev.successCount
          const newFailureCount = success ? prev.failureCount : prev.failureCount + 1
          const newConsecutiveFailures = success ? 0 : prev.consecutiveFailures + 1
          
          // 计算平均响应时间
          const newAvgResponseTime = ((prev.avgResponseTime * prev.count) + responseTime) / newCount
          
          // 添加日志
          const logEntry = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            action: '蓝牙开锁',
            result: success ? '成功' : '失败',
            responseTime,
            count: newCount
          }
          setLogs(prev => [logEntry, ...prev.slice(0, 9)])
          
          // 检查警报条件
          if (newConsecutiveFailures >= 5) {
            addAlert(`连续失败${newConsecutiveFailures}次，请检查设备状态`, 'warning')
          }
          
          if (responseTime > 150) {
            addAlert(`响应时间过长: ${responseTime}ms`, 'warning')
          }
          
          // 检查是否达到目标次数
          if (newCount >= testConfig.targetCount) {
            setTestStatus('stopped')
            addAlert(`测试完成！成功率: ${((newSuccessCount / newCount) * 100).toFixed(1)}%`, 'success')
          }
          
          return {
            count: newCount,
            successCount: newSuccessCount,
            failureCount: newFailureCount,
            duration: newDuration,
            lastUnlockTime: new Date(),
            nextUnlockIn: testConfig.interval,
            avgResponseTime: newAvgResponseTime,
            consecutiveFailures: newConsecutiveFailures
          }
        })
      }, testConfig.interval * 1000)
      
      return () => clearInterval(interval)
    }
  }, [testStatus, testConfig])

  // 倒计时更新
  useEffect(() => {
    if (testStatus === 'running') {
      const countdown = setInterval(() => {
        setCurrentProgress(prev => ({
          ...prev,
          nextUnlockIn: Math.max(0, prev.nextUnlockIn - 1)
        }))
      }, 1000)
      
      return () => clearInterval(countdown)
    }
  }, [testStatus])

  // 模拟设备状态更新
  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceStatus(prev => ({
        ...prev,
        battery: Math.max(0, prev.battery - (testStatus === 'running' ? 0.1 : 0)),
        signalStrength: prev.signalStrength + (Math.random() - 0.5) * 5,
        temperature: 25 + (Math.random() - 0.5) * 10
      }))
    }, 5000)
    
    return () => clearInterval(interval)
  }, [testStatus])

  const startTest = async () => {
    // 执行预检查
    const checkResults = await performPreCheck()
    
    if (checkResults.bluetoothConnection && checkResults.batteryLevel && checkResults.deviceResponse) {
      setTestStatus('running')
      setCurrentProgress({
        count: 0,
        successCount: 0,
        failureCount: 0,
        duration: 0,
        lastUnlockTime: null,
        nextUnlockIn: testConfig.interval,
        avgResponseTime: 0,
        consecutiveFailures: 0
      })
      setLogs([])
      addAlert('测试已开始', 'info')
    }
  }

  const quickStart = () => {
    setTimeout(startTest, 100)
  }

  const pauseTest = () => {
    setTestStatus('paused')
    addAlert('测试已暂停', 'info')
  }

  const resumeTest = () => {
    setTestStatus('running')
    addAlert('测试已恢复', 'info')
  }

  const stopTest = () => {
    setTestStatus('stopped')
    setCurrentProgress({
      count: 0,
      successCount: 0,
      failureCount: 0,
      duration: 0,
      lastUnlockTime: null,
      nextUnlockIn: 0,
      avgResponseTime: 0,
      consecutiveFailures: 0
    })
    addAlert('测试已停止', 'info')
  }

  const getProgressPercentage = () => {
    return (currentProgress.count / testConfig.targetCount) * 100
  }

  const getSuccessRate = () => {
    if (currentProgress.count === 0) return 0
    return (currentProgress.successCount / currentProgress.count) * 100
  }

  const getEstimatedTimeRemaining = () => {
    const remaining = testConfig.targetCount - currentProgress.count
    return Math.ceil((remaining * testConfig.interval) / 60)
  }

  return (
    <div className="p-4 space-y-6">
      {/* 警报区域 */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg flex items-center border shadow-sm transition-all duration-300 ${
              alert.type === 'error' ? 'bg-gray-50 border-gray-200' :
        alert.type === 'warning' ? 'bg-blue-50 border-blue-200' :
        alert.type === 'success' ? 'bg-green-50 border-green-200' :
        'bg-blue-50 border-blue-200'
            }`}>
              <div className={`p-2 rounded-lg mr-3 ${
                alert.type === 'error' ? 'bg-gray-100' :
        alert.type === 'warning' ? 'bg-blue-100' :
        alert.type === 'success' ? 'bg-green-100' :
        'bg-blue-100'
              }`}>
                {alert.type === 'error' && <AlertTriangle className="w-5 h-5 text-gray-600" />}
      {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-blue-600" />}
      {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
      {alert.type === 'info' && <Bluetooth className="w-5 h-5 text-blue-600" />}
              </div>
              <span className={`text-sm font-medium ${
                alert.type === 'error' ? 'text-gray-800' :
        alert.type === 'warning' ? 'text-blue-800' :
        alert.type === 'success' ? 'text-green-800' :
        'text-blue-800'
              }`}>
                {alert.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 设备状态卡片 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <Bluetooth className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">设备状态</h3>
              <p className="text-xs text-slate-500 font-medium">实时监控</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`relative w-3 h-3 rounded-full ${
              deviceStatus.connected ? 'bg-green-500' : 'bg-gray-400'
            }`}>
              {deviceStatus.connected && (
                <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
              )}
            </div>
            <span className={`text-sm font-bold ${
              deviceStatus.connected ? 'text-green-600' : 'text-gray-600'
            }`}>
              {deviceStatus.connected ? '已连接' : '未连接'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Battery className="w-5 h-5 text-gray-600" />
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                deviceStatus.battery > 20 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {deviceStatus.battery > 20 ? '正常' : '低电'}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {deviceStatus.battery.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600 font-medium">电池电量</div>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Wifi className="w-5 h-5 text-gray-600" />
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {deviceStatus.signalStrength > -50 ? '强' : deviceStatus.signalStrength > -70 ? '中' : '弱'}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {deviceStatus.signalStrength.toFixed(0)}
            </div>
            <div className="text-xs text-gray-600 font-medium">信号强度 dBm</div>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {deviceStatus.temperature < 30 ? '正常' : '偏高'}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {deviceStatus.temperature.toFixed(0)}°
            </div>
            <div className="text-xs text-gray-600 font-medium">设备温度</div>
          </div>
        </div>
       </div>

       {/* 设备预检查 */}
       {testStatus === 'stopped' && (
         <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center space-x-3">
               <div className="p-3 bg-green-500/10 rounded-2xl">
                 <CheckCircle className="w-6 h-6 text-green-600" />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-slate-900">设备预检查</h3>
                 <p className="text-xs text-slate-500 font-medium">确保设备状态正常</p>
               </div>
             </div>
             <button
               onClick={performPreCheck}
               className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-bold shadow-lg"
             >
               <CheckCircle className="w-4 h-4 mr-2" />
               开始检查
             </button>
           </div>
           
           {preCheckResults && (
             <div className="mt-4">
               <button
                 onClick={() => setShowPreCheckResults(!showPreCheckResults)}
                 className="flex items-center justify-between w-full p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-all duration-200 text-sm border border-white/30"
               >
                 <span className="font-bold text-slate-700">检查结果</span>
                 <div className="flex items-center">
                   <span className={`text-xs px-3 py-1 rounded-full mr-3 font-bold ${
                     preCheckResults.bluetoothConnection && preCheckResults.batteryLevel && preCheckResults.deviceResponse
                       ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
                   }`}>
                     {preCheckResults.bluetoothConnection && preCheckResults.batteryLevel && preCheckResults.deviceResponse ? '通过' : '失败'}
                   </span>
                   <span className={`transform transition-transform text-slate-600 ${
                     showPreCheckResults ? 'rotate-180' : ''
                   }`}>▼</span>
                 </div>
               </button>
               
               {showPreCheckResults && (
                 <div className="mt-3 p-4 bg-white/30 rounded-xl space-y-3 text-sm border border-white/20">
                   <div className="flex items-center justify-between">
                     <span className="text-slate-700 font-medium">蓝牙连接:</span>
                     <span className={`flex items-center font-bold ${
                       preCheckResults.bluetoothConnection ? 'text-green-700' : 'text-gray-700'
                     }`}>
                       {preCheckResults.bluetoothConnection ? (
                         <CheckCircle className="w-4 h-4 mr-2" />
                       ) : (
                         <AlertTriangle className="w-4 h-4 mr-2" />
                       )}
                       {preCheckResults.bluetoothConnection ? '正常' : '异常'}
                     </span>
                   </div>
                   
                   <div className="flex items-center justify-between">
                     <span className="text-slate-700 font-medium">电量水平:</span>
                     <span className={`flex items-center font-bold ${
                       preCheckResults.batteryLevel ? 'text-green-700' : 'text-gray-700'
                     }`}>
                       {preCheckResults.batteryLevel ? (
                         <CheckCircle className="w-4 h-4 mr-2" />
                       ) : (
                         <AlertTriangle className="w-4 h-4 mr-2" />
                       )}
                       {preCheckResults.batteryLevel ? '充足' : '不足'}
                     </span>
                   </div>
                   
                   <div className="flex items-center justify-between">
                     <span className="text-slate-700 font-medium">设备响应:</span>
                     <span className={`flex items-center font-bold ${
                       preCheckResults.deviceResponse ? 'text-green-700' : 'text-gray-700'
                     }`}>
                       {preCheckResults.deviceResponse ? (
                         <CheckCircle className="w-4 h-4 mr-2" />
                       ) : (
                         <AlertTriangle className="w-4 h-4 mr-2" />
                       )}
                       {preCheckResults.deviceResponse ? '正常' : '异常'}
                     </span>
                   </div>
                   
                   <div className="flex items-center justify-between pt-3 border-t border-white/30">
                     <span className="text-slate-700 font-medium">预计测试时长:</span>
                     <span className="font-bold text-blue-700">
                       {preCheckResults.estimatedDuration} 分钟
                     </span>
                   </div>
                 </div>
               )}
             </div>
           )}
         </div>
       )}
 
       {/* 配置参数区域 */}
       {testStatus === 'stopped' && (
         <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
           <div className="flex items-center justify-between mb-6">
             <div>
               <h3 className="text-lg font-semibold text-gray-900">配置参数</h3>
               <p className="text-gray-600 font-medium">设置测试参数</p>
             </div>
             <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-inner">
               <Zap className="w-6 h-6 text-gray-600" />
             </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">测试次数</label>
               <input
                 type="number"
                 value={testConfig.targetCount}
                 onChange={(e) => setTestConfig({...testConfig, targetCount: parseInt(e.target.value) || 0})}
                 className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                 min="1"
                 placeholder="输入测试次数"
               />
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">测试间隔（秒）</label>
               <input
                 type="number"
                 value={testConfig.interval}
                 onChange={(e) => setTestConfig({...testConfig, interval: parseInt(e.target.value) || 1})}
                 className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                 min="1"
                 placeholder="输入间隔时间"
               />
             </div>
           </div>
         </div>
       )}
        
      {/* 测试状态卡片 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl ${
              testStatus === 'running' ? 'bg-green-500/10' :
        testStatus === 'paused' ? 'bg-blue-500/10' :
        testStatus === 'checking' ? 'bg-blue-500/10' :
        'bg-gray-500/10'
            }`}>
              <Lock className={`w-6 h-6 ${
                testStatus === 'running' ? 'text-green-600' :
        testStatus === 'paused' ? 'text-blue-600' :
        testStatus === 'checking' ? 'text-blue-600' :
        'text-gray-600'
              }`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">测试进度</h2>
              <p className="text-xs text-slate-500 font-medium">实时监控</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${
            testStatus === 'running' ? 'bg-green-100 text-green-800 shadow-green-100' :
        testStatus === 'paused' ? 'bg-blue-100 text-blue-800 shadow-blue-100' :
        testStatus === 'checking' ? 'bg-blue-100 text-blue-800 shadow-blue-100' :
        'bg-gray-100 text-gray-800 shadow-gray-100'
          }`}>
            {testStatus === 'running' ? '运行中' : 
             testStatus === 'paused' ? '已暂停' : 
             testStatus === 'checking' ? '检查中' : '已停止'}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="text-center">
                <div className="text-3xl font-black text-gray-900 mb-1">{currentProgress.count}</div>
        <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">已完成</div>
        <div className="text-xs text-gray-500 mt-1">/ {testConfig.targetCount}</div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="text-center">
                <div className={`text-3xl font-black mb-1 ${
                  getSuccessRate() >= 95 ? 'text-green-600' :
          getSuccessRate() >= 90 ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {getSuccessRate().toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">成功率</div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="text-center">
                <div className="text-3xl font-black text-gray-900 mb-1">
                  {currentProgress.avgResponseTime.toFixed(0)}
                </div>
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">平均响应</div>
        <div className="text-xs text-gray-500 mt-1">毫秒</div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="text-center">
                <div className="text-3xl font-black text-gray-900 mb-1">
                  {testStatus === 'running' ? getEstimatedTimeRemaining() : '-'}
                </div>
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">剩余时间</div>
        <div className="text-xs text-gray-500 mt-1">分钟</div>
              </div>
            </div>
          </div>
          
          {testStatus !== 'stopped' && (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700 font-bold">下次测试:</span>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="font-bold text-blue-700">{currentProgress.nextUnlockIn}秒</span>
                </div>
              </div>
            </div>
          )}
          
          {/* 进度条 */}
          <div className="mt-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-slate-700">总体进度</span>
                <span className="text-lg font-black text-slate-900">
                  {getProgressPercentage().toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-200/60 backdrop-blur-sm rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-lg" 
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>







      {/* 实时日志 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-500/10 rounded-2xl">
              <Clock className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">实时日志</h3>
              <p className="text-xs text-slate-500 font-medium">系统活动记录</p>
            </div>
          </div>
          <button
            onClick={() => setLogs([])}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-105"
          >
            清空
          </button>
        </div>
        
        <div className="bg-slate-900 rounded-2xl p-4 h-48 overflow-y-auto border border-slate-700">
          {logs.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-12 font-medium">
              <div className="mb-2">💻</div>
              暂无日志记录
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className={`text-xs p-3 rounded-xl border-l-4 ${
                  log.result === '成功' ? 'bg-emerald-900/50 border-emerald-400 text-emerald-100' : 'bg-red-900/50 border-red-400 text-red-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-300 font-mono">#{log.count}</span>
                      <span className={`px-2 py-1 rounded-full font-bold text-xs ${
                        log.result === '成功' ? 'bg-emerald-400/20 text-emerald-200' : 'bg-red-400/20 text-red-200'
                      }`}>
                        {log.result}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <span className="font-mono">{log.responseTime}ms</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部间距，为固定按钮留出空间 */}
      <div className="h-20"></div>
      
      {/* 固定在底部的测试控制按钮 */}
      <div className="fixed bottom-20 left-4 right-4 z-10">
        <div className="max-w-sm mx-auto bg-white/70 backdrop-blur-sm border border-white/20 p-4 rounded-3xl shadow-lg">
          {testStatus === 'stopped' ? (
            <button
              onClick={startTest}
              className="w-full flex items-center justify-center px-6 py-4 bg-blue-500/10 backdrop-blur-sm border border-blue-200/30 hover:bg-blue-500/20 text-blue-600 rounded-2xl transition-all duration-300 font-semibold shadow-sm hover:shadow-md active:scale-95"
            >
              <Play className="w-5 h-5 mr-2" />
              开始测试
            </button>
          ) : testStatus === 'running' ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={pauseTest}
                className="flex items-center justify-center px-6 py-4 bg-blue-500/10 backdrop-blur-sm border border-blue-200/30 hover:bg-blue-500/20 text-blue-600 rounded-2xl transition-all duration-300 font-semibold shadow-sm hover:shadow-md active:scale-95"
              >
                <Pause className="w-5 h-5 mr-2" />
                暂停
              </button>
              <button
                onClick={stopTest}
                className="flex items-center justify-center px-6 py-4 bg-gray-500/10 backdrop-blur-sm border border-gray-200/30 hover:bg-gray-500/20 text-gray-600 rounded-2xl transition-all duration-300 font-semibold shadow-sm hover:shadow-md active:scale-95"
              >
                <Square className="w-5 h-5 mr-2" />
                停止
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={resumeTest}
                className="flex items-center justify-center px-6 py-4 bg-green-500/10 backdrop-blur-sm border border-green-200/30 hover:bg-green-500/20 text-green-600 rounded-2xl transition-all duration-300 font-semibold shadow-sm hover:shadow-md active:scale-95"
              >
                <Play className="w-5 h-5 mr-2" />
                继续
              </button>
              <button
                onClick={stopTest}
                className="flex items-center justify-center px-6 py-4 bg-gray-500/10 backdrop-blur-sm border border-gray-200/30 hover:bg-gray-500/20 text-gray-600 rounded-2xl transition-all duration-300 font-semibold shadow-sm hover:shadow-md active:scale-95"
              >
                <Square className="w-5 h-5 mr-2" />
                停止
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestControl