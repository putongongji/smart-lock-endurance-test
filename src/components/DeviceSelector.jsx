/**
 * 设备选择器组件
 * 用于扫描和选择蓝牙设备
 */

import React, { useState, useEffect } from 'react';
import { Bluetooth, Search, Wifi, Battery, X, Monitor, Smartphone } from 'lucide-react';
import { useBluetoothState, useUIState } from '../hooks/useAppState.js';
import { LoadingButton } from './LoadingSpinner.jsx';
import BluetoothService from '../services/BluetoothService.js';

const DeviceSelector = () => {
  const { isConnected, device, isScanning, connectionError, scanDevices, connectDevice } = useBluetoothState();
  const { modals, toggleModal } = useUIState();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [simulationMode, setSimulationMode] = useState(true);
  const [simulatedDevices, setSimulatedDevices] = useState([]);

  // 获取模拟设备列表
  useEffect(() => {
    if (simulationMode) {
      const devices = BluetoothService.getSimulatedDevices();
      setSimulatedDevices(devices);
    }
  }, [simulationMode]);

  const handleScanDevices = async () => {
    try {
      if (simulationMode) {
        // 模拟模式：直接显示模拟设备列表
        const devices = BluetoothService.getSimulatedDevices();
        setSimulatedDevices(devices);
      } else {
        // 真实模式：扫描真实设备
        const device = await scanDevices();
        setSelectedDevice(device);
      }
    } catch (error) {
      console.error('扫描设备失败:', error);
    }
  };

  const handleToggleSimulationMode = () => {
    const newMode = !simulationMode;
    setSimulationMode(newMode);
    BluetoothService.setSimulationMode(newMode);
    setSelectedDevice(null);
    setSimulatedDevices([]);
  };

  const handleConnectDevice = async (device = selectedDevice) => {
    if (!device) return;
    
    try {
      await connectDevice(device);
      toggleModal('deviceSelector', false);
      setSelectedDevice(null);
    } catch (error) {
      console.error('连接设备失败:', error);
    }
  };

  const handleClose = () => {
    toggleModal('deviceSelector', false);
    setSelectedDevice(null);
  };

  if (!modals.deviceSelector) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bluetooth className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">设备连接</h2>
                <p className="text-blue-100 text-sm">扫描并连接智能锁设备</p>
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
          {/* 当前连接状态 */}
          {isConnected && device && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-green-800 font-semibold">已连接设备</p>
                  <p className="text-green-600 text-sm">{device.name}</p>
                </div>
              </div>
            </div>
          )}

          {/* 错误信息 */}
          {connectionError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 text-sm">{connectionError}</p>
            </div>
          )}

          {/* 模式切换 */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  simulationMode ? 'bg-orange-100' : 'bg-blue-100'
                }`}>
                  {simulationMode ? (
                    <Monitor className={`w-5 h-5 ${
                      simulationMode ? 'text-orange-600' : 'text-blue-600'
                    }`} />
                  ) : (
                    <Smartphone className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {simulationMode ? '模拟模式' : '真实设备模式'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {simulationMode ? '使用虚拟设备进行测试' : '连接真实蓝牙设备'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleSimulationMode}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  simulationMode
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                切换
              </button>
            </div>
          </div>

          {/* 扫描按钮 */}
          <div className="mb-6">
            <LoadingButton
              isLoading={isScanning}
              loadingText={simulationMode ? "加载设备..." : "扫描中..."}
              onClick={handleScanDevices}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
            >
              <Search className="w-5 h-5" />
              <span>{simulationMode ? '显示模拟设备' : '扫描设备'}</span>
            </LoadingButton>
          </div>

          {/* 设备选择 */}
          {simulationMode && simulatedDevices.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">模拟设备列表</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {simulatedDevices.map((simDevice) => (
                  <div
                    key={simDevice.id}
                    className={`border rounded-xl p-4 transition-all ${
                      selectedDevice?.id === simDevice.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          selectedDevice?.id === simDevice.id ? 'bg-blue-200' : 'bg-orange-100'
                        }`}>
                          <Monitor className={`w-5 h-5 ${
                            selectedDevice?.id === simDevice.id ? 'text-blue-600' : 'text-orange-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {simDevice.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {simDevice.id} • 状态: {simDevice.status === 'locked' ? '已锁定' : '已解锁'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Battery className={`w-4 h-4 ${
                            simDevice.battery > 50 ? 'text-green-500' : 
                            simDevice.battery > 20 ? 'text-yellow-500' : 'text-red-500'
                          }`} />
                          <span className="text-sm text-gray-600">{simDevice.battery}%</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          simDevice.status === 'locked' ? 'bg-red-400' : 'bg-green-400'
                        }`}></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedDevice(simDevice)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedDevice?.id === simDevice.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {selectedDevice?.id === simDevice.id ? '已选择' : '选择'}
                      </button>
                      <LoadingButton
                         onClick={() => {
                           setSelectedDevice(simDevice);
                           handleConnectDevice(simDevice);
                         }}
                         className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                         loadingText="连接中..."
                       >
                         连接
                       </LoadingButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 真实设备选择 */}
          {!simulationMode && selectedDevice && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">发现的设备</h3>
              <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Bluetooth className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {selectedDevice.name || '未知设备'}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {selectedDevice.id?.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 text-green-500" />
                    <Battery className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 连接按钮 */}
          {selectedDevice && (
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-colors"
              >
                取消
              </button>
              <LoadingButton
                onClick={handleConnectDevice}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                loadingText="连接中..."
              >
                连接设备
              </LoadingButton>
            </div>
          )}

          {/* 使用说明 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-800 mb-2">使用说明</h4>
            {simulationMode ? (
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 模拟模式无需真实设备</li>
                <li>• 选择任意模拟设备进行测试</li>
                <li>• 模拟设备会响应所有命令</li>
                <li>• 适合功能测试和演示</li>
              </ul>
            ) : (
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 确保智能锁设备已开启蓝牙</li>
                <li>• 设备需要在可发现模式</li>
                <li>• 首次连接可能需要配对</li>
                <li>• 连接距离建议在10米以内</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceSelector;