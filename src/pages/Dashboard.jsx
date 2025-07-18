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

  const StatusCard = ({ title, value, icon: Icon, subtitle }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  )

  const ConnectionCard = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-gray-900">设备状态</h3>
        <div className={`w-3 h-3 rounded-full shadow-lg ${
          bluetoothStatus === 'connected' ? 'bg-green-500' :
        bluetoothStatus === 'connecting' ? 'bg-blue-500' : 'bg-gray-500'
        }`}></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Bluetooth className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-xs text-gray-500 mb-1">蓝牙</div>
          <div className={`text-sm font-medium ${
            bluetoothStatus === 'connected' ? 'text-green-600' :
        bluetoothStatus === 'connecting' ? 'text-blue-600' : 'text-gray-600'
          }`}>
            {bluetoothStatus === 'connected' ? '已连接' :
             bluetoothStatus === 'connecting' ? '连接中' : '未连接'}
          </div>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Wifi className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-xs text-gray-500 mb-1">信号强度</div>
          <div className="text-sm font-medium text-gray-900">{stats.signalStrength} dBm</div>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Battery className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-xs text-gray-500 mb-1">电量</div>
          <div className="text-sm font-medium text-gray-900">{lockBattery}%</div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-4 space-y-5">
      {/* 测试状态指示器 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-4 ${
              testStatus === 'running' ? 'bg-green-500' :
        testStatus === 'paused' ? 'bg-blue-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm font-semibold text-gray-900">
              {testStatus === 'running' ? '测试运行中' : testStatus === 'paused' ? '测试已暂停' : '测试已停止'}
            </span>
          </div>
          <div className={`px-4 py-2 rounded-lg text-xs font-medium ${
            testStatus === 'running' ? 'bg-green-50 text-green-700' :
        testStatus === 'paused' ? 'bg-blue-50 text-blue-700' :
        'bg-gray-50 text-gray-700'
          }`}>
            {testStatus === 'running' && <Play className="w-4 h-4 inline mr-2" />}
            {testStatus === 'paused' && <Pause className="w-4 h-4 inline mr-2" />}
            {testStatus === 'stopped' && <Square className="w-4 h-4 inline mr-2" />}
            {testStatus === 'running' ? '运行中' : testStatus === 'paused' ? '暂停' : '停止'}
          </div>
        </div>
      </div>

      {/* 设备连接状态 */}
      <ConnectionCard />

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <StatusCard 
          title="测试次数" 
          value={stats.totalTests.toLocaleString()} 
          icon={Hash} 
        />
        <StatusCard 
          title="成功率" 
          value={stats.totalTests > 0 ? `${Math.round((stats.successfulUnlocks / stats.totalTests) * 100)}%` : '0%'} 
          icon={CheckCircle} 
          subtitle={`${stats.successfulUnlocks}/${stats.totalTests}`}
        />
        <StatusCard 
          title="失败次数" 
          value={stats.failedUnlocks.toLocaleString()} 
          icon={AlertTriangle} 
        />
        <StatusCard 
          title="测试时长" 
          value={`${Math.floor(stats.currentDuration / 60)}:${(stats.currentDuration % 60).toString().padStart(2, '0')}`} 
          icon={Clock} 
        />
      </div>

      {/* 简化的响应时间图表 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">蓝牙响应时间</h3>
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
            {realtimeData.length > 0 ? `${Math.round(realtimeData[realtimeData.length - 1].responseTime)}ms` : '0ms'}
          </span>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={realtimeData}>
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#4f46e5" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex justify-between text-xs font-medium text-gray-600">
          <span>最近20次测试</span>
          <span>平均: {realtimeData.length > 0 ? Math.round(realtimeData.reduce((a, b) => a + b.responseTime, 0) / realtimeData.length) : 0}ms</span>
        </div>
      </div>

      {/* 当前测试信息 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
        <h3 className="text-base font-semibold text-gray-900 mb-5">当前测试信息</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {stats.totalTests > 0 ? Math.round((stats.successfulUnlocks / stats.totalTests) * 100) : 0}%
            </div>
            <div className="text-xs font-medium text-gray-600">成功率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {realtimeData.length > 0 ? Math.round(realtimeData.reduce((a, b) => a + b.responseTime, 0) / realtimeData.length) : 0}ms
            </div>
            <div className="text-xs font-medium text-gray-600">平均响应</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {Math.max(0, stats.successfulUnlocks - stats.failedUnlocks)}
            </div>
            <div className="text-xs font-medium text-gray-600">连续成功</div>
          </div>
        </div>
      </div>
      
      {/* 底部间距，防止被导航栏遮挡 */}
      <div className="h-20"></div>
     </div>
   )
 }

export default Dashboard