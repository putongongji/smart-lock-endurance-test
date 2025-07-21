import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Zap, Download, Filter, Calendar } from 'lucide-react'
import { useTestHistory, useTestSummary } from '../hooks/useAppState'

const TestResults = () => {
  const [selectedTest, setSelectedTest] = useState('latest')
  const [timeRange, setTimeRange] = useState('24h') // 1h, 6h, 24h, 7d
  const [filterType, setFilterType] = useState('all') // all, success, failure
  
  const { testHistory, loadTestHistory, deleteTestResult } = useTestHistory()
  const { statistics, trends } = useTestSummary()
  
  // 加载测试历史数据
  useEffect(() => {
    loadTestHistory()
  }, [])
  
  // 根据时间范围过滤数据
  const getFilteredData = () => {
    if (!testHistory || testHistory.length === 0) return []
    
    const now = new Date()
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    }[timeRange]
    
    return testHistory.filter(test => {
      const testTime = new Date(test.startTime)
      return now - testTime <= timeRangeMs
    })
  }
  
  // 生成性能趋势数据
  const getPerformanceData = () => {
    const filteredData = getFilteredData()
    if (filteredData.length === 0) return []
    
    return filteredData.map(test => ({
      time: new Date(test.startTime).toLocaleTimeString(),
      responseTime: test.statistics?.avgResponseTime || 0,
      successRate: test.statistics ? (test.statistics.successCount / test.statistics.totalAttempts) * 100 : 0,
      attempts: test.statistics?.totalAttempts || 0,
      testId: test.id
    }))
  }
  
  // 生成故障分析数据
  const getFailureAnalysis = () => {
    const filteredData = getFilteredData()
    if (filteredData.length === 0) return []
    
    const failureTypes = {
      'timeout': { name: '响应超时', count: 0 },
      'connection': { name: '连接失败', count: 0 },
      'device': { name: '设备错误', count: 0 },
      'other': { name: '其他错误', count: 0 }
    }
    
    filteredData.forEach(test => {
      if (test.results) {
        test.results.forEach(result => {
          if (!result.success) {
            const errorType = result.error?.type || 'other'
            if (failureTypes[errorType]) {
              failureTypes[errorType].count++
            } else {
              failureTypes.other.count++
            }
          }
        })
      }
    })
    
    return Object.values(failureTypes)
      .filter(type => type.count > 0)
      .map(type => ({
        type: type.name,
        count: type.count,
        percentage: (type.count / Object.values(failureTypes).reduce((sum, t) => sum + t.count, 0)) * 100
      }))
  }
  
  // 获取当前选择的测试数据
  const getCurrentTestData = () => {
    if (selectedTest === 'latest') {
      return testHistory?.[0] || null
    }
    return testHistory?.find(test => test.id === selectedTest) || null
  }
  
  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981']
  
  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm font-medium ${
              change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-slate-600'
            }`}>
              {change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : 
               change < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
              {change !== 0 ? `${Math.abs(change).toFixed(1)}%` : '无变化'}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${
          color === 'blue' ? 'bg-blue-100 text-blue-600' :
          color === 'green' ? 'bg-green-100 text-green-600' :
          color === 'yellow' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
  
  const performanceData = getPerformanceData()
  const failureAnalysis = getFailureAnalysis()
  const currentTest = getCurrentTestData()
  
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* 页面标题和筛选器 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">测试结果分析</h1>
            <p className="text-slate-600">实时监控测试数据与性能指标</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>导出报告</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">选择测试</label>
            <select 
              value={selectedTest} 
              onChange={(e) => setSelectedTest(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="latest">最新测试</option>
              {testHistory?.map(test => (
                <option key={test.id} value={test.id}>
                  {new Date(test.startTime).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">时间范围</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="1h">最近1小时</option>
              <option value="6h">最近6小时</option>
              <option value="24h">最近24小时</option>
              <option value="7d">最近7天</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">结果类型</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="all">全部结果</option>
              <option value="success">仅成功</option>
              <option value="failure">仅失败</option>
            </select>
          </div>
        </div>
      </div>

      {/* 概览统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="总测试次数" 
          value={statistics?.totalAttempts?.toLocaleString() || '0'} 
          change={trends?.attemptsChange}
          icon={Zap} 
          color="blue" 
        />
        <StatCard 
          title="成功率" 
          value={statistics ? `${((statistics.successCount / statistics.totalAttempts) * 100).toFixed(1)}%` : '0%'} 
          change={trends?.successRateChange}
          icon={CheckCircle} 
          color="green" 
        />
        <StatCard 
          title="平均响应时间" 
          value={`${statistics?.avgResponseTime?.toFixed(0) || 0}ms`} 
          change={trends?.responseTimeChange}
          icon={Clock} 
          color="yellow" 
        />
        <StatCard 
          title="失败次数" 
          value={statistics?.failureCount?.toLocaleString() || '0'} 
          change={trends?.failureChange}
          icon={AlertTriangle} 
          color="red" 
        />
      </div>

      {/* 响应时间趋势图已移除 */}

      {/* 成功率趋势图已移除 */}

      {/* 故障类型分析和测试频率分布图表已移除 */}

      {/* 当前测试详情 */}
      {currentTest && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            测试详情
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">测试ID:</span>
                <span className="font-medium">{currentTest.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">开始时间:</span>
                <span className="font-medium">{new Date(currentTest.startTime).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">结束时间:</span>
                <span className="font-medium">
                  {currentTest.endTime ? new Date(currentTest.endTime).toLocaleString() : '进行中'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">测试状态:</span>
                <span className={`font-medium ${
                  currentTest.status === 'completed' ? 'text-green-600' :
                  currentTest.status === 'running' ? 'text-blue-600' :
                  currentTest.status === 'paused' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {currentTest.status === 'completed' ? '已完成' :
                   currentTest.status === 'running' ? '运行中' :
                   currentTest.status === 'paused' ? '已暂停' : '已停止'}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">总测试次数:</span>
                <span className="font-medium">{currentTest.config?.cycles || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">测试间隔:</span>
                <span className="font-medium">{currentTest.config?.interval || 0}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">超时时间:</span>
                <span className="font-medium">{currentTest.config?.timeout || 0}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">重试设置:</span>
                <span className="font-medium">{currentTest.config?.retryEnabled ? '启用' : '禁用'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 测试总结与建议 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          测试总结与建议
        </h3>
        <div className="space-y-4">
          {statistics && statistics.totalAttempts > 0 ? (
            <>
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-800">整体表现评估</p>
                  <p className="text-sm text-slate-600">
                    成功率 {((statistics.successCount / statistics.totalAttempts) * 100).toFixed(1)}%，
                    平均响应时间 {statistics.avgResponseTime?.toFixed(0)}ms。
                    {statistics.successCount / statistics.totalAttempts >= 0.95 ? 
                      '设备表现优秀，运行稳定。' : 
                      statistics.successCount / statistics.totalAttempts >= 0.90 ? 
                        '设备表现良好，建议定期维护。' : 
                        '设备表现需要改善，建议检查硬件状态。'
                    }
                  </p>
                </div>
              </div>
              
              {statistics.avgResponseTime > 200 && (
                <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800">响应时间警告</p>
                    <p className="text-sm text-slate-600">
                      平均响应时间超过200ms，建议检查蓝牙连接质量和设备性能。
                    </p>
                  </div>
                </div>
              )}
              
              {statistics.failureCount > statistics.totalAttempts * 0.1 && (
                <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800">失败率过高</p>
                    <p className="text-sm text-slate-600">
                      失败率超过10%，建议检查设备硬件状态和蓝牙连接稳定性。
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl">
                <Clock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-800">维护建议</p>
                  <p className="text-sm text-slate-600">
                    建议每完成1000次测试后进行设备检查，确保长期稳定运行。
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600">暂无测试数据</p>
              <p className="text-sm text-slate-500">请先进行测试以查看结果分析</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 底部间距 */}
      <div className="h-20"></div>
    </div>
  )
}

export default TestResults