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
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">测试设置</h1>
          <div className="flex space-x-4">
            {hasChanges && (
              <div className="flex items-center text-warning-600">
                <AlertTriangle className="w-4 h-4 mr-2" />
                有未保存的更改
              </div>
            )}
            <button 
              onClick={resetSettings}
              className="btn btn-secondary px-4 py-2 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重置
            </button>
            <button 
              onClick={saveSettings}
              disabled={!hasChanges || saveStatus === 'saving'}
              className="btn btn-primary px-4 py-2 flex items-center"
            >
              {saveStatus === 'saving' ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saveStatus === 'saving' ? '保存中...' : '保存设置'}
            </button>
          </div>
        </div>

        {/* 保存状态提示 */}
        {saveStatus === 'success' && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-success-600 mr-2" />
            <span className="text-success-800">设置已成功保存</span>
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 text-danger-600 mr-2" />
            <span className="text-danger-800">保存设置时出错，请重试</span>
          </div>
        )}

        {/* 标签页导航 */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* 常规设置 */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">默认测试配置</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    默认测试模式
                  </label>
                  <select 
                    value={settings.general.defaultTestMode}
                    onChange={(e) => updateSetting('general', 'defaultTestMode', e.target.value)}
                    className="input"
                  >
                    <option value="count">按次数测试</option>
                    <option value="time">按时间测试</option>
                    <option value="continuous">连续测试</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    默认目标次数
                  </label>
                  <input 
                    type="number" 
                    value={settings.general.defaultTargetCount}
                    onChange={(e) => updateSetting('general', 'defaultTargetCount', parseInt(e.target.value))}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    默认目标时长 (分钟)
                  </label>
                  <input 
                    type="number" 
                    value={settings.general.defaultTargetDuration}
                    onChange={(e) => updateSetting('general', 'defaultTargetDuration', parseInt(e.target.value))}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    默认测试间隔 (秒)
                  </label>
                  <input 
                    type="number" 
                    value={settings.general.defaultInterval}
                    onChange={(e) => updateSetting('general', 'defaultInterval', parseInt(e.target.value))}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最大并发测试数
                  </label>
                  <input 
                    type="number" 
                    value={settings.general.maxConcurrentTests}
                    onChange={(e) => updateSetting('general', 'maxConcurrentTests', parseInt(e.target.value))}
                    className="input"
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">系统选项</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.general.autoSaveResults}
                    onChange={(e) => updateSetting('general', 'autoSaveResults', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <label className="text-sm text-gray-700">自动保存测试结果</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.general.enableRealTimeMonitoring}
                    onChange={(e) => updateSetting('general', 'enableRealTimeMonitoring', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <label className="text-sm text-gray-700">启用实时监控</label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 硬件配置 */}
        {activeTab === 'hardware' && (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">智能锁型号配置</h3>
                <button 
                  onClick={addLockModel}
                  className="btn btn-primary px-4 py-2"
                >
                  添加型号
                </button>
              </div>
              
              <div className="space-y-4">
                {settings.hardware.lockModels.map((model, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          型号ID
                        </label>
                        <input 
                          type="text" 
                          value={model.id}
                          onChange={(e) => updateLockModel(index, 'id', e.target.value)}
                          className="input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          型号名称
                        </label>
                        <input 
                          type="text" 
                          value={model.name}
                          onChange={(e) => updateLockModel(index, 'name', e.target.value)}
                          className="input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          最大测试次数
                        </label>
                        <input 
                          type="number" 
                          value={model.maxAttempts}
                          onChange={(e) => updateLockModel(index, 'maxAttempts', parseInt(e.target.value))}
                          className="input"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <button 
                          onClick={() => removeLockModel(index)}
                          className="btn btn-danger px-3 py-2 w-full"
                          disabled={settings.hardware.lockModels.length <= 1}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">连接设置</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    连接超时 (秒)
                  </label>
                  <input 
                    type="number" 
                    value={settings.hardware.connectionTimeout}
                    onChange={(e) => updateSetting('hardware', 'connectionTimeout', parseInt(e.target.value))}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    重试次数
                  </label>
                  <input 
                    type="number" 
                    value={settings.hardware.retryAttempts}
                    onChange={(e) => updateSetting('hardware', 'retryAttempts', parseInt(e.target.value))}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    响应时间阈值 (ms)
                  </label>
                  <input 
                    type="number" 
                    value={settings.hardware.responseTimeThreshold}
                    onChange={(e) => updateSetting('hardware', 'responseTimeThreshold', parseInt(e.target.value))}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    心跳间隔 (秒)
                  </label>
                  <input 
                    type="number" 
                    value={settings.hardware.heartbeatInterval}
                    onChange={(e) => updateSetting('hardware', 'heartbeatInterval', parseInt(e.target.value))}
                    className="input"
                    disabled={!settings.hardware.enableHeartbeat}
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.hardware.enableHeartbeat}
                    onChange={(e) => updateSetting('hardware', 'enableHeartbeat', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <label className="text-sm text-gray-700">启用心跳检测</label>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  onClick={testConnection}
                  className="btn btn-secondary px-4 py-2"
                >
                  测试连接
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 告警设置 */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">故障告警</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.alerts.enableFailureAlerts}
                    onChange={(e) => updateSetting('alerts', 'enableFailureAlerts', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <label className="text-sm text-gray-700">启用故障告警</label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    故障阈值 (连续失败次数)
                  </label>
                  <input 
                    type="number" 
                    value={settings.alerts.failureThreshold}
                    onChange={(e) => updateSetting('alerts', 'failureThreshold', parseInt(e.target.value))}
                    className="input"
                    disabled={!settings.alerts.enableFailureAlerts}
                  />
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">性能告警</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.alerts.enablePerformanceAlerts}
                    onChange={(e) => updateSetting('alerts', 'enablePerformanceAlerts', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <label className="text-sm text-gray-700">启用性能告警</label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    响应时间阈值 (ms)
                  </label>
                  <input 
                    type="number" 
                    value={settings.alerts.responseTimeThreshold}
                    onChange={(e) => updateSetting('alerts', 'responseTimeThreshold', parseInt(e.target.value))}
                    className="input"
                    disabled={!settings.alerts.enablePerformanceAlerts}
                  />
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">维护提醒</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.alerts.enableMaintenanceAlerts}
                    onChange={(e) => updateSetting('alerts', 'enableMaintenanceAlerts', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <label className="text-sm text-gray-700">启用维护提醒</label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    维护间隔 (使用次数)
                  </label>
                  <input 
                    type="number" 
                    value={settings.alerts.maintenanceInterval}
                    onChange={(e) => updateSetting('alerts', 'maintenanceInterval', parseInt(e.target.value))}
                    className="input"
                    disabled={!settings.alerts.enableMaintenanceAlerts}
                  />
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">通知方式</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.alerts.soundAlerts}
                    onChange={(e) => updateSetting('alerts', 'soundAlerts', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <label className="text-sm text-gray-700">声音提醒</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.alerts.emailNotifications}
                    onChange={(e) => updateSetting('alerts', 'emailNotifications', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <label className="text-sm text-gray-700">邮件通知</label>
                </div>
                
                {settings.alerts.emailNotifications && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      邮箱地址
                    </label>
                    <input 
                      type="email" 
                      value={settings.alerts.emailAddress}
                      onChange={(e) => updateSetting('alerts', 'emailAddress', e.target.value)}
                      className="input"
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
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">数据保留</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    数据保留天数
                  </label>
                  <input 
                    type="number" 
                    value={settings.data.dataRetentionDays}
                    onChange={(e) => updateSetting('data', 'dataRetentionDays', parseInt(e.target.value))}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    导出格式
                  </label>
                  <select 
                    value={settings.data.exportFormat}
                    onChange={(e) => updateSetting('data', 'exportFormat', e.target.value)}
                    className="input"
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="xlsx">Excel</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.data.includeRawData}
                    onChange={(e) => updateSetting('data', 'includeRawData', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <label className="text-sm text-gray-700">导出时包含原始数据</label>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">自动备份</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.data.autoBackup}
                    onChange={(e) => updateSetting('data', 'autoBackup', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <label className="text-sm text-gray-700">启用自动备份</label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    备份间隔 (小时)
                  </label>
                  <input 
                    type="number" 
                    value={settings.data.backupInterval}
                    onChange={(e) => updateSetting('data', 'backupInterval', parseInt(e.target.value))}
                    className="input"
                    disabled={!settings.data.autoBackup}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.data.compressBackups}
                    onChange={(e) => updateSetting('data', 'compressBackups', e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                    disabled={!settings.data.autoBackup}
                  />
                  <label className="text-sm text-gray-700">压缩备份文件</label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestSettings