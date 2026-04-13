/**
 * 投资管理系统 - 主入口
 * Investment Manager - Main Entry
 * 
 * 后端 API 服务
 */

const express = require('express');
const cron = require('node-cron');
const marketService = require('./services/market');

// 导入路由
const accountRoutes = require('./routes/account');
const positionRoutes = require('./routes/position');
const tradeRoutes = require('./routes/trade');
const marketRoutes = require('./routes/market');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// CORS 支持（前端开发时允许跨域）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API 路由挂载
app.use('/api/accounts', accountRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/stats', statsRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    code: 0,
    message: 'ok',
    data: {
      service: 'Investment Manager API',
      version: '1.0.0',
      timestamp: Date.now(),
    },
  });
});

// 定时任务：每个交易日晚上 21:30 同步行情
// cron 表达式: 分 时 日 月 周
// 21:30 = "30 21 * * 1-5" (周一到周五)
cron.schedule('30 21 * * 1-5', async () => {
  console.log('[Cron] Starting scheduled market sync...');
  await marketService.syncAllPositions();
}, {
  timezone: 'Asia/Shanghai',
});

// 启动服务
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   📊 投资管理系统 - API 服务                            ║
║                                                        ║
║   🚀 Server running on http://localhost:${PORT}           ║
║                                                        ║
║   📋 API Endpoints:                                    ║
║      GET  /health                                      ║
║      GET  /api/accounts                                ║
║      POST /api/accounts                                ║
║      GET  /api/positions                               ║
║      POST /api/positions                               ║
║      GET  /api/trades                                  ║
║      POST /api/trades                                  ║
║      GET  /api/market                                  ║
║      POST /api/market/sync                             ║
║      GET  /api/stats/overview                          ║
║      GET  /api/stats/position/:id                      ║
║      GET  /api/stats/history                           ║
║                                                        ║
║   ⏰ Scheduled Task:                                   ║
║      行情同步 - 每个交易日 21:30                       ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
