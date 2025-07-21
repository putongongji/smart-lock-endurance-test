import React, { useState } from 'react'
import { Settings as SettingsIcon, Bluetooth, Bell, Shield, Database, Download, Upload, Trash2, RefreshCw, Save, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { useSettings, useBluetoothState, useUIState } from '../hooks/useAppState'
import { Alert } from '../components/Alert'

const Settings = () => {
  const { settings, updateSettings } = useSettings()
  const { isConnected } = useBluetoothState()
  const { showAlert } = useUIState()
  
  const [localSettings, setLocalSettings] = useState({
    // 测试设置
    defaultCycles: settings?.defaultCycles || 100,
    defaultInterval: settings?.defaultInterval || 1000,
    defaultTimeout: settings?.defaultTimeout || 5000,
    retryEnabled: settings?.retryEnabled || false,
    retryCount: settings?.retryCount || 3,
    retryDelay: settings?.retryDelay || 1000,
    
    // 蓝牙设置
    autoReconnect: settings?.autoReconnect || true,
    connectionTimeout: settings?.connectionTimeout || 10000,
    scanDuration: settings?.scanDuration || 10000,
    
    // 通知设置
    enableNotifications: settings?.enableNotifications || true,
    notifyOnSuccess: settings?.notifyOnSuccess || false,
    notifyOnFailure: settings?.notifyOnFailure || true,
    notifyOnCompletion: settings?.notifyOnCompletion || true,
    
    // 数据设置
    autoSave: settings?.autoSave || true,
    maxHistoryEntries: settings?.maxHistoryEntries || 100,
    exportFormat: settings?.exportFormat || 'json',
    
    // 安全设置
    requireConfirmation: settings?.requireConfirmation || true,
    enableLogging: settings?.enableLogging || true,
    logLevel: settings?.logLevel || 'info'
  })
  
  const [hasChanges, setHasChanges] = useState(false)
  
  // 处理设置变更
  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }
  
  // 保存设置
  const handleSave = async () => {
    try {
      await updateSettings(localSettings)
      setHasChanges(false)
      showAlert('设置已保存', 'success')
    } catch (error) {
      showAlert('保存设置失败: ' + error.message, 'error')
    }
  }
  
  // 重置设置
  const handleReset = () => {
    const defaultSettings = {
      defaultCycles: 100,
      defaultInterval: 1000,
      defaultTimeout: 5000,
      retryEnabled: false,
      retryCount: 3,
      retryDelay: 1000,
      autoReconnect: true,
      connectionTimeout: 10000,
      scanDuration: 10000,
      enableNotifications: true,
      notifyOnSuccess: false,
      notifyOnFailure: true,
      notifyOnCompletion: true,
      autoSave: true,
      maxHistoryEntries: 100,
      exportFormat: 'json',
      requireConfirmation: true,
      enableLogging: true,
      logLevel: 'info'
    }
    setLocalSettings(defaultSettings)
    setHasChanges(true)
  }
  
  // 导出设置
  const handleExportSettings = () => {
    const dataStr = JSON.stringify(localSettings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bagua-settings-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    showAlert('设置已导出', 'success')
  }
  
  // 导入设置
  const handleImportSettings = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result)
        setLocalSettings({ ...localSettings, ...importedSettings })
        setHasChanges(true)
        showAlert('设置已导入', 'success')
      } catch (error) {
        showAlert('导入设置失败: 文件格式错误', 'error')
      }
    }
    reader.readAsText(file)
  }
  
  const SettingSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <Icon className="w-5 h-5 mr-2 text-blue-600" />
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
  
  const SettingItem = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  )
  
  const NumberInput = ({ value, onChange, min = 0, max, step = 1, unit = '' }) => (
    <div className="flex items-center space-x-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className="w-20 px-3 py-1 border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
      />
      {unit && <span className="text-sm text-slate-500">{unit}</span>}
    </div>
  )
  
  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
  
  const Select = ({ value, onChange, options }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1 border border-slate-200 rounded-lg text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
  
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* 页面标题 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">应用设置</h1>
            <p className="text-slate-600">配置八卦炉的测试参数和行为</p>
          </div>
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">有未保存的更改</span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                hasChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>保存设置</span>
            </button>
          </div>
        </div>
        
        {/* 快速操作 */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">重置默认</span>
          </button>
          
          <button
            onClick={handleExportSettings}
            className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">导出设置</span>
          </button>
          
          <label className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span className="text-sm">导入设置</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="hidden"
            />
          </label>
        </div>
      </div>
      
      {/* 设置项已精简，移除了测试设置、蓝牙设置、通知设置、数据管理和安全设置 */}
      
      {/* 应用信息 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2 text-blue-600" />
          应用信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">应用名称:</span>
            <span className="font-medium">八卦炉</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">版本:</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">构建时间:</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">开发者:</span>
            <span className="font-medium">智能锁测试团队</span>
          </div>
        </div>
      </div>
      
      {/* 底部间距 */}
      <div className="h-20"></div>
    </div>
  )
}

export default Settings