/**
 * 加载动画组件
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', className = '', text = '' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      case 'md':
      default:
        return 'w-6 h-6';
    }
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 className={`animate-spin text-blue-500 ${getSizeClasses()}`} />
      {text && (
        <span className="text-sm text-gray-600 font-medium">
          {text}
        </span>
      )}
    </div>
  );
};

const LoadingOverlay = ({ isVisible, text = '加载中...' }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
};

const LoadingButton = ({ 
  isLoading, 
  children, 
  onClick, 
  disabled, 
  className = '',
  loadingText = '处理中...',
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`relative flex items-center justify-center space-x-2 ${className} ${isLoading ? 'cursor-not-allowed' : ''}`}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" />
          <span>{loadingText}</span>
        </>
      ) : (
        <div className="flex items-center space-x-2">
          {children}
        </div>
      )}
    </button>
  );
};

export { LoadingSpinner, LoadingOverlay, LoadingButton };
export default LoadingSpinner;