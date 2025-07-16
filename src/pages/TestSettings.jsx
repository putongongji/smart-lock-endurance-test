import React, { useState } from 'react'
import { Save, RefreshCw, AlertTriangle, CheckCircle, Settings, Wifi, Database, Bell } from 'lucide-react'

const TestSettings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    general: {
      defaultTestMode: 'count',
      defaultTargetCount: 1000,
      defaultTargetDuration: 60,
      defaultInterval: 5,
      autoSaveResults: true,
      enableRealTimeMonitoring: true,
      maxConcurrentTests: 3
    },
    hardware: {
      lockModels: [
        { id: 'SL-001', name: 'SL-001 基础款', maxAttempts: 10000, avgLifespan: 50000 },
        { id: 'SL-002', name: 'SL-002 标准款', maxAttempts: 15000, avgLifespan: 75000 },
        { id: 'SL-003', name: 'SL-003 高级款', maxAttempts: 20000, avgLifespan: 100000 }
      ],
      connectionTimeout: 30,
      retryAttempts: 3,
      responseTimeThreshold: 200,
      enableHeartbeat: true,
      heartbeatInterval: 10
    },
    alerts: {
      enableFailureAlerts: true,
      failureThreshold: 5,
      enablePerformanceAlerts: true,
      responseTimeThreshold: 150,
      enableMaintenanceAlerts: true,
      maintenanceInterval: 1000,
      emailNotifications: false,
      emailAddress: '',
      soundAlerts: true
    },
    data: {
      dataRetentionDays: 90,
      autoBackup: true,
      backupInterval: 24,
      exportFormat: 'csv',
      includeRawData: false,
      compressBackups: true
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

  const updateLockModel = (index, field, value) => {
    setSettings(prev => ({
      ...prev,
      hardware: {
        ...prev.hardware,
        lockModels: prev.hardware.lockModels.map((model, i) => 
          i === index ? { ...model, [field]: value } : model
        )
      }
    }))
    setHasChanges(true)
  }

  const addLockModel = () => {
    setSettings(prev => ({
      ...prev,
      hardware: {
        ...prev.hardware,
        lockModels: [...prev.hardware.lockModels, {
          id: `SL-${String(prev.hardware.lockModels.length + 1).padStart(3, '0')}`,
          name: '新型号',
          maxAttempts: 10000,
          avgLifespan: 50000
        }]
      }
    }))
    setHasChanges(true)
  }

  const removeLockModel = (index) => {
    setSettings(prev => ({
      ...prev,
      hardware: {
        ...prev.hardware,
        lockModels: prev.hardware.lockModels.filter((_, i) => i !== index)
      }
    }))
    setHasChanges(true)
  }

  const saveSettings = async () => {
    setSaveStatus('saving')
    
    // 模拟保存过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    try {
      // 这里应该是实际的保存逻辑
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
      // 重置到默认设置
      window.location.reload()
    }
  }

  const testConnection = async () => {
    // 模拟连接测试
    alert('连接测试功能开发中...')
  }

  const tabs = [
    { id: 'general', label: '常规设置', icon: Settings },
    { id: 'hardware', label: '硬件配置', icon: Wifi },
    { id: 'alerts', label: '告警设置', icon: Bell },
    { id: 'data', label: '数据管理', icon: Database }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* 页面标题 */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">测试设置</h1>
        </div>

        {/* 未保存更改提示 */}
        {hasChanges && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">有未保存的更改</span>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mb-4 flex space-x-2">
          <button 
            onClick={resetSettings}
            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            重置
          </button>
          <button 
            onClick={saveSettings}
            disabled={!hasChanges || saveStatus === 'saving'}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            {saveStatus === 'saving' ? '保存中...' : '保存设置'}
          </button>
        </div>

        {/* 保存状态提示 */}
        {saveStatus === 'success' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm text-green-800">设置已成功保存</span>
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm text-red-800">保存设置时出错，请重试</span>
          </div>
        )}

        {/* 标签页导航 */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-3 rounded-lg text-sm font-medium flex items-center justify-center ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 常规设置 */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="text-base font-semibold text-gray-900 mb-3">默认测试配置</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    默认测试模式
                  </label>
                  <select 
                    value={settings.general.defaultTestMode}
                    onChange={(e) => updateSetting('general', 'defaultTestMode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="count">按次数测试</option>
                    <option value="time">按时间测试</option>
                    <option value="continuous">连续测试</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      默认目标次数
                    </label>
                    <input 
                      type="number" 
                      value={settings.general.defaultTargetCount}
                      onChange={(e) => updateSetting('general', 'defaultTargetCount', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      目标时长 (分钟)
                    </label>
                    <input 
                      type="number" 
                      value={settings.general.defaultTargetDuration}
                      onChange={(e) => updateSetting('general', 'defaultTargetDuration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      测试间隔 (秒)
                    </label>
                    <input 
                      type="number" 
                      value={settings.general.defaultInterval}
                      onChange={(e) => updateSetting('general', 'defaultInterval', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      最大并发数
                    </label>
                    <input 
                      type="number" 
                      value={settings.general.maxConcurrentTests}
                      onChange={(e) => updateSetting('general', 'maxConcurrentTests', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="text-base font-semibold text-gray-900 mb-3">系统选项</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.general.autoSaveResults}
                    onChange={(e) => updateSetting('general', 'autoSaveResults', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <span className="text-sm text-gray-700">自动保存测试结果</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.general.enableRealTimeMonitoring}
                    onChange={(e) => updateSetting('general', 'enableRealTimeMonitoring', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <span className="text-sm text-gray-700">启用实时监控</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 硬件配置 */}
        {activeTab === 'hardware' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-900">智能锁型号配置</h3>
                <button 
                  onClick={addLockModel}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  添加型号
                </button>
              </div>
              
              <div className="space-y-3">
                {settings.hardware.lockModels.map((model, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            型号ID
                          </label>
                          <input 
                            type="text" 
                            value={model.id}
                            onChange={(e) => updateLockModel(index, 'id', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            型号名称
                          </label>
                          <input 
                            type="text" 
                            value={model.name}
                            onChange={(e) => updateLockModel(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          最大测试次数
                        </label>
                        <input 
                          type="number" 
                          value={model.maxAttempts}
                          onChange={(e) => updateLockModel(index, 'maxAttempts', parseInt(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      
                      <button 
                        onClick={() => removeLockModel(index)}
                        className="w-full bg-red-100 text-red-700 px-3 py-2 rounded text-sm"
                        disabled={settings.hardware.lockModels.length <= 1}
                      >
                        删除型号
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="text-base font-semibold text-gray-900 mb-3">连接设置</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      连接超时 (秒)
                    </label>
                    <input 
                      type="number" 
                      value={settings.hardware.connectionTimeout}
                      onChange={(e) => updateSetting('hardware', 'connectionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      重试次数
                    </label>
                    <input 
                      type="number" 
                      value={settings.hardware.retryAttempts}
                      onChange={(e) => updateSetting('hardware', 'retryAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      响应阈值 (ms)
                    </label>
                    <input 
                      type="number" 
                      value={settings.hardware.responseTimeThreshold}
                      onChange={(e) => updateSetting('hardware', 'responseTimeThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      心跳间隔 (秒)
                    </label>
                    <input 
                      type="number" 
                      value={settings.hardware.heartbeatInterval}
                      onChange={(e) => updateSetting('hardware', 'heartbeatInterval', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      disabled={!settings.hardware.enableHeartbeat}
                    />
                  </div>
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.hardware.enableHeartbeat}
                    onChange={(e) => updateSetting('hardware', 'enableHeartbeat', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <span className="text-sm text-gray-700">启用心跳检测</span>
                </label>
                
                <button 
                  onClick={testConnection}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  测试连接
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 告警设置 */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="text-base font-semibold text-gray-900 mb-3">故障告警</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.alerts.enableFailureAlerts}
                    onChange={(e) => updateSetting('alerts', 'enableFailureAlerts', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <span className="text-sm text-gray-700">启用故障告警</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    故障阈值 (连续失败次数)
                  </label>
                  <input 
                    type="number" 
                    value={settings.alerts.failureThreshold}
                    onChange={(e) => updateSetting('alerts', 'failureThreshold', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    disabled={!settings.alerts.enableFailureAlerts}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="text-base font-semibold text-gray-900 mb-3">性能告警</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.alerts.enablePerformanceAlerts}
                    onChange={(e) => updateSetting('alerts', 'enablePerformanceAlerts', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <span className="text-sm text-gray-700">启用性能告警</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    响应时间阈值 (ms)
                  </label>
                  <input 
                    type="number" 
                    value={settings.alerts.responseTimeThreshold}
                    onChange={(e) => updateSetting('alerts', 'responseTimeThreshold', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    disabled={!settings.alerts.enablePerformanceAlerts}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="text-base font-semibold text-gray-900 mb-3">维护提醒</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.alerts.enableMaintenanceAlerts}
                    onChange={(e) => updateSetting('alerts', 'enableMaintenanceAlerts', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <span className="text-sm text-gray-700">启用维护提醒</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    维护间隔 (使用次数)
                  </label>
                  <input 
                    type="number" 
                    value={settings.alerts.maintenanceInterval}
                    onChange={(e) => updateSetting('alerts', 'maintenanceInterval', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    disabled={!settings.alerts.enableMaintenanceAlerts}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="text-base font-semibold text-gray-900 mb-3">通知方式</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.alerts.soundAlerts}
                    onChange={(e) => updateSetting('alerts', 'soundAlerts', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <span className="text-sm text-gray-700">声音提醒</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.alerts.emailNotifications}
                    onChange={(e) => updateSetting('alerts', 'emailNotifications', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <span className="text-sm text-gray-700">邮件通知</span>
                </label>
                
                {settings.alerts.emailNotifications && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      邮箱地址
                    </label>
                    <input 
                      type="email" 
                      value={settings.alerts.emailAddress}
                      onChange={(e) => updateSetting('alerts', 'emailAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="example@company.com"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 数据管理 */}
        {activeTab === 'data' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="text-base font-semibold text-gray-900 mb-3">数据保留</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    数据保留天数
                  </label>
                  <input 
                    type="number" 
                    value={settings.data.dataRetentionDays}
                    onChange={(e) => updateSetting('data', 'dataRetentionDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    导出格式
                  </label>
                  <select 
                    value={settings.data.exportFormat}
                    onChange={(e) => updateSetting('data', 'exportFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="xlsx">Excel</option>
                  </select>
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.data.includeRawData}
                    onChange={(e) => updateSetting('data', 'includeRawData', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <span className="text-sm text-gray-700">导出时包含原始数据</span>
                </label>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="text-base font-semibold text-gray-900 mb-3">自动备份</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.data.autoBackup}
                    onChange={(e) => updateSetting('data', 'autoBackup', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <span className="text-sm text-gray-700">启用自动备份</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    备份间隔 (小时)
                  </label>
                  <input 
                    type="number" 
                    value={settings.data.backupInterval}
                    onChange={(e) => updateSetting('data', 'backupInterval', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    disabled={!settings.data.autoBackup}
                  />
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.data.compressBackups}
                    onChange={(e) => updateSetting('data', 'compressBackups', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                    disabled={!settings.data.autoBackup}
                  />
                  <span className="text-sm text-gray-700">压缩备份文件</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestSettings