/**
 * 持仓管理路由
 * Position Management Routes
 * 
 * 提供持仓的 CRUD 操作接口
 */

const express = require('express');
const router = express.Router();
const feishuService = require('../services/feishu');

/**
 * GET /api/positions
 * 获取所有持仓列表
 * Query: accountId (可选) - 按账户ID筛选
 */
router.get('/', async (req, res) => {
  try {
    const { accountId } = req.query;
    const result = await feishuService.listRecords('position');
    
    let positions = result.records.map(record => ({
      id: record.record_id,
      ...record.fields,
    }));
    
    // 按账户ID筛选
    if (accountId) {
      positions = positions.filter(p => p['账户ID'] === accountId);
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        total: positions.length,
        positions,
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
 * GET /api/positions/:id
 * 获取单个持仓详情
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await feishuService.getRecord('position', id);
    
    if (!record) {
      return res.status(404).json({
        code: 404,
        message: 'Position not found',
        data: null,
      });
    }
    
    res.json({
      code: 0,
      message: 'success',
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
 * POST /api/positions
 * 添加持仓记录
 * 
 * Body: { accountId, fundCode, fundName, quantity(持有份额), buyNav(买入净值), costPrice, dividendMethod }
 */
router.post('/', async (req, res) => {
  try {
    const { accountId, fundCode, fundName, quantity, buyNav, costPrice, dividendMethod } = req.body;
    
    if (!accountId || !fundCode || !quantity) {
      return res.status(400).json({
        code: 400,
        message: 'accountId, fundCode, and quantity are required',
        data: null,
      });
    }
    
    // 计算买入净值：如果没提供，用持有金额/持有份额估算
    let navPrice = parseFloat(buyNav) || 0;
    const shares = parseFloat(quantity);
    const amount = parseFloat(req.body.amount) || 0;
    if (navPrice === 0 && shares > 0 && amount > 0) {
      navPrice = amount / shares;  // 用持有金额/持有份额估算净值
    }
    
    const fields = {
      账户ID: accountId,
      基金代码: fundCode,
      基金名称: fundName || '',
      持有份额: shares,
      持有金额: amount,
      当前收益: parseFloat(req.body.currentProfit) || 0,
      买入净值: navPrice,
      成本价: parseFloat(costPrice) || navPrice,
      分红方式: dividendMethod || '红利再投',
    };
    
    const record = await feishuService.createRecord('position', fields);
    
    res.json({
      code: 0,
      message: 'Position created successfully',
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
 * PUT /api/positions/:id
 * 更新持仓信息
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { accountId, fundCode, fundName, quantity, buyNav, costPrice, dividendMethod, amount, currentProfit } = req.body;
    
    const fields = {};
    if (accountId) fields['账户ID'] = accountId;
    if (fundCode) fields['基金代码'] = fundCode;
    if (fundName) fields['基金名称'] = fundName;
    if (quantity !== undefined) fields['持有份额'] = parseFloat(quantity);
    if (amount !== undefined) fields['持有金额'] = parseFloat(amount);
    if (currentProfit !== undefined) fields['当前收益'] = parseFloat(currentProfit);
    if (buyNav !== undefined) fields['买入净值'] = parseFloat(buyNav);
    if (costPrice !== undefined) fields['成本价'] = parseFloat(costPrice);
    if (dividendMethod) fields['分红方式'] = dividendMethod;
    
    const record = await feishuService.updateRecord('position', id, fields);
    
    res.json({
      code: 0,
      message: 'Position updated successfully',
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
 * DELETE /api/positions/:id
 * 删除持仓记录
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await feishuService.deleteRecord('position', id);
    
    res.json({
      code: 0,
      message: 'Position deleted successfully',
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
