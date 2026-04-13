/**
 * 交易记录路由
 * Trade Record Routes
 * 
 * 提供买卖交易的 CRUD 操作接口
 */

const express = require('express');
const router = express.Router();
const feishuService = require('../services/feishu');

/**
 * GET /api/trades
 * 获取所有交易记录
 * Query: accountId, fundCode, tradeType, startDate, endDate
 */
router.get('/', async (req, res) => {
  try {
    const { accountId, fundCode, tradeType, startDate, endDate } = req.query;
    const result = await feishuService.listRecords('trade');
    
    let trades = result.records.map(record => ({
      id: record.record_id,
      ...record.fields,
    }));
    
    // 筛选条件
    if (accountId) {
      trades = trades.filter(t => t['账户ID'] === accountId);
    }
    if (fundCode) {
      trades = trades.filter(t => t['基金代码'] === fundCode);
    }
    if (tradeType) {
      trades = trades.filter(t => t['交易类型'] === tradeType);
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        total: trades.length,
        trades,
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
 * POST /api/trades
 * 记录交易（买入/卖出）
 * 
 * Body: { accountId, fundCode, tradeType, quantity, amount, fee, tradeDate }
 */
router.post('/', async (req, res) => {
  try {
    const { accountId, fundCode, tradeType, quantity, amount, fee, tradeDate } = req.body;
    
    if (!accountId || !fundCode || !tradeType || (!quantity && !amount)) {
      return res.status(400).json({
        code: 400,
        message: 'accountId, fundCode, tradeType, and quantity/amount are required',
        data: null,
      });
    }
    
    const fields = {
      账户ID: accountId,
      基金代码: fundCode,
      交易类型: tradeType,
      交易数量: quantity ? parseFloat(quantity) : 0,
      交易金额: amount ? parseFloat(amount) : 0,
      手续费: fee ? parseFloat(fee) : 0,
      交易日期: tradeDate ? new Date(tradeDate).getTime() : Date.now(),
    };
    
    const record = await feishuService.createRecord('trade', fields);
    
    res.json({
      code: 0,
      message: 'Trade recorded successfully',
      data: {
        id: record.record_id,
        ...record.fields,
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
 * DELETE /api/trades/:id
 * 删除交易记录
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await feishuService.deleteRecord('trade', id);
    
    res.json({
      code: 0,
      message: 'Trade deleted successfully',
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
