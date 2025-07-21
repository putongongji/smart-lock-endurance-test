import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Play, BarChart3, Settings as SettingsIcon, Database, Home, Bluetooth } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import TestControl from './pages/TestControl'
import TestResults from './pages/TestResults'
import Settings from './pages/Settings'
import TestHistory from './pages/TestHistory'
import { AlertContainer } from './components/Alert'
import DeviceSelector from './components/DeviceSelector'
import { useBluetoothState, useUIState } from './hooks/useAppState'
import BluetoothService from './services/BluetoothService.js'
import StateService from './services/StateService.js'
import TestService from './services/TestService.js'

function MobileHeader() {
  const { isConnected, deviceName } = useBluetoothState()
  
  return (
    <header className="bg-gradient-to-r from-blue-50 to-indigo-50 text-slate-800 px-6 py-4 shadow-lg border-b border-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Bluetooth className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">八卦炉</h1>
            <p className="text-slate-600 text-xs font-medium">蓝牙智能锁开锁测试</p>
          </div>
        </div>
        
        {/* 连接状态指示器 */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          <span className="text-xs text-slate-600">
            {isConnected ? (deviceName || '已连接') : '未连接'}
          </span>
        </div>
      </div>
    </header>
  )
}

function BottomNavigation() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', icon: Home, label: '概览' },
    { path: '/test-control', icon: Play, label: '测试' },
    { path: '/test-results', icon: BarChart3, label: '结果' },
    { path: '/test-history', icon: Database, label: '历史' },
    { path: '/settings', icon: SettingsIcon, label: '设置' }
  ]
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/50 px-2 py-2 shadow-2xl">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 transform ${
                isActive
                  ? 'text-blue-600 bg-blue-50 scale-105 shadow-lg'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 hover:scale-102'
              }`}
            >
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
              )}
              <Icon className={`w-5 h-5 mb-1 transition-transform duration-200 ${
                isActive ? 'scale-110' : ''
              }`} />
              <span className="text-xs font-semibold tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function App() {
  // 初始化服务
  useEffect(() => {
    console.log('App.jsx 开始初始化服务...');
    
    // 初始化蓝牙服务
    console.log('初始化BluetoothService...');
    BluetoothService.initialize()
    
    // 初始化状态服务（这会设置事件监听器）
    console.log('初始化StateService...');
    StateService.initialize()
    
    // 初始化测试服务
    console.log('初始化TestService...');
    TestService.initialize()
    
    console.log('所有服务初始化完成');
    
    return () => {
      // 清理资源
      BluetoothService.cleanup()
      StateService.cleanup()
      TestService.cleanup()
    }
  }, [])
  
  return (
    <Router basename="/smart-lock-endurance-test">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto pb-24 px-1">
          <div className="max-w-md mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/test-control" element={<TestControl />} />
              <Route path="/test-results" element={<TestResults />} />
              <Route path="/test-history" element={<TestHistory />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
        <BottomNavigation />
        
        {/* 全局警报容器 */}
        <AlertContainer />
        
        {/* 设备选择器模态框 */}
        <DeviceSelector />
      </div>
    </Router>
  )
}

export default App