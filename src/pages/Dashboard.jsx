import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, Clock, Hash, AlertTriangle, CheckCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Dashboard = () => {
  const [testStatus, setTestStatus] = useState('stopped') // stopped, running, paused
  const [currentTest, setCurrentTest] = useState(null)
  const [realtimeData, setRealtimeData] = useState([])
  const [stats, setStats] = useState({
    totalTests: 0,
    successfulUnlocks: 0,
    failedUnlocks: 0,
    currentDuration: 0,
    averageResponseTime: 0
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

  const StatusCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">测试仪表板</h1>
        
        {/* 测试状态指示器 */}
        <div className="mb-8">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            testStatus === 'running' ? 'bg-success-100 text-success-800' :
            testStatus === 'paused' ? 'bg-warning-100 text-warning-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {testStatus === 'running' && <Play className="w-4 h-4 mr-2" />}
            {testStatus === 'paused' && <Pause className="w-4 h-4 mr-2" />}
            {testStatus === 'stopped' && <Square className="w-4 h-4 mr-2" />}
            测试状态: {testStatus === 'running' ? '运行中' : testStatus === 'paused' ? '已暂停' : '已停止'}
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusCard 
            title="总测试次数" 
            value={stats.totalTests.toLocaleString()} 
            icon={Hash} 
            color="blue" 
          />
          <StatusCard 
            title="成功开锁" 
            value={stats.successfulUnlocks.toLocaleString()} 
            icon={CheckCircle} 
            color="green" 
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
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">实时响应时间</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={realtimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis label={{ value: '响应时间 (ms)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
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
        </div>

        {/* 当前测试信息 */}
        {currentTest && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">当前测试配置</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">测试模式</p>
                <p className="font-medium">{currentTest.mode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">目标次数/时长</p>
                <p className="font-medium">{currentTest.target}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">测试间隔</p>
                <p className="font-medium">{currentTest.interval}秒</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard