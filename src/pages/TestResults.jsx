import React, { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Zap, Filter, Calendar, Search, Eye, Trash2, SortAsc, SortDesc, X } from 'lucide-react'
import { useTestHistory, useTestSummary, useTestState, useBluetoothState } from '../hooks/useAppState'
import { formatTime, formatDuration } from '../utils/timeUtils'
import { useNavigate } from 'react-router-dom'

const TestResults = () => {
  const navigate = useNavigate()
  const [selectedTest, setSelectedTest] = useState('latest')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('startTime')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedTests, setSelectedTests] = useState(new Set())
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTestDetails, setSelectedTestDetails] = useState(null)
  
  const { testHistory, loadTestHistory, deleteTestResult } = useTestHistory()
  const { statistics, trends } = useTestSummary()
  
  // 加载测试历史数据
  useEffect(() => {
    loadTestHistory()
  }, [])
  
  // 过滤和排序历史记录
  const filteredAndSortedTests = useMemo(() => {
    if (!testHistory || testHistory.length === 0) return []
    
    return testHistory
      .filter(test => {
        // 搜索过滤
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          if (!test.id?.toLowerCase().includes(searchLower) &&
              !test.deviceName?.toLowerCase().includes(searchLower)) {
            return false
          }
        }
        
        // 状态过滤
        if (filterStatus !== 'all' && test.status !== filterStatus) {
          return false
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
          case 'totalCycles':
            aValue = a.totalCycles || 0
            bValue = b.totalCycles || 0
            break
          case 'successRate':
            aValue = a.successCount / (a.successCount + a.failureCount) || 0
            bValue = b.successCount / (b.successCount + b.failureCount) || 0
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
  }, [testHistory, searchTerm, filterStatus, sortBy, sortOrder])
  
  // 删除功能
  const handleDeleteSelected = async () => {
    const selectedTestsArray = Array.from(selectedTests)
    try {
      for (const testId of selectedTestsArray) {
        await deleteTestResult(testId)
      }
      setSelectedTests(new Set())
      loadTestHistory()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }
  
  // 当前测试结果组件
  // 历史记录组件
  const TestHistoryView = () => (
    <div className="space-y-6 pt-6">
      {/* 搜索和过滤 */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100">
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索测试记录..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="all">所有状态</option>
              <option value="completed">已完成</option>
              <option value="running">运行中</option>
              <option value="paused">已暂停</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="startTime">开始时间</option>
              <option value="duration">测试时长</option>
              <option value="totalCycles">测试次数</option>
              <option value="successRate">成功率</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 测试记录列表 */}
      <div className="space-y-3">
        {filteredAndSortedTests.map((test) => {
          const successRate = (test.successCount / (test.successCount + test.failureCount)) * 100
          const getStatusText = (status) => {
            switch(status) {
              case 'completed': return '已完成'
              case 'running': return '进行中'
              case 'paused': return '已暂停'
              default: return '已停止'
            }
          }
          
          return (
            <div 
              key={test.id} 
              className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => navigate(`/test-control?testId=${test.id}`)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    test.status === 'completed' ? 'bg-green-500' :
                    test.status === 'running' ? 'bg-blue-500' :
                    test.status === 'paused' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-slate-800">{test.id}</p>
                    <p className="text-sm text-slate-500">
                      {formatTime(new Date(test.startTime))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    test.status === 'completed' ? 'bg-green-100 text-green-700' :
                    test.status === 'running' ? 'bg-blue-100 text-blue-700' :
                    test.status === 'paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {getStatusText(test.status)}
                  </span>

                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">成功率</p>
                  <p className="font-medium">{successRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-slate-500">总次数</p>
                  <p className="font-medium">{test.totalCycles}</p>
                </div>
                <div>
                  <p className="text-slate-500">时长</p>
                  <p className="font-medium">{formatDuration(test.duration || 0)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981']

  return (
    <div className="min-h-screen bg-slate-50 pb-20">


      {/* 内容区域 */}
      <div className="px-4">
        <TestHistoryView />
      </div>

      {/* 测试详情模态框 */}
      {showDetailsModal && selectedTestDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">测试详情</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* 基本信息 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">基本信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">测试ID</p>
                      <p className="font-medium">{selectedTestDetails.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">状态</p>
                      <p className="font-medium">{selectedTestDetails.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">开始时间</p>
                      <p className="font-medium">{formatTime(new Date(selectedTestDetails.startTime))}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">测试时长</p>
                      <p className="font-medium">{formatDuration(selectedTestDetails.duration || 0)}</p>
                    </div>
                  </div>
                </div>

                {/* 统计信息 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">统计信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-600">总次数</p>
                      <p className="text-xl font-bold text-blue-700">{selectedTestDetails.totalCycles}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm text-green-600">成功次数</p>
                      <p className="text-xl font-bold text-green-700">{selectedTestDetails.successCount}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-sm text-red-600">失败次数</p>
                      <p className="text-xl font-bold text-red-700">{selectedTestDetails.failureCount}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-sm text-purple-600">成功率</p>
                      <p className="text-xl font-bold text-purple-700">
                        {((selectedTestDetails.successCount / (selectedTestDetails.successCount + selectedTestDetails.failureCount)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* 配置信息 */}
                {selectedTestDetails.config && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">配置信息</h3>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">测试次数</p>
                          <p className="font-medium">{selectedTestDetails.config.testCount}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">间隔时间</p>
                          <p className="font-medium">{selectedTestDetails.config.interval}ms</p>
                        </div>
                        <div>
                          <p className="text-slate-500">超时时间</p>
                          <p className="font-medium">{selectedTestDetails.config.timeout}ms</p>
                        </div>
                        <div>
                          <p className="text-slate-500">重试次数</p>
                          <p className="font-medium">{selectedTestDetails.config.maxRetries}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 测试结果 */}
                {selectedTestDetails.results && selectedTestDetails.results.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">测试结果</h3>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {selectedTestDetails.results.map((result, index) => (
                        <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className="flex items-center">
                            {result.success ? (
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                            )}
                            <span className="text-sm font-medium">第 {index + 1} 次</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-600">
                              {result.responseTime ? `${result.responseTime}ms` : result.error || 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestResults