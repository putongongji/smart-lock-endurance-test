import React from 'react'
import { Bluetooth, Battery, Wifi, Play, TrendingUp, Clock, CheckCircle, AlertCircle, Settings } from 'lucide-react'
import { useConnectionSummary, useTestSummary, useBluetoothState, useUIState } from '../hooks/useAppState.js'

function StatusCard({ title, value, icon: Icon, color = "blue", subtitle, onClick }) {
  return (
    <div 
      className={`bg-white rounded-2xl p-5 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium mb-1">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mb-1`}>{value}</p>
          {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-xl`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )
}

function ConnectionCard({ title, status, details, icon: Icon, onAction }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'green'
      case 'disconnected': return 'red'
      case 'connecting': return 'yellow'
      default: return 'gray'
    }
  }
  
  const color = getStatusColor(status)
  
  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <div className={`p-2 bg-${color}-100 rounded-lg`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 text-sm">状态</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 bg-${color}-500 rounded-full ${status === 'connected' ? 'animate-pulse' : ''}`}></div>
            <span className={`text-sm font-medium text-${color}-600 capitalize`}>
              {status === 'connected' ? '已连接' : status === 'disconnected' ? '未连接' : '连接中'}
            </span>
          </div>
        </div>
        
        {details && Object.entries(details).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-slate-600 text-sm">{key}</span>
            <span className="text-slate-800 text-sm font-medium">{value}</span>
          </div>
        ))}
        
        {onAction && (
          <button
            onClick={onAction}
            className={`w-full mt-3 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              status === 'connected' 
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {status === 'connected' ? '断开连接' : '连接设备'}
          </button>
        )}
      </div>
    </div>
  )
}

function Dashboard() {
  const connectionSummary = useConnectionSummary()
  const testSummary = useTestSummary()
  const { disconnectDevice } = useBluetoothState()
  const { toggleModal } = useUIState()

  const handleDeviceAction = async () => {
    if (connectionSummary.isConnected) {
      try {
        await disconnectDevice()
      } catch (error) {
        console.error('断开连接失败:', error)
      }
    } else {
      toggleModal('deviceSelector', true)
    }
  }

  const handleStartTest = () => {
    if (!connectionSummary.isConnected) {
      toggleModal('deviceSelector', true)
      return
    }
    toggleModal('testConfig', true)
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* 页面标题 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">蓝牙门锁测试</h1>
          <p className="text-blue-100">
            测试数据概览和统计信息
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <StatusCard
          title="总测试次数"
          value={testSummary.statistics.totalTests.toLocaleString()}
          icon={TrendingUp}
          color="blue"
        />
        <StatusCard
          title="成功率"
          value={`${testSummary.statistics.successRate.toFixed(1)}%`}
          icon={CheckCircle}
          color="green"
        />
        <StatusCard
          title="平均响应时间"
          value={`${testSummary.statistics.avgResponseTime}ms`}
          icon={Clock}
          color="purple"
        />
        <StatusCard
          title="最后测试"
          value={testSummary.statistics.lastTestDate ? new Date(testSummary.statistics.lastTestDate).toLocaleDateString() : '暂无'}
          icon={AlertCircle}
          color="orange"
        />
      </div>

      {/* 当前测试状态 */}
      {testSummary.isRunning && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">测试进行中</h3>
              <p className="text-green-100">
                进度: {testSummary.currentTest?.currentCycle || 0} / {testSummary.currentTest?.totalCycles || 0}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{testSummary.progress.toFixed(1)}%</div>
              <div className="text-green-100 text-sm">
                {testSummary.isPaused ? '已暂停' : '运行中'}
              </div>
            </div>
          </div>
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${testSummary.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 最近测试结果 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">测试概览</h3>
          <button
            onClick={() => toggleModal('settings', true)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        {testSummary.statistics.totalTests === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无测试数据</p>
            <p className="text-sm mt-1">开始第一次测试来查看结果</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800 mb-2">
                {testSummary.statistics.successRate.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">总体成功率</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800 mb-2">
                {testSummary.statistics.avgResponseTime}ms
              </div>
              <div className="text-sm text-slate-600">平均响应时间</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800 mb-2">
                {testSummary.statistics.totalTests}
              </div>
              <div className="text-sm text-slate-600">总测试次数</div>
            </div>
          </div>
        )}
      </div>
      
      {/* 底部间距 */}
      <div className="h-20"></div>
    </div>
  )
}

export default Dashboard