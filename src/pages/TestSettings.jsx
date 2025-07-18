import React, { useState } from 'react'
import { Save, RefreshCw, AlertTriangle, CheckCircle, Bluetooth, Bell, Database } from 'lucide-react'

const TestSettings = () => {
  const [settings, setSettings] = useState({
    bluetooth: {
      defaultTargetCount: 1000,
      defaultInterval: 5,
      connectionTimeout: 30,
      retryAttempts: 3,
      responseTimeThreshold: 200,
      autoReconnect: true
    },
    alerts: {
      enableFailureAlerts: true,
      failureThreshold: 5,
      responseTimeThreshold: 150,
      soundAlerts: true
    },
    data: {
      autoSaveResults: true,
      dataRetentionDays: 30,
      exportFormat: 'csv'
    }
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // null, 'saving', 'success', 'error'

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const saveSettings = async () => {
    setSaveStatus('saving')
    
    // 模拟保存过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    try {
      localStorage.setItem('testSettings', JSON.stringify(settings))
      setSaveStatus('success')
      setHasChanges(false)
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const resetSettings = () => {
    if (window.confirm('确定要重置所有设置到默认值吗？')) {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 space-y-6">
      {/* 页面标题 */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">蓝牙开锁测试设置</h1>
        <p className="text-slate-600 mt-2 font-medium">配置蓝牙开锁耐久性测试的参数和选项</p>
      </div>

      {/* 未保存更改提示 */}
      {hasChanges && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center backdrop-blur-sm shadow-lg">
          <AlertTriangle className="w-5 h-5 text-blue-600 mr-3" />
          <span className="text-blue-800 font-medium">有未保存的更改</span>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex space-x-4">
        <button 
          onClick={resetSettings}
          className="flex-1 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-bold flex items-center justify-center hover:from-slate-200 hover:to-slate-300 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          重置
        </button>
        <button 
          onClick={saveSettings}
          disabled={!hasChanges || saveStatus === 'saving'}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center disabled:opacity-50 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
        >
          {saveStatus === 'saving' ? (
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          {saveStatus === 'saving' ? '保存中...' : '保存设置'}
        </button>
      </div>

      {/* 保存状态提示 */}
      {saveStatus === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center backdrop-blur-sm shadow-lg">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <span className="text-green-800 font-medium">设置已成功保存</span>
        </div>
      )}
      
      {saveStatus === 'error' && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center backdrop-blur-sm shadow-lg">
          <AlertTriangle className="w-5 h-5 text-gray-600 mr-3" />
          <span className="text-gray-800 font-medium">保存设置时出错，请重试</span>
        </div>
      )}

      {/* 蓝牙测试设置 */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mr-4">
            <Bluetooth className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">蓝牙测试配置</h3>
            <p className="text-sm text-slate-500 font-medium">设置蓝牙连接和测试参数</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                默认目标次数
              </label>
              <input 
                type="number" 
                value={settings.bluetooth.defaultTargetCount}
                onChange={(e) => updateSetting('bluetooth', 'defaultTargetCount', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                测试间隔 (秒)
              </label>
              <input 
                type="number" 
                value={settings.bluetooth.defaultInterval}
                onChange={(e) => updateSetting('bluetooth', 'defaultInterval', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                min="1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                连接超时 (秒)
              </label>
              <input 
                type="number" 
                value={settings.bluetooth.connectionTimeout}
                onChange={(e) => updateSetting('bluetooth', 'connectionTimeout', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                min="5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                重试次数
              </label>
              <input 
                type="number" 
                value={settings.bluetooth.retryAttempts}
                onChange={(e) => updateSetting('bluetooth', 'retryAttempts', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                min="0"
                max="10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              响应时间阈值 (毫秒)
            </label>
            <input 
              type="number" 
              value={settings.bluetooth.responseTimeThreshold}
              onChange={(e) => updateSetting('bluetooth', 'responseTimeThreshold', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              min="50"
            />
            <p className="text-xs text-slate-500 mt-2 font-medium">超过此时间将被标记为慢响应</p>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <input 
              type="checkbox" 
              id="autoReconnect"
              checked={settings.bluetooth.autoReconnect}
              onChange={(e) => updateSetting('bluetooth', 'autoReconnect', e.target.checked)}
              className="mr-3 w-5 h-5 text-gray-600 rounded-lg focus:ring-gray-500"
            />
            <label htmlFor="autoReconnect" className="text-sm font-bold text-slate-700">
              连接断开时自动重连
            </label>
          </div>
        </div>
      </div>

      {/* 警报设置 */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl mr-4">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">警报设置</h3>
            <p className="text-sm text-slate-500 font-medium">配置测试异常和性能警报</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <input 
              type="checkbox" 
              id="enableFailureAlerts"
              checked={settings.alerts.enableFailureAlerts}
              onChange={(e) => updateSetting('alerts', 'enableFailureAlerts', e.target.checked)}
              className="mr-3 w-5 h-5 text-gray-600 rounded-lg focus:ring-gray-500"
            />
            <label htmlFor="enableFailureAlerts" className="text-sm font-bold text-slate-700">
              启用失败警报
            </label>
          </div>
          
          {settings.alerts.enableFailureAlerts && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                连续失败阈值
              </label>
              <input 
                type="number" 
                value={settings.alerts.failureThreshold}
                onChange={(e) => updateSetting('alerts', 'failureThreshold', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                min="1"
                max="20"
              />
              <p className="text-xs text-slate-500 mt-2 font-medium">连续失败超过此次数时触发警报</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              响应时间警报阈值 (毫秒)
            </label>
            <input 
              type="number" 
              value={settings.alerts.responseTimeThreshold}
              onChange={(e) => updateSetting('alerts', 'responseTimeThreshold', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              min="50"
            />
            <p className="text-xs text-slate-500 mt-2 font-medium">响应时间超过此值时触发警报</p>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <input 
              type="checkbox" 
              id="soundAlerts"
              checked={settings.alerts.soundAlerts}
              onChange={(e) => updateSetting('alerts', 'soundAlerts', e.target.checked)}
              className="mr-3 w-5 h-5 text-gray-600 rounded-lg focus:ring-gray-500"
            />
            <label htmlFor="soundAlerts" className="text-sm font-bold text-slate-700">
              启用声音警报
            </label>
          </div>
        </div>
      </div>

      {/* 数据设置 */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl mr-4">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">数据管理</h3>
            <p className="text-sm text-slate-500 font-medium">配置数据存储和导出选项</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <input 
              type="checkbox" 
              id="autoSaveResults"
              checked={settings.data.autoSaveResults}
              onChange={(e) => updateSetting('data', 'autoSaveResults', e.target.checked)}
              className="mr-3 w-5 h-5 text-gray-600 rounded-lg focus:ring-gray-500"
            />
            <label htmlFor="autoSaveResults" className="text-sm font-bold text-slate-700">
              自动保存测试结果
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              数据保留天数
            </label>
            <input 
              type="number" 
              value={settings.data.dataRetentionDays}
              onChange={(e) => updateSetting('data', 'dataRetentionDays', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              min="1"
              max="365"
            />
            <p className="text-xs text-slate-500 mt-2 font-medium">超过此天数的数据将被自动清理</p>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              导出格式
            </label>
            <select 
              value={settings.data.exportFormat}
              onChange={(e) => updateSetting('data', 'exportFormat', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium bg-white/50 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="xlsx">Excel</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* 底部间距，为底部导航栏留出空间 */}
      <div className="h-20"></div>
    </div>
  )
}

export default TestSettings