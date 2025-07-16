import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, Clock, Hash, AlertTriangle, CheckCircle, Bluetooth, Wifi, Battery } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Dashboard = () => {
  const [testStatus, setTestStatus] = useState('stopped') // stopped, running, paused
  const [bluetoothStatus, setBluetoothStatus] = useState('connected') // connected, disconnected, connecting
  const [lockBattery, setLockBattery] = useState(85)
  const [currentTest, setCurrentTest] = useState(null)
  const [realtimeData, setRealtimeData] = useState([])
  const [stats, setStats] = useState({
    totalTests: 0,
    successfulUnlocks: 0,
    failedUnlocks: 0,
    currentDuration: 0,
    averageResponseTime: 0,
    signalStrength: -45 // dBm
  })

  // 模拟实时数据更新
  useEffect(() => {
    if (testStatus === 'running') {
      const interval = setInterval(() => {
        const newDataPoint = {
          time: new Date().toLocaleTimeString(),
          responseTime: Math.random() * 100 + 50,
          success: Math.random() > 0.1 // 90% 成功率
        }
        setRealtimeData(prev => [...prev.slice(-19), newDataPoint])
        
        setStats(prev => ({
          ...prev,
          totalTests: prev.totalTests + 1,
          successfulUnlocks: prev.successfulUnlocks + (newDataPoint.success ? 1 : 0),
          failedUnlocks: prev.failedUnlocks + (newDataPoint.success ? 0 : 1),
          currentDuration: prev.currentDuration + 1,
          averageResponseTime: (prev.averageResponseTime + newDataPoint.responseTime) / 2
        }))
      }, 2000)
      
      return () => clearInterval(interval)
    }
  }, [testStatus])

  const StatusCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
            <p className="text-lg font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  )

  const ConnectionCard = () => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">设备连接</h3>
        <div className={`w-3 h-3 rounded-full ${
          bluetoothStatus === 'connected' ? 'bg-green-400' :
          bluetoothStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
        }`}></div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bluetooth className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm text-gray-600">蓝牙连接</span>
          </div>
          <span className={`text-xs font-medium ${
            bluetoothStatus === 'connected' ? 'text-green-600' :
            bluetoothStatus === 'connecting' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {bluetoothStatus === 'connected' ? '已连接' :
             bluetoothStatus === 'connecting' ? '连接中' : '未连接'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wifi className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm text-gray-600">信号强度</span>
          </div>
          <span className="text-xs font-medium text-gray-900">{stats.signalStrength} dBm</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Battery className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm text-gray-600">智能锁电量</span>
          </div>
          <span className="text-xs font-medium text-gray-900">{lockBattery}%</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-4 space-y-4">
      {/* 测试状态指示器 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              testStatus === 'running' ? 'bg-green-400' :
              testStatus === 'paused' ? 'bg-yellow-400' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm font-medium text-gray-900">
              {testStatus === 'running' ? '测试运行中' : testStatus === 'paused' ? '测试已暂停' : '测试已停止'}
            </span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            testStatus === 'running' ? 'bg-green-100 text-green-800' :
            testStatus === 'paused' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {testStatus === 'running' && <Play className="w-3 h-3 inline mr-1" />}
            {testStatus === 'paused' && <Pause className="w-3 h-3 inline mr-1" />}
            {testStatus === 'stopped' && <Square className="w-3 h-3 inline mr-1" />}
            {testStatus === 'running' ? '运行中' : testStatus === 'paused' ? '暂停' : '停止'}
          </div>
        </div>
      </div>

      {/* 设备连接状态 */}
      <ConnectionCard />

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-3">
        <StatusCard 
          title="测试次数" 
          value={stats.totalTests.toLocaleString()} 
          icon={Hash} 
          color="blue" 
        />
        <StatusCard 
          title="成功率" 
          value={stats.totalTests > 0 ? `${Math.round((stats.successfulUnlocks / stats.totalTests) * 100)}%` : '0%'} 
          icon={CheckCircle} 
          color="green" 
          subtitle={`${stats.successfulUnlocks}/${stats.totalTests}`}
        />
        <StatusCard 
          title="失败次数" 
          value={stats.failedUnlocks.toLocaleString()} 
          icon={AlertTriangle} 
          color="red" 
        />
        <StatusCard 
          title="测试时长" 
          value={`${Math.floor(stats.currentDuration / 60)}:${(stats.currentDuration % 60).toString().padStart(2, '0')}`} 
          icon={Clock} 
          color="purple" 
        />
      </div>

      {/* 实时响应时间图表 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-gray-900">蓝牙响应时间</h3>
          <span className="text-xs text-gray-500">
            {realtimeData.length > 0 ? `${Math.round(realtimeData[realtimeData.length - 1].responseTime)}ms` : '0ms'}
          </span>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={realtimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ fontSize: '12px' }}
                labelStyle={{ fontSize: '10px' }}
              />
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>最近20次测试</span>
          <span>平均: {realtimeData.length > 0 ? Math.round(realtimeData.reduce((a, b) => a + b.responseTime, 0) / realtimeData.length) : 0}ms</span>
        </div>
      </div>

      {/* 当前测试信息 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h3 className="text-base font-medium text-gray-900 mb-3">当前测试信息</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {stats.totalTests > 0 ? Math.round((stats.successfulUnlocks / stats.totalTests) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-500">成功率</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {realtimeData.length > 0 ? Math.round(realtimeData.reduce((a, b) => a + b.responseTime, 0) / realtimeData.length) : 0}ms
            </div>
            <div className="text-xs text-gray-500">平均响应</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {Math.max(0, stats.successfulUnlocks - stats.failedUnlocks)}
            </div>
            <div className="text-xs text-gray-500">连续成功</div>
          </div>
        </div>
      </div>
     </div>
   )
 }

export default Dashboard