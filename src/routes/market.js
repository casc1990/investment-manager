/**
 * 行情路由
 * Market Routes
 * 
 * 提供基金行情查询接口
 */

const express = require('express');
const router = express.Router();
const marketService = require('../services/market');
const feishuService = require('../services/feishu');

/**
 * GET /api/market
 * 获取基金行情列表
 * Query: fundCode (可选)
 */
router.get('/', async (req, res) => {
  try {
    const { fundCode } = req.query;
    const result = await feishuService.listRecords('market', { pageSize: 100 });
    
    let markets = result.records.map(record => ({
      id: record.record_id,
      ...record.fields,
    }));
    
    // 按基金代码筛选
    if (fundCode) {
      markets = markets.filter(m => m['基金代码'] === fundCode);
    }
    
    // 按日期降序排序
    markets.sort((a, b) => (b['日期'] || 0) - (a['日期'] || 0));
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        total: markets.length,
        markets,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message,
      data: null,
    });
  }
});

/**
 * GET /api/market/:fundCode
 * 获取指定基金的最新行情
 */
router.get('/:fundCode', async (req, res) => {
  try {
    const { fundCode } = req.params;
    const market = await marketService.getLatestMarket(fundCode);
    
    if (!market) {
      return res.status(404).json({
        code: 404,
        message: 'Market data not found',
        data: null,
      });
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: market,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message,
      data: null,
    });
  }
});

/**
 * POST /api/market/sync
 * 手动触发行情同步（管理员接口）
 */
router.post('/sync', async (req, res) => {
  try {
    await marketService.syncAllPositions();
    
    res.json({
      code: 0,
      message: 'Market sync triggered successfully',
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message,
      data: null,
    });
  }
});

module.exports = router;
