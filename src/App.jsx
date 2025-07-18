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
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 shadow-xl">
      <div className="flex items-center justify-center space-x-3">
        <div className="p-2 bg-blue-500/20 rounded-xl backdrop-blur-sm">
          <Bluetooth className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">智能锁测试</h1>
          <p className="text-slate-300 text-xs font-medium">蓝牙耐久性检测</p>
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
    { path: '/settings', icon: Settings, label: '设置' }
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
              <Route path="/settings" element={<TestSettings />} />
            </Routes>
          </div>
        </main>
        <BottomNavigation />
      </div>
    </Router>
  )
}

export default App