import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Play, BarChart3, Settings, Database, Home, Bluetooth } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import TestControl from './pages/TestControl'
import TestResults from './pages/TestResults'
import TestSettings from './pages/TestSettings'
import TestHistory from './pages/TestHistory'

function MobileHeader() {
  return (
    <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-center">
      <Bluetooth className="w-6 h-6 mr-2" />
      <h1 className="text-lg font-semibold">智能锁蓝牙测试</h1>
    </header>
  )
}

function BottomNavigation() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', icon: Home, label: '仪表板' },
    { path: '/test-control', icon: Play, label: '测试' },
    { path: '/test-results', icon: BarChart3, label: '结果' },
    { path: '/test-history', icon: Database, label: '历史' },
    { path: '/settings', icon: Settings, label: '设置' }
  ]
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto pb-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/test-control" element={<TestControl />} />
            <Route path="/test-results" element={<TestResults />} />
            <Route path="/test-history" element={<TestHistory />} />
            <Route path="/settings" element={<TestSettings />} />
          </Routes>
        </main>
        <BottomNavigation />
      </div>
    </Router>
  )
}

export default App