# 智能锁耐久性测试系统 - 产品需求文档 (PRD)

## 1. 产品概述

### 1.1 产品定义
智能锁耐久性测试系统是一个专业的Web应用程序，用于执行智能锁的长时间或高频率开锁测试，验证智能锁组件的耐用性和性能表现。系统提供完整的测试控制、数据记录、分析和管理功能。

### 1.2 核心价值
- **自动化测试**：减少人工干预，提高测试效率和准确性
- **数据驱动**：基于详细数据分析提供科学的维护建议
- **实时监控**：实时跟踪测试进度和设备状态
- **历史管理**：完整的测试记录管理和数据导出功能

### 1.3 目标用户
- 智能锁制造商的质量测试工程师
- 产品研发团队
- 质量保证部门
- 维护服务团队

## 2. 功能架构

### 2.1 页面结构
```
智能锁测试系统
├── 仪表板 (Dashboard)
│   ├── 系统概览
│   ├── 实时监控
│   └── 快速统计
├── 测试控制 (TestControl)
│   ├── 测试配置
│   ├── 执行控制
│   └── 实时状态
├── 测试结果 (TestResults)
│   ├── 性能分析
│   ├── 故障分析
│   └── 组件健康
├── 测试历史 (TestHistory)
│   ├── 历史记录
│   ├── 搜索过滤
│   └── 数据导出
└── 系统设置 (TestSettings)
    ├── 测试参数
    ├── 硬件配置
    └── 告警设置
```

### 2.2 核心功能模块

#### 2.2.1 测试控制模块
**功能描述**：提供完整的测试配置和执行控制功能

**核心特性**：
- **测试模式**：
  - 按次数测试：设置目标测试次数
  - 按时间测试：设置测试持续时间
  - 连续测试：无限制连续测试
- **测试配置**：
  - 测试间隔：每次测试之间的等待时间
  - 智能锁型号：支持多种锁型号配置
  - 测试类型：开锁、上锁、组合测试
- **执行控制**：
  - 开始测试：启动新的测试会话
  - 暂停/继续：临时暂停和恢复测试
  - 停止测试：终止当前测试会话

**状态管理**：
```javascript
// 测试状态枚举
const TestStatus = {
  STOPPED: 'stopped',    // 已停止
  RUNNING: 'running',    // 运行中
  PAUSED: 'paused'       // 已暂停
}

// 测试配置数据结构
const TestConfig = {
  mode: 'count|time|continuous',
  targetCount: number,
  targetDuration: number,
  interval: number,
  lockModel: string,
  testType: string
}
```

#### 2.2.2 数据记录与监控模块
**功能描述**：实时记录测试数据并提供监控功能

**数据结构**：
```javascript
// 测试记录数据结构
const TestRecord = {
  id: string,
  sessionId: string,
  timestamp: Date,
  operation: 'unlock|lock',
  result: 'success|failure',
  responseTime: number,
  errorCode: string,
  componentStatus: {
    motor: 'normal|warning|error',
    sensor: 'normal|warning|error',
    communication: 'normal|warning|error'
  }
}

// 测试会话数据结构
const TestSession = {
  id: string,
  startTime: Date,
  endTime: Date,
  status: 'running|completed|failed',
  config: TestConfig,
  summary: {
    totalAttempts: number,
    successfulUnlocks: number,
    failedUnlocks: number,
    successRate: number,
    averageResponseTime: number,
    testDuration: number
  }
}
```

#### 2.2.3 数据分析模块
**功能描述**：提供多维度的测试数据分析和可视化

**分析维度**：
- **性能趋势分析**：
  - 响应时间趋势图
  - 成功率变化曲线
  - 性能指标对比
- **故障分析**：
  - 故障类型分布
  - 故障频率统计
  - 故障时间分析
- **组件健康评估**：
  - 组件使用次数统计
  - 健康度评分算法
  - 维护建议生成

**图表类型**：
```javascript
// 图表配置
const ChartTypes = {
  LINE_CHART: 'line',      // 趋势线图
  BAR_CHART: 'bar',        // 柱状图
  PIE_CHART: 'pie',        // 饼图
  AREA_CHART: 'area'       // 面积图
}
```

#### 2.2.4 历史管理模块
**功能描述**：提供完整的测试历史记录管理功能

**核心功能**：
- **记录查看**：分页显示历史测试记录
- **搜索过滤**：
  - 按时间范围过滤
  - 按测试状态过滤
  - 按锁型号过滤
  - 按成功率范围过滤
- **数据导出**：
  - CSV格式导出
  - JSON格式导出
  - Excel格式导出
- **批量操作**：
  - 批量删除记录
  - 批量导出数据

#### 2.2.5 系统设置模块
**功能描述**：提供系统参数配置和管理功能

**配置类别**：
- **测试参数配置**：
  - 默认测试模式
  - 默认测试间隔
  - 性能阈值设置
- **硬件配置**：
  - 智能锁型号管理
  - 连接参数设置
  - 通信协议配置
- **告警设置**：
  - 故障告警阈值
  - 性能告警阈值
  - 维护提醒设置
- **数据管理**：
  - 自动备份配置
  - 数据保留策略
  - 存储空间管理

## 3. 技术架构

### 3.1 前端技术栈
```javascript
// 核心框架和库
const TechStack = {
  framework: 'React 18',
  router: 'React Router DOM',
  styling: 'Tailwind CSS',
  charts: 'Recharts',
  icons: 'Lucide React',
  buildTool: 'Vite',
  stateManagement: 'React Hooks + Context'
}
```

### 3.2 后端技术栈
```javascript
const BackendStack = {
  runtime: 'Node.js',
  framework: 'Express.js',
  database: 'SQLite3',
  cors: 'CORS middleware',
  fileSystem: 'fs/promises'
}
```

### 3.3 数据库设计
```sql
-- 测试会话表
CREATE TABLE test_sessions (
  id TEXT PRIMARY KEY,
  start_time DATETIME,
  end_time DATETIME,
  status TEXT,
  config TEXT,
  summary TEXT
);

-- 测试记录表
CREATE TABLE test_records (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  timestamp DATETIME,
  operation TEXT,
  result TEXT,
  response_time INTEGER,
  error_code TEXT,
  component_status TEXT,
  FOREIGN KEY (session_id) REFERENCES test_sessions(id)
);

-- 组件健康状态表
CREATE TABLE component_health (
  id TEXT PRIMARY KEY,
  component_name TEXT,
  health_score INTEGER,
  usage_count INTEGER,
  last_maintenance DATETIME,
  next_maintenance DATETIME
);

-- 系统配置表
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  category TEXT,
  updated_at DATETIME
);
```

### 3.4 组件架构
```javascript
// 组件层次结构
const ComponentHierarchy = {
  App: {
    children: [
      'MobileHeader',
      'Router',
      'BottomNavigation'
    ]
  },
  Router: {
    routes: [
      { path: '/', component: 'Dashboard' },
      { path: '/test-control', component: 'TestControl' },
      { path: '/test-results', component: 'TestResults' },
      { path: '/test-history', component: 'TestHistory' },
      { path: '/settings', component: 'TestSettings' }
    ]
  }
}
```

## 4. UI/UX 设计规范

### 4.1 设计原则
- **移动优先**：专为移动设备优化的响应式设计
- **现代化界面**：采用Material Design风格
- **统一配色**：限制在3种主要颜色（灰色、蓝色、绿色）
- **直观操作**：清晰的信息层次和用户引导

### 4.2 配色方案
```css
/* 主色调 */
:root {
  --primary-blue: #3B82F6;      /* 主要操作按钮 */
  --success-green: #10B981;     /* 成功状态 */
  --neutral-gray: #6B7280;      /* 中性内容 */
  --background-slate: #F8FAFC;  /* 背景色 */
  --text-dark: #1F2937;         /* 主要文字 */
  --text-light: #6B7280;        /* 次要文字 */
}
```

### 4.3 组件样式规范
```css
/* 卡片组件 */
.card {
  @apply bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg;
}

/* 按钮组件 */
.button-primary {
  @apply bg-blue-500/10 backdrop-blur-sm border border-blue-200/30 
         hover:bg-blue-500/20 text-blue-600 rounded-2xl 
         transition-all duration-300 font-semibold shadow-sm 
         hover:shadow-md active:scale-95;
}

/* 导航组件 */
.navigation {
  @apply bg-white/70 backdrop-blur-sm border-t border-white/20 
         shadow-lg rounded-t-3xl;
}
```

### 4.4 响应式断点
```css
/* 响应式设计断点 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

## 5. 数据流和状态管理

### 5.1 状态管理架构
```javascript
// 全局状态结构
const GlobalState = {
  testSession: {
    current: TestSession | null,
    status: TestStatus,
    progress: {
      currentCount: number,
      targetCount: number,
      elapsedTime: number,
      estimatedRemaining: number
    }
  },
  testData: {
    realTimeMetrics: {
      successRate: number,
      averageResponseTime: number,
      currentThroughput: number
    },
    historicalData: TestRecord[],
    performanceCharts: ChartData[]
  },
  systemConfig: {
    testSettings: TestConfig,
    hardwareConfig: HardwareConfig,
    alertSettings: AlertConfig
  },
  ui: {
    activeTab: string,
    loading: boolean,
    notifications: Notification[]
  }
}
```

### 5.2 数据流向
```
用户操作 → UI组件 → 状态更新 → API调用 → 数据库操作 → 响应返回 → 状态更新 → UI重渲染
```

### 5.3 实时数据更新
```javascript
// WebSocket连接用于实时数据推送
const WebSocketEvents = {
  TEST_PROGRESS: 'test_progress',
  TEST_RESULT: 'test_result',
  SYSTEM_ALERT: 'system_alert',
  COMPONENT_STATUS: 'component_status'
}
```

## 6. API 接口规范

### 6.1 RESTful API 设计
```javascript
// API端点定义
const APIEndpoints = {
  // 测试控制
  'POST /api/test/start': '启动测试',
  'POST /api/test/pause': '暂停测试',
  'POST /api/test/resume': '恢复测试',
  'POST /api/test/stop': '停止测试',
  'GET /api/test/status': '获取测试状态',
  
  // 数据查询
  'GET /api/sessions': '获取测试会话列表',
  'GET /api/sessions/:id': '获取特定会话详情',
  'GET /api/records': '获取测试记录',
  'GET /api/analytics': '获取分析数据',
  
  // 配置管理
  'GET /api/settings': '获取系统设置',
  'PUT /api/settings': '更新系统设置',
  'GET /api/hardware': '获取硬件配置',
  'PUT /api/hardware': '更新硬件配置',
  
  // 数据导出
  'POST /api/export/csv': '导出CSV格式',
  'POST /api/export/json': '导出JSON格式',
  'POST /api/export/excel': '导出Excel格式'
}
```

### 6.2 数据格式规范
```javascript
// API响应格式
const APIResponse = {
  success: boolean,
  data: any,
  message: string,
  timestamp: Date,
  requestId: string
}

// 错误响应格式
const ErrorResponse = {
  success: false,
  error: {
    code: string,
    message: string,
    details: any
  },
  timestamp: Date,
  requestId: string
}
```

## 7. 性能和安全要求

### 7.1 性能指标
- **页面加载时间**：< 2秒
- **API响应时间**：< 500ms
- **实时数据更新延迟**：< 100ms
- **并发用户支持**：最多10个同时在线用户
- **数据库查询优化**：复杂查询 < 1秒

### 7.2 安全要求
- **数据传输**：HTTPS加密
- **输入验证**：所有用户输入进行验证和清理
- **错误处理**：不暴露敏感系统信息
- **访问控制**：基于角色的权限管理
- **数据备份**：定期自动备份重要数据

## 8. 部署和维护

### 8.1 部署环境
```yaml
# 生产环境配置
production:
  platform: "GitHub Pages"
  url: "https://putongongji.github.io/smart-lock-endurance-test/"
  build_command: "npm run build"
  deploy_command: "npm run deploy"

# 开发环境配置
development:
  platform: "Local"
  url: "http://localhost:5173/"
  start_command: "npm run dev"
```

### 8.2 监控和日志
- **应用监控**：实时监控应用性能和错误
- **用户行为分析**：跟踪用户操作和使用模式
- **系统日志**：记录关键操作和错误信息
- **性能指标**：监控响应时间、内存使用等

## 9. 扩展性考虑

### 9.1 功能扩展
- **多设备支持**：支持同时测试多个智能锁
- **云端同步**：数据云端备份和同步
- **移动应用**：开发原生移动应用
- **AI分析**：集成机器学习进行预测性维护

### 9.2 技术扩展
- **微服务架构**：拆分为独立的微服务
- **容器化部署**：使用Docker进行容器化
- **负载均衡**：支持高并发访问
- **分布式数据库**：支持大规模数据存储

## 10. 版本规划

### 10.1 当前版本 (v1.1)
- ✅ 核心功能完成
- ✅ 界面优化完成
- ✅ 响应式设计
- 🔄 持续优化中

### 10.2 未来版本规划
- **v1.2**：增强数据分析功能，添加更多图表类型
- **v1.3**：支持多设备并行测试
- **v2.0**：重构为微服务架构，支持云端部署
- **v2.1**：集成AI预测性维护功能

---

**文档版本**：v1.0  
**最后更新**：2025年1月18日  
**维护者**：智能锁测试系统开发团队