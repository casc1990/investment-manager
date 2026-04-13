/**
 * 收益统计路由
 * Statistics Routes
 * 
 * 提供投资收益统计接口
 */

const express = require('express');
const router = express.Router();
const feishuService = require('../services/feishu');
const marketService = require('../services/market');

/**
 * GET /api/stats/overview
 * 获取投资收益总览
 */
router.get('/overview', async (req, res) => {
  try {
    const { accountId } = req.query;
    
    // 获取所有持仓
    let positionsResult = await feishuService.listRecords('position');
    let positions = positionsResult.records.map(r => ({
      id: r.record_id,
      ...r.fields,
    }));
    
    // 按账户筛选
    if (accountId) {
      positions = positions.filter(p => p['账户ID'] === accountId);
    }
    
    // 获取所有账户
    const accountsResult = await feishuService.listRecords('account');
    const accounts = accountsResult.records.map(r => ({
      id: r.record_id,
      ...r.fields,
    }));
    
    // 计算各账户收益
    let totalInvested = 0;  // 总本金
    let totalMarketValue = 0;  // 总市值
    let totalProfit = 0;  // 总收益
    
    const accountStats = [];
    
    for (const account of accounts) {
      // 持仓的账户ID应该匹配账户的 record_id
      const accountPositions = positions.filter(p => p['账户ID'] === account.id);
      
      let accountInvested = 0;
      let accountMarketValue = 0;
      
      for (const pos of accountPositions) {
        const fundCode = pos['基金代码'];
        const quantity = parseFloat(pos['持仓数量']) || 0;
        const costPrice = parseFloat(pos['成本价']) || 0;
        const buyNav = parseFloat(pos['买入净值']) || costPrice;
        
        // 计算本金
        const invested = quantity * buyNav;
        accountInvested += invested;
        
        // 获取最新净值计算市值
        const market = await marketService.getLatestMarket(fundCode);
        if (market) {
          accountMarketValue += quantity * market.nav;
        } else {
          accountMarketValue += invested;
        }
      }
      
      const profit = accountMarketValue - accountInvested;
      const profitRate = accountInvested > 0 ? (profit / accountInvested * 100) : 0;
      
      accountStats.push({
        accountId: account.id,
        accountName: account['账户名称'],
        channel: account['渠道'],
        invested: Number(accountInvested.toFixed(2)),
        marketValue: Number(accountMarketValue.toFixed(2)),
        profit: Number(profit.toFixed(2)),
        profitRate: Number(profitRate.toFixed(2)),
      });
      
      totalInvested += accountInvested;
      totalMarketValue += accountMarketValue;
    }
    
    totalProfit = totalMarketValue - totalInvested;
    const totalProfitRate = totalInvested > 0 ? (totalProfit / totalInvested * 100) : 0;
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        summary: {
          totalInvested: Number(totalInvested.toFixed(2)),
          totalMarketValue: Number(totalMarketValue.toFixed(2)),
          totalProfit: Number(totalProfit.toFixed(2)),
          totalProfitRate: Number(totalProfitRate.toFixed(2)),
        },
        accounts: accountStats,
      },
    });
  } catch (error) {
    console.error('[Stats] overview Error:', error);
    res.status(500).json({
      code: 500,
      message: error.message,
      data: null,
    });
  }
});

/**
 * GET /api/stats/position/:positionId
 * 获取单条持仓的收益详情
 */
router.get('/position/:positionId', async (req, res) => {
  try {
    const { positionId } = req.params;
    
    // 获取持仓信息
    const position = await feishuService.getRecord('position', positionId);
    if (!position) {
      return res.status(404).json({
        code: 404,
        message: 'Position not found',
        data: null,
      });
    }
    
    const fields = position.fields;
    const fundCode = fields['基金代码'];
    const quantity = parseFloat(fields['持仓数量']) || 0;
    const costPrice = parseFloat(fields['成本价']) || 0;
    const buyNav = parseFloat(fields['买入净值']) || costPrice;
    
    // 获取最新净值
    const market = await marketService.getLatestMarket(fundCode);
    
    // 计算收益
    const invested = quantity * buyNav;  // 本金
    const currentValue = market ? quantity * market.nav : invested;  // 市值
    const profit = currentValue - invested;  // 收益
    const profitRate = invested > 0 ? (profit / invested * 100) : 0;
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        positionId,
        fundCode,
        fundName: fields['基金名称'],
        accountId: fields['账户ID'],
        quantity,
        buyNav,
        costPrice,
        currentNav: market?.nav || buyNav,
        dailyChange: market?.dailyChange || 0,
        invested: Number(invested.toFixed(2)),
        currentValue: Number(currentValue.toFixed(2)),
        profit: Number(profit.toFixed(2)),
        profitRate: Number(profitRate.toFixed(2)),
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
 * GET /api/stats/history
 * 获取历史收益记录（汇总）
 */
router.get('/history', async (req, res) => {
  try {
    const { accountId, fundCode, startDate, endDate } = req.query;
    
    // 获取交易记录作为历史
    let tradesResult = await feishuService.listRecords('trade');
    let trades = tradesResult.records.map(r => ({
      id: r.record_id,
      ...r.fields,
    }));
    
    // 筛选条件
    if (accountId) {
      trades = trades.filter(t => t['账户ID'] === accountId);
    }
    if (fundCode) {
      trades = trades.filter(t => t['基金代码'] === fundCode);
    }
    
    // 按日期排序
    trades.sort((a, b) => (b['交易日期'] || 0) - (a['交易日期'] || 0));
    
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

module.exports = router;
