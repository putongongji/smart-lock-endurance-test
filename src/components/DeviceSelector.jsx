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
  const simulationMode = true; // 固定使用模拟模式
  const [simulatedDevices, setSimulatedDevices] = useState([]);

  // 获取模拟设备列表
  useEffect(() => {
    if (simulationMode) {
      const devices = BluetoothService.getSimulatedDevices();
      setSimulatedDevices(devices);
    }
  }, [simulationMode]);

  // 组件加载时自动显示设备列表
  useEffect(() => {
    if (modals.deviceSelector) {
      handleScanDevices();
    }
  }, [modals.deviceSelector]);

  const handleScanDevices = async () => {
    try {
      // 固定使用模拟模式：直接显示模拟设备列表
      const devices = BluetoothService.getSimulatedDevices();
      setSimulatedDevices(devices);
    } catch (error) {
      console.error('扫描设备失败:', error);
    }
  };

  // 移除模式切换功能，固定使用模拟模式
  useEffect(() => {
    BluetoothService.setSimulationMode(true);
  }, []);

  const handleTestDevice = async (device) => {
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





          {/* 设备选择 */}
          {simulatedDevices.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">设备列表</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {simulatedDevices.map((simDevice) => (
                  <div
                    key={simDevice.id}
                    className="border border-gray-200 hover:border-blue-300 hover:bg-gray-50 rounded-xl p-4 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-orange-100">
                          <Monitor className="w-5 h-5 text-orange-600" />
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
                         onClick={() => {}}
                         className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                       >
                         测试
                       </button>
                       <LoadingButton
                         onClick={() => handleTestDevice(simDevice)}
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






        </div>
      </div>
    </div>
  );
};

export default DeviceSelector;