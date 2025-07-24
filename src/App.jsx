import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Play, Bluetooth } from 'lucide-react'
import TestControl from './pages/TestControl'
import TestResults from './pages/TestResults'
import { AlertContainer } from './components/Alert'
import DeviceSelector from './components/DeviceSelector'
import { useBluetoothState } from './hooks/useAppState'
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
            <p className="text-slate-600 text-sm font-medium">蓝牙智能锁测试工具</p>
          </div>
        </div>
        
        {/* 测试功能按钮 */}
        <Link
          to="/test-control"
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-md"
        >
          <Play className="w-4 h-4" />
          <span className="text-sm font-medium">测试</span>
        </Link>
      </div>
    </header>
  )
}

// 移除底部导航栏，测试功能已移至右上角

function AppContent() {
  const location = useLocation()
  const isMainPage = location.pathname === '/'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col">
      {isMainPage && <MobileHeader />}
      <main className="flex-1 overflow-y-auto pb-4 px-1">
        <Routes>
          <Route path="/" element={<TestResults />} />
          <Route path="/test-control" element={<TestControl />} />
          <Route path="/test-control/:taskId" element={<TestControl />} />
        </Routes>
      </main>
      
      {/* 全局警报容器 */}
      <AlertContainer />
      
      {/* 设备选择器模态框 */}
      <DeviceSelector />
    </div>
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
      <AppContent />
    </Router>
  )
}

export default App