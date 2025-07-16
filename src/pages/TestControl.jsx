import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, Settings, Clock, Hash, Bluetooth, Zap, Lock } from 'lucide-react'

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
    <div className="p-4 space-y-4">
      {/* 蓝牙连接状态 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bluetooth className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-gray-900">智能锁连接状态</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-xs text-green-600 font-medium">已连接</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          设备: SmartLock Pro • 信号强度: -45dBm • 电量: 85%
        </div>
      </div>
        
      {/* 测试状态卡片 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-medium text-gray-900">测试状态</h2>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            testStatus === 'running' ? 'bg-green-100 text-green-800' :
            testStatus === 'paused' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {testStatus === 'running' ? '运行中' : testStatus === 'paused' ? '已暂停' : '已停止'}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">测试模式:</span>
            <span className="text-sm font-medium">{testMode === 'count' ? '按次数' : testMode === 'time' ? '按时间' : '连续测试'}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">当前进度:</span>
            <span className="text-sm font-medium">
              {testMode === 'count' ? `${currentProgress.count}/${testConfig.targetCount}` :
               testMode === 'time' ? `${Math.floor(currentProgress.duration / 60)}:${(currentProgress.duration % 60).toString().padStart(2, '0')}/${Math.floor(testConfig.targetDuration)}:00` :
               `${currentProgress.count} 次`}
            </span>
          </div>
          
          {testStatus !== 'stopped' && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">下次测试:</span>
              <span className="text-sm font-medium text-blue-600">{currentProgress.nextUnlockIn}秒</span>
            </div>
          )}
          
          {/* 进度条 */}
          {testMode !== 'continuous' && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>进度</span>
                <span>
                  {getProgressPercentage().toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{
                    width: `${getProgressPercentage()}%`
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 测试控制按钮 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h3 className="text-base font-medium text-gray-900 mb-3">测试控制</h3>
        
        <div className="space-y-3">
          {testStatus === 'stopped' ? (
            <button
              onClick={startTest}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Play className="w-5 h-5 mr-2" />
              开始蓝牙开锁测试
            </button>
          ) : testStatus === 'running' ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={pauseTest}
                className="flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              >
                <Pause className="w-4 h-4 mr-1" />
                暂停
              </button>
              <button
                onClick={stopTest}
                className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <Square className="w-4 h-4 mr-1" />
                停止
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={resumeTest}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Play className="w-4 h-4 mr-1" />
                继续
              </button>
              <button
                onClick={stopTest}
                className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <Square className="w-4 h-4 mr-1" />
                停止
              </button>
            </div>
          )}
          
          {/* 手动测试按钮 */}
          <button
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-medium"
          >
            <Lock className="w-4 h-4 mr-2" />
            手动开锁测试
          </button>
        </div>
      </div>

      {/* 测试配置 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h3 className="text-base font-medium text-gray-900 mb-3">测试配置</h3>
        
        <div className="space-y-4">
          {/* 测试模式选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">测试模式</label>
            <select 
              value={testMode} 
              onChange={(e) => setTestMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={testStatus !== 'stopped'}
            >
              <option value="count">按次数测试</option>
              <option value="time">按时间测试</option>
              <option value="continuous">连续测试</option>
            </select>
          </div>
          
          {/* 目标次数/时长 */}
          {testMode === 'count' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">目标测试次数</label>
              <input
                type="number"
                value={testConfig.targetCount}
                onChange={(e) => setTestConfig({...testConfig, targetCount: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={testStatus !== 'stopped'}
                min="1"
                placeholder="输入测试次数"
              />
            </div>
          )}
          
          {testMode === 'time' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">测试时长（分钟）</label>
              <input
                type="number"
                value={testConfig.targetDuration}
                onChange={(e) => setTestConfig({...testConfig, targetDuration: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={testStatus !== 'stopped'}
                min="1"
                placeholder="输入测试时长"
              />
            </div>
          )}
          
          {/* 测试间隔 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">测试间隔（秒）</label>
            <input
              type="number"
              value={testConfig.interval}
              onChange={(e) => setTestConfig({...testConfig, interval: parseInt(e.target.value) || 1})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={testStatus !== 'stopped'}
              min="1"
              placeholder="输入间隔时间"
            />
          </div>
          
          {/* 智能锁型号 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">智能锁型号</label>
            <select 
              value={testConfig.lockModel} 
              onChange={(e) => setTestConfig({...testConfig, lockModel: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={testStatus !== 'stopped'}
            >
              <option value="SL-001">SL-001 基础款</option>
              <option value="SL-002">SL-002 标准款</option>
              <option value="SL-003">SL-003 高级款</option>
            </select>
          </div>
          
          {/* 测试类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">测试类型</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTestConfig({...testConfig, testType: 'unlock'})}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  testConfig.testType === 'unlock'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={testStatus !== 'stopped'}
              >
                开锁测试
              </button>
              <button
                onClick={() => setTestConfig({...testConfig, testType: 'lock'})}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  testConfig.testType === 'lock'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={testStatus !== 'stopped'}
              >
                上锁测试
              </button>
              <button
                onClick={() => setTestConfig({...testConfig, testType: 'both'})}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  testConfig.testType === 'both'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={testStatus !== 'stopped'}
              >
                开锁+上锁
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 实时日志 */}
      {logs.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h3 className="text-base font-medium text-gray-900 mb-3">实时日志</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">#{log.count}</span>
                  <span className={`px-2 py-1 rounded-full font-medium ${
                    log.result === '成功' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {log.result}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <span>{log.responseTime}ms</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TestControl