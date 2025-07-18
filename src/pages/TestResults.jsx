import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react'

const TestResults = () => {
  const [selectedTest, setSelectedTest] = useState('latest')
  const [timeRange, setTimeRange] = useState('1h') // 1h, 6h, 24h, 7d
  const [testData, setTestData] = useState({
    summary: {
      totalAttempts: 2450,
      successfulUnlocks: 2401,
      failedUnlocks: 49,
      successRate: 98.0,
      averageResponseTime: 85.6,
      testDuration: 245, // 分钟
      componentsAffected: ['电机', '传感器']
    },
    performanceData: [],
    failureAnalysis: [],
    componentHealth: []
  })

  // 生成模拟数据
  useEffect(() => {
    const generatePerformanceData = () => {
      const data = []
      const now = new Date()
      const intervals = timeRange === '1h' ? 12 : timeRange === '6h' ? 36 : timeRange === '24h' ? 48 : 168
      const step = timeRange === '1h' ? 5 : timeRange === '6h' ? 10 : timeRange === '24h' ? 30 : 60
      
      for (let i = intervals; i >= 0; i--) {
        const time = new Date(now.getTime() - i * step * 60000)
        data.push({
          time: time.toLocaleTimeString(),
          responseTime: Math.random() * 50 + 60 + (i < 10 ? Math.random() * 30 : 0), // 最近数据可能有性能下降
          successRate: Math.max(85, 100 - Math.random() * 15 - (i < 10 ? Math.random() * 10 : 0)),
          attempts: Math.floor(Math.random() * 20 + 10)
        })
      }
      return data
    }

    const generateFailureAnalysis = () => [
      { type: '电机卡顿', count: 28, percentage: 57.1 },
      { type: '传感器异常', count: 12, percentage: 24.5 },
      { type: '通信超时', count: 6, percentage: 12.2 },
      { type: '电源不稳定', count: 3, percentage: 6.1 }
    ]

    const generateComponentHealth = () => [
      { name: '电机', health: 78, status: 'warning', lastMaintenance: '2024-01-10' },
      { name: '传感器', health: 92, status: 'good', lastMaintenance: '2024-01-15' },
      { name: '电路板', health: 95, status: 'good', lastMaintenance: '2024-01-08' },
      { name: '电池', health: 88, status: 'good', lastMaintenance: '2024-01-12' },
      { name: '机械结构', health: 65, status: 'critical', lastMaintenance: '2023-12-20' }
    ]

    setTestData(prev => ({
      ...prev,
      performanceData: generatePerformanceData(),
      failureAnalysis: generateFailureAnalysis(),
      componentHealth: generateComponentHealth()
    }))
  }, [timeRange])

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981']

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-600 mb-2">{title}</p>
          <p className="text-xl font-bold text-slate-900">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-xs font-medium ${
              change > 0 ? 'text-gray-600' : 'text-green-600'
            }`}>
              {change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-2xl shadow-md ${
          color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
          color === 'green' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
          color === 'yellow' ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-gradient-to-br from-red-500 to-red-600'
        }`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-4 pb-20 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* 页面标题和筛选器 */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl p-6 mb-4 shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-2">测试结果分析</h1>
          <p className="text-blue-100 text-sm">实时监控测试数据与性能指标</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select 
            value={selectedTest} 
            onChange={(e) => setSelectedTest(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
          >
            <option value="latest">最新测试</option>
            <option value="test-001">测试-001</option>
            <option value="test-002">测试-002</option>
          </select>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
          >
            <option value="1h">最近1小时</option>
            <option value="6h">最近6小时</option>
            <option value="24h">最近24小时</option>
            <option value="7d">最近7天</option>
          </select>
        </div>
      </div>

        {/* 概览统计 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard 
            title="总测试次数" 
            value={testData.summary.totalAttempts.toLocaleString()} 
            icon={Zap} 
            color="blue" 
          />
          <StatCard 
            title="成功率" 
            value={`${testData.summary.successRate}%`} 
            change={-2.1}
            icon={CheckCircle} 
            color="green" 
          />
          <StatCard 
            title="平均响应时间" 
            value={`${testData.summary.averageResponseTime}ms`} 
            change={15.3}
            icon={Clock} 
            color="yellow" 
          />
          <StatCard 
            title="失败次数" 
            value={testData.summary.failedUnlocks.toLocaleString()} 
            change={8.7}
            icon={AlertTriangle} 
            color="red" 
          />
        </div>

        <div className="space-y-6 mb-6">
          {/* 性能趋势图 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-600" />
              响应时间趋势
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={testData.performanceData}>
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

          {/* 成功率趋势 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              成功率趋势
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={testData.performanceData}>
                  <Line 
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-6">
          {/* 故障类型分析 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
              故障类型分析
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={testData.failureAnalysis}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {testData.failureAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 测试频率分布 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-gray-600" />
              测试频率分布
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={testData.performanceData.slice(-12)}>
                  <Bar dataKey="attempts" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 组件健康状态 */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            组件健康状态
          </h3>
          <div className="space-y-4">
            {testData.componentHealth.map((component, index) => (
              <div key={index} className="bg-white/70 border border-white/30 rounded-2xl p-5 backdrop-blur-sm shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-900">{component.name}</span>
                  <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-xl shadow-sm ${
                    component.status === 'good' ? 'bg-green-100 text-green-800' :
          component.status === 'warning' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
                  }`}>
                    {component.status === 'good' ? '良好' : 
                     component.status === 'warning' ? '警告' : '严重'}
                  </span>
                </div>
                <div className="flex items-center mb-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 mr-4 shadow-inner">
                    <div 
                      className={`h-3 rounded-full shadow-sm ${
                        component.health >= 90 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                        component.health >= 70 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                      style={{ width: `${component.health}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{component.health}%</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>维护: {component.lastMaintenance}</span>
                  <span className={`font-bold ${
                    component.health < 70 ? 'text-gray-600' :
          component.health < 85 ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {component.health < 70 ? '立即维护' :
                     component.health < 85 ? '计划维护' : '正常'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 测试总结 */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
            测试总结与建议
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">性能下降趋势</p>
                <p className="text-xs text-gray-600">在测试进行到2000次后，响应时间开始显著增加，建议检查电机和机械结构。</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">整体表现良好</p>
                <p className="text-xs text-gray-600">98%的成功率表明智能锁在正常使用范围内表现稳定。</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">维护建议</p>
                <p className="text-xs text-gray-600">建议每1500次使用后进行预防性维护，重点关注机械结构润滑。</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部间距，为底部导航栏留出空间 */}
        <div className="h-20"></div>
    </div>
  )
}

export default TestResults