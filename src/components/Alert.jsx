/**
 * 警报组件
 * 用于显示各种类型的通知消息
 */

import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useUIState } from '../hooks/useAppState.js';

const Alert = ({ alert, onClose }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getAlertStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconStyles = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className={`relative p-4 rounded-lg border shadow-sm ${getAlertStyles(alert.type)} animate-slide-in`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${getIconStyles(alert.type)}`}>
          {getAlertIcon(alert.type)}
        </div>
        <div className="flex-1 min-w-0">
          {alert.title && (
            <h4 className="text-sm font-semibold mb-1">
              {alert.title}
            </h4>
          )}
          <p className="text-sm opacity-90">
            {alert.message}
          </p>
          {alert.timestamp && (
            <p className="text-xs opacity-70 mt-1">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={() => onClose(alert.id)}
            className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const AlertContainer = () => {
  const { alerts, removeAlert } = useUIState();

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          alert={alert}
          onClose={removeAlert}
        />
      ))}
    </div>
  );
};

export { Alert, AlertContainer };
export default AlertContainer;