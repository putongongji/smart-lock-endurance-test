/**
 * 测试配置模态框组件
 * 用于配置测试参数
 */

import React, { useState, useEffect } from 'react';
import { Settings, X, Play, Clock, Hash, AlertCircle } from 'lucide-react';
import { useUIState, useSettings } from '../hooks/useAppState.js';
import { LoadingButton } from './LoadingSpinner.jsx';
import StateService from '../services/StateService.js';

const TestConfigModal = ({ onStartTest }) => {
  const { modals, toggleModal } = useUIState();
  const { testConfig } = useSettings();
  
  const [config, setConfig] = useState({
    testCount: testConfig.defaultTestCount || 100,
    interval: testConfig.defaultInterval || 1000,
    timeout: testConfig.timeout || 5000,
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 500
  });
  
  const [errors, setErrors] = useState({});
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (modals.testConfig) {
      // 从本地存储加载保存的配置
      try {
        const savedSettings = JSON.parse(localStorage.getItem('baguaFurnace_settings') || '{}');
        const savedTestConfig = savedSettings.testConfig || {};
        
        setConfig({
          testCount: savedTestConfig.defaultTestCount || testConfig.defaultTestCount || 100,
          interval: savedTestConfig.defaultInterval || testConfig.defaultInterval || 1000,
          timeout: savedTestConfig.timeout || testConfig.timeout || 5000,
          enableRetry: savedTestConfig.enableRetry !== undefined ? savedTestConfig.enableRetry : true,
          maxRetries: savedTestConfig.maxRetries || 3,
          retryDelay: savedTestConfig.retryDelay || 500
        });
      } catch (error) {
        console.error('加载保存的配置失败:', error);
        // 使用默认配置
        setConfig({
          testCount: testConfig.defaultTestCount || 100,
          interval: testConfig.defaultInterval || 1000,
          timeout: testConfig.timeout || 5000,
          enableRetry: true,
          maxRetries: 3,
          retryDelay: 500
        });
      }
      setErrors({});
    }
  }, [modals.testConfig, testConfig]);

  const validateConfig = () => {
    const newErrors = {};

    if (!config.testCount || config.testCount < 1) {
      newErrors.testCount = '测试次数必须大于0';
    } else if (config.testCount > 10000) {
      newErrors.testCount = '测试次数不能超过10000';
    }

    if (!config.interval || config.interval < 100) {
      newErrors.interval = '测试间隔不能小于100毫秒';
    } else if (config.interval > 60000) {
      newErrors.interval = '测试间隔不能超过60秒';
    }

    if (!config.timeout || config.timeout < 1000) {
      newErrors.timeout = '超时时间不能小于1秒';
    } else if (config.timeout > 30000) {
      newErrors.timeout = '超时时间不能超过30秒';
    }

    if (config.enableRetry) {
      if (!config.maxRetries || config.maxRetries < 1) {
        newErrors.maxRetries = '重试次数必须大于0';
      } else if (config.maxRetries > 10) {
        newErrors.maxRetries = '重试次数不能超过10';
      }

      if (!config.retryDelay || config.retryDelay < 100) {
        newErrors.retryDelay = '重试延迟不能小于100毫秒';
      } else if (config.retryDelay > 5000) {
        newErrors.retryDelay = '重试延迟不能超过5秒';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleStartTest = async () => {
    if (!validateConfig()) {
      return;
    }

    try {
      setIsStarting(true);
      await onStartTest(config);
      toggleModal('testConfig', false);
    } catch (error) {
      console.error('启动测试失败:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSave = () => {
    console.log('保存配置按钮被点击');
    
    if (!validateConfig()) {
      console.log('配置验证失败');
      return;
    }
    
    try {
      // 获取当前设置
      const currentSettings = JSON.parse(localStorage.getItem('baguaFurnace_settings') || '{}');
      
      // 更新测试配置
      const updatedSettings = {
        ...currentSettings,
        testConfig: {
          ...currentSettings.testConfig,
          defaultTestCount: config.testCount,
          defaultInterval: config.interval,
          timeout: config.timeout,
          enableRetry: config.enableRetry,
          maxRetries: config.maxRetries,
          retryDelay: config.retryDelay
        }
      };
      
      // 保存到本地存储
      localStorage.setItem('baguaFurnace_settings', JSON.stringify(updatedSettings));
      console.log('配置已保存到本地存储:', updatedSettings.testConfig);
      
      // 更新StateService的状态
      StateService.updateState('settings', updatedSettings);
      
      // 显示保存成功提示
      alert('配置已保存成功！');
    } catch (error) {
      console.error('保存配置时出错:', error);
      alert('保存配置失败，请重试');
    }
  };

  const handleClose = () => {
    toggleModal('testConfig', false);
  };

  const getEstimatedDuration = () => {
    const totalTime = config.testCount * (config.interval + config.timeout);
    const minutes = Math.floor(totalTime / 60000);
    const seconds = Math.floor((totalTime % 60000) / 1000);
    
    if (minutes > 0) {
      return `约 ${minutes} 分 ${seconds} 秒`;
    }
    return `约 ${seconds} 秒`;
  };

  if (!modals.testConfig) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">测试配置</h2>
                <p className="text-purple-100 text-sm">设置测试参数和选项</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* 基本配置 */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">基本配置</h3>
              
              {/* 测试次数 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  测试次数
                </label>
                <input
                  type="number"
                  value={config.testCount}
                  onChange={(e) => handleInputChange('testCount', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.testCount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="输入测试次数"
                  min="1"
                  max="10000"
                />
                {errors.testCount && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.testCount}
                  </p>
                )}
              </div>

              {/* 测试间隔 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  测试间隔 (毫秒)
                </label>
                <input
                  type="number"
                  value={config.interval}
                  onChange={(e) => handleInputChange('interval', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.interval ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="输入测试间隔"
                  min="100"
                  max="60000"
                />
                {errors.interval && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.interval}
                  </p>
                )}
              </div>

              {/* 超时时间 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  超时时间 (毫秒)
                </label>
                <input
                  type="number"
                  value={config.timeout}
                  onChange={(e) => handleInputChange('timeout', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.timeout ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="输入超时时间"
                  min="1000"
                  max="30000"
                />
                {errors.timeout && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.timeout}
                  </p>
                )}
              </div>
            </div>


          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
            >
              保存配置
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestConfigModal;