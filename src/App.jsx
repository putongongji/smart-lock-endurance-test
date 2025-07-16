import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Play, BarChart3, Settings, Database, Home } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import TestControl from './pages/TestControl'
import TestResults from './pages/TestResults'
import TestSettings from './pages/TestSettings'
import TestHistory from './pages/TestHistory'

function Navigation() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', icon: Home, label: '仪表板' },
    { path: '/test-control', icon: Play, label: '测试控制' },
    { path: '/test-results', icon: BarChart3, label: '测试结果' },
    { path: '/test-history', icon: Database, label: '测试历史' },
    { path: '/settings', icon: Settings, label: '测试设置' }
  ]
  
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">智能锁测损系统</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/test-control" element={<TestControl />} />
            <Route path="/test-results" element={<TestResults />} />
            <Route path="/test-history" element={<TestHistory />} />
            <Route path="/settings" element={<TestSettings />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App