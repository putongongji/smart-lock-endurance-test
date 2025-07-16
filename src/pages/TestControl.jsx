import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, Settings, Clock, Hash, Zap } from 'lucide-react'

const TestControl = () => {
  const [testStatus, setTestStatus] = useState('stopped') // stopped, running, paused
  const [testMode, setTestMode] = useState('count') // count, time, continuous
  const [testConfig, setTestConfig] = useState({
    targetCount: 1000,
    targetDuration: 60, // 分钟
    interval: 5, // 秒
    lockModel: 'SL-001',
    testType: 'unlock' // unlock, lock, both
  })
  const [currentProgress, setCurrentProgress] = useState({
    count: 0,
    duration: 0,
    lastUnlockTime: null,
    nextUnlockIn: 0
  })
  const [logs, setLogs] = useState([])

  // 模拟测试进度更新
  useEffect(() => {
    if (testStatus === 'running') {
      const interval = setInterval(() => {
        setCurrentProgress(prev => {
          const newCount = prev.count + 1
          const newDuration = prev.duration + testConfig.interval
          const success = Math.random() > 0.1 // 90% 成功率
          
          // 添加日志
          const logEntry = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            action: testConfig.testType,
            result: success ? '成功' : '失败',
            responseTime: Math.floor(Math.random() * 100 + 50),
            count: newCount
          }
          setLogs(prev => [logEntry, ...prev.slice(0, 9)])
          
          // 检查是否达到目标
          if (testMode === 'count' && newCount >= testConfig.targetCount) {
            setTestStatus('stopped')
          } else if (testMode === 'time' && newDuration >= testConfig.targetDuration * 60) {
            setTestStatus('stopped')
          }
          
          return {
            count: newCount,
            duration: newDuration,
            lastUnlockTime: new Date(),
            nextUnlockIn: testConfig.interval
          }
        })
      }, testConfig.interval * 1000)
      
      return () => clearInterval(interval)
    }
  }, [testStatus, testConfig, testMode])

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

  const startTest = () => {
    setTestStatus('running')
    setCurrentProgress({
      count: 0,
      duration: 0,
      lastUnlockTime: null,
      nextUnlockIn: testConfig.interval
    })
    setLogs([])
  }

  const pauseTest = () => {
    setTestStatus('paused')
  }

  const resumeTest = () => {
    setTestStatus('running')
  }

  const stopTest = () => {
    setTestStatus('stopped')
    setCurrentProgress({
      count: 0,
      duration: 0,
      lastUnlockTime: null,
      nextUnlockIn: 0
    })
  }

  const getProgressPercentage = () => {
    if (testMode === 'count') {
      return (currentProgress.count / testConfig.targetCount) * 100
    } else if (testMode === 'time') {
      return (currentProgress.duration / (testConfig.targetDuration * 60)) * 100
    }
    return 0
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">测试控制</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 测试配置 */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              测试配置
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  测试模式
                </label>
                <select 
                  value={testMode} 
                  onChange={(e) => setTestMode(e.target.value)}
                  className="input"
                  disabled={testStatus === 'running'}
                >
                  <option value="count">按次数测试</option>
                  <option value="time">按时间测试</option>
                  <option value="continuous">连续测试</option>
                </select>
              </div>
              
              {testMode === 'count' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目标次数
                  </label>
                  <input 
                    type="number" 
                    value={testConfig.targetCount}
                    onChange={(e) => setTestConfig(prev => ({...prev, targetCount: parseInt(e.target.value)}))}
                    className="input"
                    disabled={testStatus === 'running'}
                  />
                </div>
              )}
              
              {testMode === 'time' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目标时长 (分钟)
                  </label>
                  <input 
                    type="number" 
                    value={testConfig.targetDuration}
                    onChange={(e) => setTestConfig(prev => ({...prev, targetDuration: parseInt(e.target.value)}))}
                    className="input"
                    disabled={testStatus === 'running'}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  测试间隔 (秒)
                </label>
                <input 
                  type="number" 
                  value={testConfig.interval}
                  onChange={(e) => setTestConfig(prev => ({...prev, interval: parseInt(e.target.value)}))}
                  className="input"
                  disabled={testStatus === 'running'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  智能锁型号
                </label>
                <select 
                  value={testConfig.lockModel} 
                  onChange={(e) => setTestConfig(prev => ({...prev, lockModel: e.target.value}))}
                  className="input"
                  disabled={testStatus === 'running'}
                >
                  <option value="SL-001">SL-001 基础款</option>
                  <option value="SL-002">SL-002 标准款</option>
                  <option value="SL-003">SL-003 高级款</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  测试类型
                </label>
                <select 
                  value={testConfig.testType} 
                  onChange={(e) => setTestConfig(prev => ({...prev, testType: e.target.value}))}
                  className="input"
                  disabled={testStatus === 'running'}
                >
                  <option value="unlock">仅开锁</option>
                  <option value="lock">仅上锁</option>
                  <option value="both">开锁+上锁</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* 测试控制和状态 */}
          <div className="space-y-6">
            {/* 控制按钮 */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">测试控制</h2>
              <div className="flex space-x-4">
                {testStatus === 'stopped' && (
                  <button 
                    onClick={startTest}
                    className="btn btn-success px-6 py-3 flex items-center"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    开始测试
                  </button>
                )}
                
                {testStatus === 'running' && (
                  <>
                    <button 
                      onClick={pauseTest}
                      className="btn btn-warning px-6 py-3 flex items-center"
                    >
                      <Pause className="w-5 h-5 mr-2" />
                      暂停
                    </button>
                    <button 
                      onClick={stopTest}
                      className="btn btn-danger px-6 py-3 flex items-center"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      停止
                    </button>
                  </>
                )}
                
                {testStatus === 'paused' && (
                  <>
                    <button 
                      onClick={resumeTest}
                      className="btn btn-success px-6 py-3 flex items-center"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      继续
                    </button>
                    <button 
                      onClick={stopTest}
                      className="btn btn-danger px-6 py-3 flex items-center"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      停止
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* 测试进度 */}
            {testStatus !== 'stopped' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">测试进度</h2>
                
                {testMode !== 'continuous' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>进度</span>
                      <span>{getProgressPercentage().toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">已执行次数</p>
                    <p className="text-lg font-semibold">{currentProgress.count}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">已用时长</p>
                    <p className="text-lg font-semibold">
                      {Math.floor(currentProgress.duration / 60)}:{(currentProgress.duration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">下次执行</p>
                    <p className="text-lg font-semibold">{currentProgress.nextUnlockIn}秒</p>
                  </div>
                  <div>
                    <p className="text-gray-600">最后执行</p>
                    <p className="text-lg font-semibold">
                      {currentProgress.lastUnlockTime ? currentProgress.lastUnlockTime.toLocaleTimeString() : '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 实时日志 */}
        {logs.length > 0 && (
          <div className="card p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">实时日志</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">次数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">结果</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">响应时间</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          log.result === '成功' ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'
                        }`}>
                          {log.result}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.responseTime}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestControl