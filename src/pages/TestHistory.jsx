import React, { useState, useEffect } from 'react'
import { Search, Filter, Download, Eye, Trash2, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'

const TestHistory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, completed, failed, running
  const [filterDateRange, setFilterDateRange] = useState('all') // all, today, week, month
  const [sortBy, setSortBy] = useState('date') // date, duration, attempts, success_rate
  const [sortOrder, setSortOrder] = useState('desc') // asc, desc
  const [selectedTests, setSelectedTests] = useState([])
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

  const handleSelectTest = (testId) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    )
  }

  const handleSelectAll = () => {
    if (selectedTests.length === filteredAndSortedTests.length) {
      setSelectedTests([])
    } else {
      setSelectedTests(filteredAndSortedTests.map(test => test.id))
    }
  }

  const handleExportSelected = () => {
    const selectedData = filteredAndSortedTests.filter(test => selectedTests.includes(test.id))
    const csvContent = [
      ['测试ID', '测试名称', '锁型号', '测试类型', '开始时间', '结束时间', '持续时间(分钟)', '总次数', '成功次数', '失败次数', '成功率(%)', '平均响应时间(ms)', '状态', '备注'].join(','),
      ...selectedData.map(test => [
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

  const handleDeleteSelected = () => {
    if (window.confirm(`确定要删除选中的 ${selectedTests.length} 个测试记录吗？`)) {
      setTestHistory(prev => prev.filter(test => !selectedTests.includes(test.id)))
      setSelectedTests([])
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
      failed: { label: '已失败', color: 'bg-red-100 text-red-800' },
      running: { label: '运行中', color: 'bg-blue-100 text-blue-800' },
      paused: { label: '已暂停', color: 'bg-yellow-100 text-yellow-800' }
    }
    
    const config = statusConfig[status] || statusConfig.completed
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {/* 页面标题 */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 mb-3">测试历史</h1>
        {selectedTests.length > 0 && (
          <div className="flex space-x-2">
            <button 
              onClick={handleExportSelected}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-1" />
              导出 ({selectedTests.length})
            </button>
            <button 
              onClick={handleDeleteSelected}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              删除
            </button>
          </div>
        )}
      </div>

        {/* 搜索和过滤 */}
        <div className="bg-white rounded-lg p-4 shadow-sm border mb-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索测试..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">按日期排序</option>
                <option value="duration">按时长排序</option>
                <option value="attempts">按次数排序</option>
                <option value="success_rate">按成功率排序</option>
              </select>
              
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">降序</option>
                <option value="asc">升序</option>
              </select>
            </div>
          </div>
        </div>

        {/* 全选控制 */}
        {filteredAndSortedTests.length > 0 && (
          <div className="bg-white rounded-lg p-3 shadow-sm border mb-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedTests.length === filteredAndSortedTests.length}
                onChange={handleSelectAll}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm text-gray-700">
                {selectedTests.length === filteredAndSortedTests.length ? '取消全选' : '全选'}
                ({filteredAndSortedTests.length} 项)
              </span>
            </label>
          </div>
        )}

        {/* 测试列表 */}
        <div className="space-y-3 mb-6">
          {filteredAndSortedTests.map((test) => (
            <div key={test.id} className={`bg-white rounded-lg p-4 shadow-sm border ${
              selectedTests.includes(test.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test.id)}
                    onChange={() => handleSelectTest(test.id)}
                    className="rounded border-gray-300 mt-1"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{test.name}</h3>
                    <p className="text-xs text-gray-500">{test.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(test.status)}
                  <div className="flex space-x-1">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500">配置信息</p>
                  <p className="text-sm text-gray-900">{test.lockModel}</p>
                  <p className="text-xs text-gray-600">{test.testType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">测试时间</p>
                  <div className="text-sm text-gray-900 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {test.startTime.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-600 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.floor(test.duration / 60)}h {test.duration % 60}m
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">总次数</p>
                  <p className="text-sm font-medium text-gray-900">{test.totalAttempts.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">成功率</p>
                  <p className="text-sm font-medium text-gray-900">{test.successRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">响应时间</p>
                  <p className="text-sm font-medium text-gray-900">{test.averageResponseTime}ms</p>
                </div>
              </div>
              
              {test.failureReason && (
                <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                  <p className="text-xs text-red-600">失败原因: {test.failureReason}</p>
                </div>
              )}
              
              {test.notes && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600">{test.notes}</p>
                </div>
              )}
            </div>
          ))}
          
          {filteredAndSortedTests.length === 0 && (
            <div className="bg-white rounded-lg p-8 shadow-sm border text-center">
              <div className="text-gray-500">没有找到匹配的测试记录</div>
            </div>
          )}
        </div>

        {/* 底部统计 */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h3 className="text-base font-semibold mb-3">统计信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-900">{testHistory.length}</div>
              <div className="text-xs text-gray-500">总测试数</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {testHistory.filter(test => test.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-500">已完成</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-600">
                {testHistory.filter(test => test.status === 'failed').length}
              </div>
              <div className="text-xs text-gray-500">已失败</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {testHistory.filter(test => test.status === 'running').length}
              </div>
              <div className="text-xs text-gray-500">运行中</div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default TestHistory