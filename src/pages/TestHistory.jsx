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
      completed: { label: '已完成', color: 'bg-success-100 text-success-800' },
      failed: { label: '已失败', color: 'bg-danger-100 text-danger-800' },
      running: { label: '运行中', color: 'bg-primary-100 text-primary-800' },
      paused: { label: '已暂停', color: 'bg-warning-100 text-warning-800' }
    }
    
    const config = statusConfig[status] || statusConfig.completed
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">测试历史</h1>
          <div className="flex space-x-4">
            {selectedTests.length > 0 && (
              <>
                <button 
                  onClick={handleExportSelected}
                  className="btn btn-primary px-4 py-2 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  导出选中 ({selectedTests.length})
                </button>
                <button 
                  onClick={handleDeleteSelected}
                  className="btn btn-danger px-4 py-2 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除选中
                </button>
              </>
            )}
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索测试..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
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
              className="input"
            >
              <option value="all">所有时间</option>
              <option value="today">今天</option>
              <option value="week">最近一周</option>
              <option value="month">最近一月</option>
            </select>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="date">按日期排序</option>
              <option value="duration">按时长排序</option>
              <option value="attempts">按次数排序</option>
              <option value="success_rate">按成功率排序</option>
            </select>
            
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="input"
            >
              <option value="desc">降序</option>
              <option value="asc">升序</option>
            </select>
          </div>
        </div>

        {/* 测试列表 */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTests.length === filteredAndSortedTests.length && filteredAndSortedTests.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">测试信息</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">配置</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">结果</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedTests.map((test) => (
                  <tr key={test.id} className={selectedTests.includes(test.id) ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTests.includes(test.id)}
                        onChange={() => handleSelectTest(test.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{test.name}</div>
                        <div className="text-sm text-gray-500">{test.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{test.lockModel}</div>
                        <div className="text-sm text-gray-500">{test.testType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {test.startTime.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {Math.floor(test.duration / 60)}h {test.duration % 60}m
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {test.totalAttempts.toLocaleString()} 次
                        </div>
                        <div className="text-sm text-gray-500">
                          成功率: {test.successRate}%
                        </div>
                        <div className="text-sm text-gray-500">
                          响应: {test.averageResponseTime}ms
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {getStatusBadge(test.status)}
                        {test.failureReason && (
                          <div className="text-xs text-red-600 mt-1">{test.failureReason}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAndSortedTests.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">没有找到匹配的测试记录</div>
            </div>
          )}
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{testHistory.length}</div>
            <div className="text-sm text-gray-600">总测试数</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-success-600">
              {testHistory.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">已完成</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-danger-600">
              {testHistory.filter(t => t.status === 'failed').length}
            </div>
            <div className="text-sm text-gray-600">已失败</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">
              {testHistory.filter(t => t.status === 'running').length}
            </div>
            <div className="text-sm text-gray-600">运行中</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestHistory