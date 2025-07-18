import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BarChart3, Play, FileText, History, Settings } from 'lucide-react'

function BottomNavigation() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', icon: BarChart3, label: '概览' },
    { path: '/test-control', icon: Play, label: '蓝牙测试' },
    { path: '/test-results', icon: FileText, label: '结果' },
    { path: '/test-history', icon: History, label: '历史' },
    { path: '/test-settings', icon: Settings, label: '设置' }
  ]

  return (
    <div className="bg-white/70 backdrop-blur-sm border-t border-white/20 shadow-lg">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center py-3 px-1 ${
                isActive 
                  ? 'text-blue-600 bg-blue-50/50 backdrop-blur-sm border-t-2 border-blue-500' 
                  : 'text-gray-600 hover:text-gray-900 border-t-2 border-transparent'
              } transition-all duration-200`}
            >
              <Icon className={`w-5 h-5 mb-1 ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`} />
              <span className={`text-xs font-medium ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNavigation