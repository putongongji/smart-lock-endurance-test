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
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center mt-1 text-sm ${
              change > 0 ? 'text-success-600' : 'text-danger-600'
            }`}>
              {change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">测试结果分析</h1>
          <div className="flex space-x-4">
            <select 
              value={selectedTest} 
              onChange={(e) => setSelectedTest(e.target.value)}
              className="input"
            >
              <option value="latest">最新测试</option>
              <option value="test-001">测试-001</option>
              <option value="test-002">测试-002</option>
            </select>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="input"
            >
              <option value="1h">最近1小时</option>
              <option value="6h">最近6小时</option>
              <option value="24h">最近24小时</option>
              <option value="7d">最近7天</option>
            </select>
          </div>
        </div>

        {/* 概览统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 性能趋势图 */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">响应时间趋势</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={testData.performanceData}>
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

          {/* 成功率趋势 */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">成功率趋势</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={testData.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[80, 100]} label={{ value: '成功率 (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 故障类型分析 */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">故障类型分析</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={testData.failureAnalysis}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {testData.failureAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 测试频率分布 */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">测试频率分布</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={testData.performanceData.slice(-12)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis label={{ value: '测试次数', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="attempts" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 组件健康状态 */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">组件健康状态</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">组件名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">健康度</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后维护</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">建议</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testData.componentHealth.map((component, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {component.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className={`h-2 rounded-full ${
                              component.health >= 90 ? 'bg-success-500' :
                              component.health >= 70 ? 'bg-warning-500' : 'bg-danger-500'
                            }`}
                            style={{ width: `${component.health}%` }}
                          ></div>
                        </div>
                        <span>{component.health}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        component.status === 'good' ? 'bg-success-100 text-success-800' :
                        component.status === 'warning' ? 'bg-warning-100 text-warning-800' :
                        'bg-danger-100 text-danger-800'
                      }`}>
                        {component.status === 'good' ? '良好' : 
                         component.status === 'warning' ? '警告' : '严重'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {component.lastMaintenance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {component.health < 70 ? '立即维护' :
                       component.health < 85 ? '计划维护' : '正常'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 测试总结 */}
        <div className="card p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">测试总结与建议</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-warning-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">性能下降趋势</p>
                <p className="text-sm text-gray-600">在测试进行到2000次后，响应时间开始显著增加，建议检查电机和机械结构。</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-success-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">整体表现良好</p>
                <p className="text-sm text-gray-600">98%的成功率表明智能锁在正常使用范围内表现稳定。</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-primary-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">维护建议</p>
                <p className="text-sm text-gray-600">建议每1500次使用后进行预防性维护，重点关注机械结构润滑。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestResults