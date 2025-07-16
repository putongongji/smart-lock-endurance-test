import express from 'express'
import cors from 'cors'
import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3004

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

// 确保数据库目录存在
const dbDir = join(__dirname, 'data')
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// 数据库连接
const db = new sqlite3.Database(join(dbDir, 'endurance_test.db'))

// 初始化数据库表
db.serialize(() => {
  // 测试会话表
  db.run(`
    CREATE TABLE IF NOT EXISTS test_sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      lock_model TEXT NOT NULL,
      test_type TEXT NOT NULL,
      test_mode TEXT NOT NULL,
      target_count INTEGER,
      target_duration INTEGER,
      interval_seconds INTEGER,
      start_time DATETIME,
      end_time DATETIME,
      status TEXT DEFAULT 'running',
      total_attempts INTEGER DEFAULT 0,
      successful_attempts INTEGER DEFAULT 0,
      failed_attempts INTEGER DEFAULT 0,
      average_response_time REAL DEFAULT 0,
      failure_reason TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 测试记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS test_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      attempt_number INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      action TEXT NOT NULL,
      result TEXT NOT NULL,
      response_time INTEGER,
      error_message TEXT,
      component_status TEXT,
      FOREIGN KEY (session_id) REFERENCES test_sessions (id)
    )
  `)

  // 组件健康表
  db.run(`
    CREATE TABLE IF NOT EXISTS component_health (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      component_name TEXT NOT NULL,
      health_score INTEGER NOT NULL,
      status TEXT NOT NULL,
      last_maintenance DATE,
      notes TEXT,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES test_sessions (id)
    )
  `)

  // 系统设置表
  db.run(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
})

// API 路由

// 获取所有测试会话
app.get('/api/test-sessions', (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query
  
  let query = 'SELECT * FROM test_sessions'
  let params = []
  
  if (status && status !== 'all') {
    query += ' WHERE status = ?'
    params.push(status)
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(parseInt(limit), parseInt(offset))
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json(rows)
  })
})

// 创建新的测试会话
app.post('/api/test-sessions', (req, res) => {
  const {
    id,
    name,
    lockModel,
    testType,
    testMode,
    targetCount,
    targetDuration,
    intervalSeconds,
    notes
  } = req.body
  
  const query = `
    INSERT INTO test_sessions (
      id, name, lock_model, test_type, test_mode, 
      target_count, target_duration, interval_seconds, 
      start_time, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  
  db.run(query, [
    id, name, lockModel, testType, testMode,
    targetCount, targetDuration, intervalSeconds,
    new Date().toISOString(), notes
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json({ id: this.lastID, sessionId: id })
  })
})

// 更新测试会话
app.put('/api/test-sessions/:id', (req, res) => {
  const { id } = req.params
  const {
    status,
    totalAttempts,
    successfulAttempts,
    failedAttempts,
    averageResponseTime,
    failureReason,
    notes
  } = req.body
  
  const endTime = status === 'completed' || status === 'failed' ? new Date().toISOString() : null
  
  const query = `
    UPDATE test_sessions SET
      status = ?,
      total_attempts = ?,
      successful_attempts = ?,
      failed_attempts = ?,
      average_response_time = ?,
      failure_reason = ?,
      notes = ?,
      end_time = ?
    WHERE id = ?
  `
  
  db.run(query, [
    status, totalAttempts, successfulAttempts, failedAttempts,
    averageResponseTime, failureReason, notes, endTime, id
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json({ changes: this.changes })
  })
})

// 添加测试记录
app.post('/api/test-records', (req, res) => {
  const {
    sessionId,
    attemptNumber,
    action,
    result,
    responseTime,
    errorMessage,
    componentStatus
  } = req.body
  
  const query = `
    INSERT INTO test_records (
      session_id, attempt_number, action, result, 
      response_time, error_message, component_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `
  
  db.run(query, [
    sessionId, attemptNumber, action, result,
    responseTime, errorMessage, componentStatus
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json({ id: this.lastID })
  })
})

// 获取测试记录
app.get('/api/test-records/:sessionId', (req, res) => {
  const { sessionId } = req.params
  const { limit = 100, offset = 0 } = req.query
  
  const query = `
    SELECT * FROM test_records 
    WHERE session_id = ? 
    ORDER BY attempt_number DESC 
    LIMIT ? OFFSET ?
  `
  
  db.all(query, [sessionId, parseInt(limit), parseInt(offset)], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json(rows)
  })
})

// 获取测试统计
app.get('/api/test-stats/:sessionId', (req, res) => {
  const { sessionId } = req.params
  
  const queries = {
    session: 'SELECT * FROM test_sessions WHERE id = ?',
    records: `
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN result = 'success' THEN 1 ELSE 0 END) as successful_records,
        SUM(CASE WHEN result = 'failure' THEN 1 ELSE 0 END) as failed_records,
        AVG(response_time) as avg_response_time,
        MIN(response_time) as min_response_time,
        MAX(response_time) as max_response_time
      FROM test_records WHERE session_id = ?
    `,
    hourlyStats: `
      SELECT 
        strftime('%H', timestamp) as hour,
        COUNT(*) as attempts,
        AVG(response_time) as avg_response_time,
        SUM(CASE WHEN result = 'success' THEN 1 ELSE 0 END) as successful
      FROM test_records 
      WHERE session_id = ? AND date(timestamp) = date('now')
      GROUP BY strftime('%H', timestamp)
      ORDER BY hour
    `
  }
  
  const results = {}
  let completed = 0
  const total = Object.keys(queries).length
  
  Object.entries(queries).forEach(([key, query]) => {
    db.all(query, [sessionId], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      
      results[key] = key === 'session' ? rows[0] : rows
      completed++
      
      if (completed === total) {
        res.json(results)
      }
    })
  })
})

// 删除测试会话
app.delete('/api/test-sessions/:id', (req, res) => {
  const { id } = req.params
  
  db.serialize(() => {
    db.run('DELETE FROM test_records WHERE session_id = ?', [id])
    db.run('DELETE FROM component_health WHERE session_id = ?', [id])
    db.run('DELETE FROM test_sessions WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json({ changes: this.changes })
    })
  })
})

// 获取系统设置
app.get('/api/settings', (req, res) => {
  db.all('SELECT * FROM system_settings', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    const settings = {}
    rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value)
      } catch {
        settings[row.key] = row.value
      }
    })
    
    res.json(settings)
  })
})

// 保存系统设置
app.post('/api/settings', (req, res) => {
  const settings = req.body
  
  db.serialize(() => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO system_settings (key, value, updated_at) 
      VALUES (?, ?, ?)
    `)
    
    Object.entries(settings).forEach(([key, value]) => {
      stmt.run(key, JSON.stringify(value), new Date().toISOString())
    })
    
    stmt.finalize((err) => {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json({ success: true })
    })
  })
})

// 导出数据
app.get('/api/export/:sessionId', (req, res) => {
  const { sessionId } = req.params
  const { format = 'csv' } = req.query
  
  const query = `
    SELECT 
      ts.name as session_name,
      ts.lock_model,
      ts.test_type,
      tr.attempt_number,
      tr.timestamp,
      tr.action,
      tr.result,
      tr.response_time,
      tr.error_message
    FROM test_sessions ts
    JOIN test_records tr ON ts.id = tr.session_id
    WHERE ts.id = ?
    ORDER BY tr.attempt_number
  `
  
  db.all(query, [sessionId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    if (format === 'csv') {
      const headers = Object.keys(rows[0] || {})
      const csvContent = [
        headers.join(','),
        ...rows.map(row => headers.map(header => row[header]).join(','))
      ].join('\n')
      
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="test_${sessionId}.csv"`)
      res.send(csvContent)
    } else {
      res.json(rows)
    }
  })
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  })
})

// 服务静态文件
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`智能锁测损系统服务器运行在 http://localhost:${PORT}`)
})

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...')
  db.close((err) => {
    if (err) {
      console.error('关闭数据库时出错:', err.message)
    } else {
      console.log('数据库连接已关闭')
    }
    process.exit(0)
  })
})