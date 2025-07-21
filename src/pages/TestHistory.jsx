import React, { useState, useMemo } from 'react'
import { Search, Download, Eye, Trash2, Calendar, Clock, Filter, SortAsc, SortDesc, X, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { useTestHistory, useUIState } from '../hooks/useAppState'
import { formatTime, formatDuration } from '../utils/timeUtils'

const TestHistory = () => {
  const { testHistory, deleteTest, exportTests, clearHistory } = useTestHistory()
  const { showAlert } = useUIState()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, completed, failed, running, paused
  const [filterDateRange, setFilterDateRange] = useState('all') // all, today, week, month
  const [sortBy, setSortBy] = useState('startTime') // startTime, duration, totalAttempts, successRate
  const [sortOrder, setSortOrder] = useState('desc') // asc, desc
  const [selectedTests, setSelectedTests] = useState(new Set())
  const [selectedTestDetails, setSelectedTestDetails] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // 过滤和排序逻辑
  const filteredAndSortedTests = useMemo(() => {
    return testHistory
      .filter(test => {
        // 搜索过滤
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          if (!test.name?.toLowerCase().includes(searchLower) &&
              !test.id?.toLowerCase().includes(searchLower) &&
              !test.deviceName?.toLowerCase().includes(searchLower)) {
            return false
          }
        }
        
        // 状态过滤
        if (filterStatus !== 'all' && test.status !== filterStatus) {
          return false
        }
        
        // 日期过滤
        if (filterDateRange !== 'all') {
          const now = new Date()
          const testDate = new Date(test.startTime)
          
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
          case 'startTime':
            aValue = new Date(a.startTime)
            bValue = new Date(b.startTime)
            break
          case 'duration':
            aValue = a.duration || 0
            bValue = b.duration || 0
            break
          case 'totalAttempts':
            aValue = a.totalAttempts || 0
            bValue = b.totalAttempts || 0
            break
          case 'successRate':
            aValue = a.successRate || 0
            bValue = b.successRate || 0
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
  }, [testHistory, searchTerm, filterStatus, filterDateRange, sortBy, sortOrder])

  const handleExportAll = async () => {
    try {
      await exportTests(filteredAndSortedTests)
      showAlert('测试记录导出成功', 'success')
    } catch (error) {
      showAlert('导出失败: ' + error.message, 'error')
    }
  }

  const handleExportSelected = async () => {
    const selectedTestsArray = filteredAndSortedTests.filter(test => selectedTests.has(test.id))
    if (selectedTestsArray.length === 0) {
      showAlert('请先选择要导出的测试记录', 'warning')
      return
    }
    
    try {
      await exportTests(selectedTestsArray)
      showAlert(`已导出 ${selectedTestsArray.length} 条测试记录`, 'success')
    } catch (error) {
      showAlert('导出失败: ' + error.message, 'error')
    }
  }

  const handleDeleteTest = async (testId) => {
    if (window.confirm('确定要删除这个测试记录吗？此操作无法撤销。')) {
      try {
        await deleteTest(testId)
        showAlert('测试记录已删除', 'success')
      } catch (error) {
        showAlert('删除失败: ' + error.message, 'error')
      }
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedTests.size === 0) {
      showAlert('请先选择要删除的测试记录', 'warning')
      return
    }
    
    if (window.confirm(`确定要删除选中的 ${selectedTests.size} 条测试记录吗？此操作无法撤销。`)) {
      try {
        for (const testId of selectedTests) {
          await deleteTest(testId)
        }
        setSelectedTests(new Set())
        showAlert(`已删除 ${selectedTests.size} 条测试记录`, 'success')
      } catch (error) {
        showAlert('删除失败: ' + error.message, 'error')
      }
    }
  }

  const handleClearHistory = async () => {
    if (window.confirm('确定要清空所有测试历史吗？此操作无法撤销。')) {
      try {
        await clearHistory()
        setSelectedTests(new Set())
        showAlert('测试历史已清空', 'success')
      } catch (error) {
        showAlert('清空失败: ' + error.message, 'error')
      }
    }
  }

  const handleViewDetails = (test) => {
    setSelectedTestDetails(test)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedTestDetails(null)
  }

  const toggleTestSelection = (testId) => {
    const newSelected = new Set(selectedTests)
    if (newSelected.has(testId)) {
      newSelected.delete(testId)
    } else {
      newSelected.add(testId)
    }
    setSelectedTests(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedTests.size === filteredAndSortedTests.length) {
      setSelectedTests(new Set())
    } else {
      setSelectedTests(new Set(filteredAndSortedTests.map(test => test.id)))
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

  const getTestTypeLabel = (testType) => {
    const typeLabels = {
      unlock: '开锁测试',
      lock: '上锁测试',
      both: '开锁+上锁',
      endurance: '耐久性测试'
    }
    return typeLabels[testType] || testType
  }

  const statistics = useMemo(() => {
    const total = testHistory.length
    const completed = testHistory.filter(test => test.status === 'completed').length
    const failed = testHistory.filter(test => test.status === 'failed').length
    const running = testHistory.filter(test => test.status === 'running').length
    const paused = testHistory.filter(test => test.status === 'paused').length
    
    return { total, completed, failed, running, paused }
  }, [testHistory])

  return (
    <div className="p-4 pb-20 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* 页面标题 */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl p-6 mb-4 shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-2">测试历史</h1>
          <p className="text-blue-100 text-sm">查看和管理所有测试记录</p>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleExportAll}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            导出全部
          </button>
          
          {selectedTests.size > 0 && (
            <>
              <button 
                onClick={handleExportSelected}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                导出选中 ({selectedTests.size})
              </button>
              
              <button 
                onClick={handleDeleteSelected}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除选中 ({selectedTests.size})
              </button>
            </>
          )}
          
          {testHistory.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清空历史
            </button>
          )}
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索测试名称、ID或设备名称..."
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
              <option value="startTime">按开始时间排序</option>
              <option value="duration">按持续时间排序</option>
              <option value="totalAttempts">按测试次数排序</option>
              <option value="successRate">按成功率排序</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 flex items-center justify-center"
            >
              {sortOrder === 'asc' ? (
                <><SortAsc className="w-4 h-4 mr-2" />升序</>
              ) : (
                <><SortDesc className="w-4 h-4 mr-2" />降序</>
              )}
            </button>
          </div>
          
          {/* 批量选择 */}
          {filteredAndSortedTests.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTests.size === filteredAndSortedTests.length && filteredAndSortedTests.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-600">全选</span>
              </label>
              <span className="text-sm text-slate-500">
                已选择 {selectedTests.size} / {filteredAndSortedTests.length} 项
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 测试列表 */}
      <div className="space-y-4 mb-6">
        {filteredAndSortedTests.map((test) => (
          <div key={test.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedTests.has(test.id)}
                  onChange={() => toggleTestSelection(test.id)}
                  className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{test.name || `测试 ${test.id}`}</h3>
                  <p className="text-sm text-slate-500 font-medium">{test.id}</p>
                  {test.deviceName && (
                    <p className="text-xs text-slate-400 font-medium">设备: {test.deviceName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(test.status)}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewDetails(test)}
                    className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                    title="查看详情"
                  >
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
                <p className="text-xs font-semibold text-slate-500 mb-2">测试配置</p>
                <p className="text-sm font-bold text-slate-900">{getTestTypeLabel(test.testType)}</p>
                {test.testConfig && (
                  <p className="text-xs text-slate-600 font-medium">
                    {test.testConfig.testCount} 次测试，间隔 {test.testConfig.interval}ms
                  </p>
                )}
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 mb-2">测试时间</p>
                <div className="text-sm font-bold text-slate-900 flex items-center mb-1">
                  <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                  {formatTime(test.startTime, 'date')}
                </div>
                <div className="text-xs text-slate-600 font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-green-600" />
                  {test.duration ? formatDuration(test.duration) : '进行中'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-center mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-600 mb-1">总次数</p>
                <p className="text-sm font-bold text-gray-700">{(test.totalAttempts || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-600 mb-1">成功率</p>
                <p className="text-sm font-bold text-green-700">{(test.successRate || 0).toFixed(1)}%</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-600 mb-1">响应时间</p>
                <p className="text-sm font-bold text-gray-700">{test.averageResponseTime || 0}ms</p>
              </div>
            </div>
            
            {test.failureReason && (
              <div className="mt-3 p-3 bg-red-50/80 rounded-xl border border-red-200/50">
                <p className="text-xs font-medium text-red-700">失败原因: {test.failureReason}</p>
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
            {testHistory.length === 0 && (
              <p className="text-slate-400 text-sm mt-2">还没有任何测试记录，开始第一个测试吧！</p>
            )}
          </div>
        )}
      </div>

      {/* 底部统计 */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-bold mb-4 text-slate-900">统计信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
            <div className="text-2xl font-bold text-slate-900">{statistics.total}</div>
            <div className="text-sm font-medium text-slate-600">总测试数</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
            <div className="text-2xl font-bold text-green-700">{statistics.completed}</div>
            <div className="text-sm font-medium text-slate-600">已完成</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
            <div className="text-2xl font-bold text-red-700">{statistics.failed}</div>
            <div className="text-sm font-medium text-slate-600">已失败</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="text-2xl font-bold text-blue-700">{statistics.running + statistics.paused}</div>
            <div className="text-sm font-medium text-slate-600">进行中</div>
          </div>
        </div>
      </div>
      
      {/* 底部间距 */}
      <div className="h-20"></div>
      
      {/* 详情模态框 */}
      {showDetailsModal && selectedTestDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* 模态框头部 */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedTestDetails.name || `测试 ${selectedTestDetails.id}`}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">测试详情信息</p>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* 模态框内容 */}
            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  基本信息
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600 font-medium">测试ID:</span>
                    <p className="font-semibold text-slate-900">{selectedTestDetails.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">设备名称:</span>
                    <p className="font-semibold text-slate-900">{selectedTestDetails.deviceName || '未知设备'}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">测试类型:</span>
                    <p className="font-semibold text-slate-900">{getTestTypeLabel(selectedTestDetails.testType)}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">状态:</span>
                    <div className="mt-1">{getStatusBadge(selectedTestDetails.status)}</div>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">开始时间:</span>
                    <p className="font-semibold text-slate-900">{formatTime(selectedTestDetails.startTime)}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">结束时间:</span>
                    <p className="font-semibold text-slate-900">
                      {selectedTestDetails.endTime ? formatTime(selectedTestDetails.endTime) : '进行中'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">持续时间:</span>
                    <p className="font-semibold text-slate-900">
                      {selectedTestDetails.duration ? formatDuration(selectedTestDetails.duration) : '进行中'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 测试配置 */}
              {selectedTestDetails.testConfig && (
                <div className="bg-blue-50 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                    测试配置
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600 font-medium">测试次数:</span>
                      <p className="font-semibold text-slate-900">{selectedTestDetails.testConfig.testCount}</p>
                    </div>
                    <div>
                      <span className="text-slate-600 font-medium">测试间隔:</span>
                      <p className="font-semibold text-slate-900">{selectedTestDetails.testConfig.interval}ms</p>
                    </div>
                    <div>
                      <span className="text-slate-600 font-medium">超时时间:</span>
                      <p className="font-semibold text-slate-900">{selectedTestDetails.testConfig.timeout || 5000}ms</p>
                    </div>
                    <div>
                      <span className="text-slate-600 font-medium">重试次数:</span>
                      <p className="font-semibold text-slate-900">{selectedTestDetails.testConfig.retryCount || 0}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 测试结果统计 */}
              <div className="bg-green-50 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  测试结果
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600 font-medium">总测试次数:</span>
                    <p className="font-semibold text-slate-900">{(selectedTestDetails.totalAttempts || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">成功次数:</span>
                    <p className="font-semibold text-green-700">{(selectedTestDetails.successCount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">失败次数:</span>
                    <p className="font-semibold text-red-700">{(selectedTestDetails.failureCount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">成功率:</span>
                    <p className="font-semibold text-slate-900">{(selectedTestDetails.successRate || 0).toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">平均响应时间:</span>
                    <p className="font-semibold text-slate-900">{selectedTestDetails.averageResponseTime || 0}ms</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">最大响应时间:</span>
                    <p className="font-semibold text-slate-900">{selectedTestDetails.maxResponseTime || 0}ms</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">最小响应时间:</span>
                    <p className="font-semibold text-slate-900">{selectedTestDetails.minResponseTime || 0}ms</p>
                  </div>
                </div>
              </div>
              
              {/* 错误信息 */}
              {selectedTestDetails.failureReason && (
                <div className="bg-red-50 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                    错误信息
                  </h3>
                  <p className="text-sm text-red-700 font-medium">{selectedTestDetails.failureReason}</p>
                </div>
              )}
              
              {/* 备注信息 */}
              {selectedTestDetails.notes && (
                <div className="bg-slate-50 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">备注信息</h3>
                  <p className="text-sm text-slate-700">{selectedTestDetails.notes}</p>
                </div>
              )}
              
              {/* 详细测试结果 */}
              {selectedTestDetails.results && selectedTestDetails.results.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">详细测试结果</h3>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {selectedTestDetails.results.slice(0, 50).map((result, index) => (
                      <div key={index} className={`p-3 rounded-xl text-sm ${
                        result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">测试 #{index + 1}</span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                            result.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                          }`}>
                            {result.success ? '成功' : '失败'}
                          </span>
                        </div>
                        <div className="mt-1 text-xs">
                          <span>响应时间: {result.responseTime || 0}ms</span>
                          {result.error && (
                            <span className="ml-4">错误: {result.error.message}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {selectedTestDetails.results.length > 50 && (
                      <p className="text-xs text-slate-500 text-center py-2">
                        显示前50条结果，共{selectedTestDetails.results.length}条
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestHistory