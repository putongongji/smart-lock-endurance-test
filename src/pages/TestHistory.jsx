import React, { useState, useEffect } from 'react'
import { Search, Filter, Download, Eye, Trash2, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'

const TestHistory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, completed, failed, running
  const [filterDateRange, setFilterDateRange] = useState('all') // all, today, week, month
  const [sortBy, setSortBy] = useState('date') // date, duration, attempts, success_rate
  const [sortOrder, setSortOrder] = useState('desc') // asc, desc

  const [testHistory, setTestHistory] = useState([])

  // 生成模拟历史数据
  useEffect(() => {
    const generateTestHistory = () => {
      const tests = []
      const statuses = ['completed', 'failed', 'running', 'paused']
      const lockModels = ['SL-001', 'SL-002', 'SL-003']
      const testTypes = ['unlock', 'lock', 'both']
      
      for (let i = 0; i < 25; i++) {
        const startDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        const duration = Math.floor(Math.random() * 480 + 30) // 30-510分钟
        const attempts = Math.floor(Math.random() * 5000 + 100)
        const successRate = Math.random() * 20 + 80 // 80-100%
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        
        tests.push({
          id: `test-${String(i + 1).padStart(3, '0')}`,
          name: `耐久性测试 ${i + 1}`,
          lockModel: lockModels[Math.floor(Math.random() * lockModels.length)],
          testType: testTypes[Math.floor(Math.random() * testTypes.length)],
          startTime: startDate,
          endTime: status === 'completed' || status === 'failed' ? 
            new Date(startDate.getTime() + duration * 60000) : null,
          duration: status === 'completed' || status === 'failed' ? duration : 
            Math.floor((Date.now() - startDate.getTime()) / 60000),
          totalAttempts: attempts,
          successfulAttempts: Math.floor(attempts * successRate / 100),
          failedAttempts: attempts - Math.floor(attempts * successRate / 100),
          successRate: parseFloat(successRate.toFixed(1)),
          averageResponseTime: Math.floor(Math.random() * 50 + 60),
          status: status,
          failureReason: status === 'failed' ? 
            ['电机故障', '传感器异常', '通信中断', '电源问题'][Math.floor(Math.random() * 4)] : null,
          notes: status === 'completed' ? '测试正常完成' : 
                status === 'failed' ? '测试中断，需要检查硬件' : 
                status === 'running' ? '测试进行中' : '测试已暂停'
        })
      }
      
      return tests.sort((a, b) => b.startTime - a.startTime)
    }

    setTestHistory(generateTestHistory())
  }, [])

  // 过滤和排序逻辑
  const filteredAndSortedTests = testHistory
    .filter(test => {
      // 搜索过滤
      if (searchTerm && !test.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !test.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !test.lockModel.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // 状态过滤
      if (filterStatus !== 'all' && test.status !== filterStatus) {
        return false
      }
      
      // 日期过滤
      if (filterDateRange !== 'all') {
        const now = new Date()
        const testDate = test.startTime
        
        switch (filterDateRange) {
          case 'today':
            if (testDate.toDateString() !== now.toDateString()) return false
            break
          case 'week':
            if (now - testDate > 7 * 24 * 60 * 60 * 1000) return false
            break
          case 'month':
            if (now - testDate > 30 * 24 * 60 * 60 * 1000) return false
            break
        }
      }
      
      return true
    })
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'date':
          aValue = a.startTime
          bValue = b.startTime
          break
        case 'duration':
          aValue = a.duration
          bValue = b.duration
          break
        case 'attempts':
          aValue = a.totalAttempts
          bValue = b.totalAttempts
          break
        case 'success_rate':
          aValue = a.successRate
          bValue = b.successRate
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const handleExportAll = () => {
    const csvContent = [
      ['测试ID', '测试名称', '锁型号', '测试类型', '开始时间', '结束时间', '持续时间(分钟)', '总次数', '成功次数', '失败次数', '成功率(%)', '平均响应时间(ms)', '状态', '备注'].join(','),
      ...filteredAndSortedTests.map(test => [
        test.id,
        test.name,
        test.lockModel,
        test.testType,
        test.startTime.toLocaleString(),
        test.endTime ? test.endTime.toLocaleString() : '',
        test.duration,
        test.totalAttempts,
        test.successfulAttempts,
        test.failedAttempts,
        test.successRate,
        test.averageResponseTime,
        test.status,
        test.notes
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `test_history_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleDeleteTest = (testId) => {
    if (window.confirm('确定要删除这个测试记录吗？')) {
      setTestHistory(prev => prev.filter(test => test.id !== testId))
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
    failed: { label: '已失败', color: 'bg-gray-100 text-gray-800' },
    running: { label: '运行中', color: 'bg-blue-100 text-blue-800' },
    paused: { label: '已暂停', color: 'bg-blue-100 text-blue-800' }
    }
    
    const config = statusConfig[status] || statusConfig.completed
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="p-4 pb-20 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* 页面标题 */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl p-6 mb-4 shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-2">测试历史</h1>
          <p className="text-blue-100 text-sm">查看和管理所有测试记录</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleExportAll}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            导出全部
          </button>
        </div>
      </div>

        {/* 搜索和过滤 */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索测试..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              >
                <option value="all">所有状态</option>
                <option value="completed">已完成</option>
                <option value="failed">已失败</option>
                <option value="running">运行中</option>
                <option value="paused">已暂停</option>
              </select>
              
              <select 
                value={filterDateRange} 
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              >
                <option value="all">所有时间</option>
                <option value="today">今天</option>
                <option value="week">最近一周</option>
                <option value="month">最近一月</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              >
                <option value="date">按日期排序</option>
                <option value="duration">按时长排序</option>
                <option value="attempts">按次数排序</option>
                <option value="success_rate">按成功率排序</option>
              </select>
              
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
              >
                <option value="desc">降序</option>
                <option value="asc">升序</option>
              </select>
            </div>
          </div>
        </div>



        {/* 测试列表 */}
        <div className="space-y-4 mb-6">
          {filteredAndSortedTests.map((test) => (
            <div key={test.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{test.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{test.id}</p>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(test.status)}
                  <div className="flex space-x-2">
                    <button className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTest(test.id)}
                      className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div className="bg-white/50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2">配置信息</p>
                  <p className="text-sm font-bold text-slate-900">{test.lockModel}</p>
                  <p className="text-xs text-slate-600 font-medium">{test.testType}</p>
                </div>
                <div className="bg-white/50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2">测试时间</p>
                  <div className="text-sm font-bold text-slate-900 flex items-center mb-1">
                    <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                    {test.startTime.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-600 font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-green-600" />
                    {Math.floor(test.duration / 60)}h {test.duration % 60}m
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-600 mb-1">总次数</p>
                  <p className="text-sm font-bold text-gray-700">{test.totalAttempts.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-600 mb-1">成功率</p>
                  <p className="text-sm font-bold text-green-700">{test.successRate}%</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-600 mb-1">响应时间</p>
                  <p className="text-sm font-bold text-gray-700">{test.averageResponseTime}ms</p>
                </div>
              </div>
              
              {test.failureReason && (
                <div className="mt-3 p-3 bg-gray-50/80 rounded-xl border border-gray-200/50">
                  <p className="text-xs font-medium text-gray-700">失败原因: {test.failureReason}</p>
                </div>
              )}
              
              {test.notes && (
                <div className="mt-3 p-3 bg-slate-50/80 rounded-xl">
                  <p className="text-xs font-medium text-slate-600">{test.notes}</p>
                </div>
              )}
            </div>
          ))}
          
          {filteredAndSortedTests.length === 0 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 text-center">
              <div className="text-slate-500 font-medium text-lg">没有找到匹配的测试记录</div>
            </div>
          )}
        </div>

        {/* 底部统计 */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-bold mb-4 text-slate-900">统计信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
              <div className="text-2xl font-bold text-slate-900">{testHistory.length}</div>
              <div className="text-sm font-medium text-slate-600">总测试数</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
              <div className="text-2xl font-bold text-green-700">
                {testHistory.filter(test => test.status === 'completed').length}
              </div>
              <div className="text-sm font-medium text-slate-600">已完成</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
              <div className="text-2xl font-bold text-gray-700">
                {testHistory.filter(test => test.status === 'failed').length}
              </div>
              <div className="text-sm font-medium text-slate-600">已失败</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-2xl font-bold text-blue-700">
                {testHistory.filter(test => test.status === 'running').length}
              </div>
              <div className="text-sm font-medium text-slate-600">运行中</div>
            </div>
          </div>
        </div>
        
        {/* 底部间距 */}
        <div className="h-20"></div>
      </div>
  )
}

export default TestHistory