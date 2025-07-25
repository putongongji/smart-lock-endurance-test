# 八卦炉 - 智能锁耐久性测试工具 - 产品需求文档 (PRD)

## 1. 产品概述

### 1.1 产品定义
八卦炉是一个专业的Web端智能锁耐久性测试工具，专门用于执行长时间或高频率的开锁测试，验证智能锁组件的耐用性和性能表现。该工具采用现代化的Web技术栈，为智能锁制造商、质检工程师、现场维护人员和产品测试团队提供直观的用户界面和强大的数据分析功能。

### 1.2 核心价值
- **Web端便携**：基于浏览器的应用，支持跨平台访问，无需安装
- **专业测试**：提供标准化的智能锁耐久性测试流程和协议
- **模拟测试**：支持模拟模式，便于演示和功能验证

### 1.3 目标用户
- **主要用户**：智能锁制造商的质检团队和测试工程师

### 1.4 应用场景
- **生产质检**：产线智能锁批量测试和质量验证
- **耐久性验证**：长时间高频率测试验证产品耐用性
- **售前演示**：客户现场的产品演示和性能验证（模拟模式）

## 2. 功能架构

### 2.1 应用架构
```
八卦炉 - 智能锁耐久性测试工具
├── 设备管理模块
│   ├── 设备连接
│   ├── 状态监控
│   └── 设备信息
├── 测试控制模块
│   ├── 测试执行
│   ├── 参数配置
│   └── 实时控制
└── 结果管理模块
    ├── 数据记录
    ├── 结果分析
    └── 历史管理
```

### 2.2 设备管理模块
- **设备连接**: 管理智能锁设备的连接和通信
- **设备状态**: 监控设备基本状态信息
- **设备信息**: 显示设备基础信息和性能指标

### 2.3 测试控制模块
- **测试执行**: 执行智能锁耐久性测试流程
- **参数配置**: 设置测试次数、间隔时间等参数
- **实时控制**: 提供开始、暂停、停止等控制功能

### 2.4 结果管理模块
- **数据记录**: 记录测试过程中的详细数据
- **结果分析**: 提供测试结果的统计分析功能
- **历史管理**: 管理历史测试记录和数据导出

## 3. 技术架构

### 3.1 技术栈

**前端技术栈**：
- **React 18**: 现代化用户界面框架
- **React Router**: 单页应用路由管理
- **Tailwind CSS**: 实用优先的CSS框架
- **Vite**: 快速构建工具和开发服务器

**设备通信**：
- **Web Bluetooth API**: 浏览器蓝牙通信接口
- **模拟模式**: 内置模拟设备支持
- **协议支持**: BLE 4.0+, BLE 5.0+

**数据存储**：
- **SQLite3**: 轻量级关系型数据库
- **本地存储**: localStorage / sessionStorage
- **数据持久化**: 本地文件系统存储

**数据可视化**：
- **Recharts**: React图表库
- **Lucide React**: 现代化图标库
- **统计分析**: 自研算法和数据处理

**后端服务**：
- **Node.js**: JavaScript运行时环境
- **Express.js**: Web应用框架
- **CORS**: 跨域资源共享支持

### 3.2 架构设计

#### 3.2.1 Web应用架构
```
┌─────────────────────────────────────────┐
│              Presentation Layer         │
│  ┌─────────────────────────────────────┐ │
│  │        React Components             │ │
│  │  (TestControl, TestResults, etc.)   │ │
│  └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│               Business Layer            │
│  ┌─────────────────────────────────────┐ │
│  │         Custom Hooks                │ │
│  │  (useAppState, useTestState, etc.)  │ │
│  └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│               Service Layer             │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐  │
│  │Bluetooth │ │  Test    │ │ State   │  │
│  │ Service  │ │ Service  │ │Service  │  │
│  └──────────┘ └──────────┘ └─────────┘  │
├─────────────────────────────────────────┤
│                Data Layer               │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐  │
│  │ SQLite   │ │ Local    │ │ Session │  │
│  │Database  │ │ Storage  │ │Storage  │  │
│  └──────────┘ └──────────┘ └─────────┘  │
└─────────────────────────────────────────┘
```

#### 3.2.2 设备通信架构
```
┌─────────────────────────────────────────┐
│            Application Layer            │
│         (Test Control Logic)            │
├─────────────────────────────────────────┤
│           Device Manager                │
│  ┌─────────────────────────────────────┐ │
│  │     Simulation Service              │ │
│  │     Connection Manager              │ │
│  │     Command Processor               │ │
│  │     Status Monitor                  │ │
│  └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│          Communication Interface        │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │Web Bluetooth│  │  Simulation     │   │
│  │    API      │  │    Mode         │   │
│  └─────────────┘  └─────────────────┘   │
├─────────────────────────────────────────┤
│              Hardware Layer             │
│         (Bluetooth Radio / Mock)        │
└─────────────────────────────────────────┘
```



## 4. 数据模型

### 4.1 核心数据结构

基于实际代码实现的数据模型定义：

```javascript
// 设备信息模型（基于BluetoothService）
interface SmartLockDevice {
  id: string;           // 设备唯一标识
  name: string;         // 设备名称
  battery: number;      // 电池电量 (0-100)
  signalStrength: number; // 信号强度 (dBm)
  temperature: number;  // 设备温度
  lockStatus: 'locked' | 'unlocked' | 'unknown'; // 锁状态
}

// 测试配置模型（基于TestService）
interface TestConfiguration {
  testCount: number;    // 测试次数，默认100
  interval: number;     // 测试间隔，默认1000ms
  timeout: number;      // 超时时间，默认5000ms
}

// 测试结果模型（基于TestService.currentTest）
interface TestResult {
  id: string;           // 测试唯一标识
  config: TestConfiguration; // 测试配置
  startTime: Date;      // 开始时间
  endTime: Date | null; // 结束时间
  currentCycle: number; // 当前循环次数
  totalCycles: number;  // 总循环次数
  successCount: number; // 成功次数
  failureCount: number; // 失败次数
  results: TestAttempt[]; // 详细测试结果
  status: 'running' | 'paused' | 'stopped' | 'completed'; // 测试状态
}

// 单次测试尝试结果
interface TestAttempt {
  timestamp: Date;      // 测试时间戳
  type: 'unlock' | 'lock'; // 测试类型
  success: boolean;     // 是否成功
  responseTime: number; // 响应时间(ms)
  error?: string;       // 错误信息
}
```


## 5. 性能要求

### 5.1 响应性能
- **页面加载时间**: ≤ 2秒
- **设备连接响应**: ≤ 3秒
- **测试命令响应**: ≤ 1秒
- **数据刷新频率**: 1秒/次

### 5.2 测试性能
- **最大测试次数**: 10,000次
- **最小测试间隔**: 100ms
- **并发测试支持**: 单设备
- **数据记录精度**: 毫秒级

### 5.3 系统稳定性
- **连续运行时间**: ≥ 24小时
- **内存使用限制**: ≤ 512MB
- **错误恢复时间**: ≤ 5秒
- **数据丢失率**: ≤ 0.1%

## 6. 安全要求

### 6.1 数据安全
- **本地存储**: 所有数据存储在本地浏览器
- **数据备份**: 支持CSV/JSON格式导出
- **隐私保护**: 不上传任何数据到云端

### 6.2 访问控制
- **输入验证**: 用户输入数据验证
- **权限控制**: 基于浏览器的访问控制