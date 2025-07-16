import React from 'react'
import { Bluetooth, Wifi, Battery } from 'lucide-react'

function MobileHeader() {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-gray-900">智能锁蓝牙测试</h1>
        </div>
        <div className="flex items-center space-x-3">
          {/* 蓝牙状态 */}
          <div className="flex items-center">
            <Bluetooth className="w-4 h-4 text-blue-500" />
            <span className="ml-1 text-xs text-gray-600">已连接</span>
          </div>
          {/* WiFi状态 */}
          <div className="flex items-center">
            <Wifi className="w-4 h-4 text-green-500" />
          </div>
          {/* 电池状态 */}
          <div className="flex items-center">
            <Battery className="w-4 h-4 text-gray-600" />
            <span className="ml-1 text-xs text-gray-600">85%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileHeader