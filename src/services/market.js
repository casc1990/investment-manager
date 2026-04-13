/**
 * 基金行情服务
 * Fund Market Service
 * 
 * 定时同步基金净值数据
 * 数据来源：支付宝基金接口
 */

const axios = require('axios');
const feishuService = require('./feishu');

/**
 * 从支付宝获取基金净值数据
 * @param {string} fundCode - 基金代码，如 008163
 * @returns {Promise<Object>} 基金行情数据
 */
async function fetchFundData(fundCode) {
  try {
    // 支付宝基金净值查询接口
    const url = `https://api.fund.eastmoney.com/f10/lsjz?callback=jQuery&fundCode=${fundCode}&pageIndex=1&pageSize=1&_=${Date.now()}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://fund.eastmoney.com/',
      },
      timeout: 10000,
    });
    
    // 解析返回数据
    const text = response.data;
    const jsonStr = text.replace(/^jQuery\(/, '').replace(/\)$/, '');
    const data = JSON.parse(jsonStr);
    
    if (data.Data && data.Data.LSJZList && data.Data.LSJZList.length > 0) {
      const latest = data.Data.LSJZList[0];
      return {
        fundCode,
        fundName: data.Data.FundName || '',
        date: latest.RZXQ,
        nav: parseFloat(latest.DWJZ) || 0,
        dailyChange: parseFloat(latest.JZZZL) || 0,
      };
    }
    
    throw new Error('No data available');
  } catch (error) {
    console.error(`[MarketService] fetchFundData Error for ${fundCode}:`, error.message);
    return null;
  }
}

/**
 * 同步基金行情到飞书表格
 * @param {string} fundCode - 基金代码
 * @param {Object} marketData - 行情数据
 */
async function syncFundToBitable(fundCode, marketData) {
  try {
    // 获取今日日期字符串 (格式: 20260413)
    const today = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '');
    
    // 获取所有市场记录
    const result = await feishuService.listRecords('market', { pageSize: 500 });
    
    // 查找该基金今日是否已有记录
    const existingRecord = result.records.find(record => {
      const recordDate = String(record.fields['日期'] || '');
      const recordFundCode = record.fields['基金代码'];
      // 日期可能是时间戳或字符串，需要统一处理
      let recordDateStr = recordDate;
      if (/^\d{13}$/.test(recordDate)) {
        recordDateStr = new Date(parseInt(recordDate)).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).replace(/\//g, '');
      }
      return recordFundCode === fundCode && recordDateStr === today;
    });
    
    const fields = {
      日期: today,  // 使用日期字符串格式: 20260413
      基金代码: fundCode,
      基金名称: marketData.fundName,
      日涨跌幅: marketData.dailyChange,
      净值: marketData.nav,
    };
    
    if (existingRecord) {
      // 更新现有记录
      await feishuService.updateRecord('market', existingRecord.record_id, fields);
      console.log(`[MarketService] Updated market data for ${fundCode} on ${today}`);
    } else {
      // 创建新记录
      await feishuService.createRecord('market', fields);
      console.log(`[MarketService] Created market data for ${fundCode} on ${today}`);
    }
  } catch (error) {
    console.error(`[MarketService] syncFundToBitable Error:`, error.message);
  }
}

/**
 * 同步所有持仓基金的行情
 * 每日定时任务调用
 */
async function syncAllPositions() {
  console.log('[MarketService] Starting daily sync...');
  
  try {
    // 获取所有持仓记录
    const positions = await feishuService.listRecords('position');
    const fundCodes = [...new Set(positions.records.map(p => p.fields['基金代码']))];
    
    console.log(`[MarketService] Found ${fundCodes.length} unique funds to sync`);
    
    for (const fundCode of fundCodes) {
      if (!fundCode) continue;
      
      const marketData = await fetchFundData(fundCode);
      if (marketData) {
        await syncFundToBitable(fundCode, marketData);
      }
      
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('[MarketService] Daily sync completed');
  } catch (error) {
    console.error('[MarketService] syncAllPositions Error:', error.message);
  }
}

/**
 * 获取基金最新行情
 * @param {string} fundCode - 基金代码
 * @returns {Promise<Object>} 最新行情
 */
async function getLatestMarket(fundCode) {
  try {
    const result = await feishuService.listRecords('market', { pageSize: 500 });
    
    // 找到该基金的所有记录，按日期降序排序
    const fundRecords = result.records
      .filter(r => r.fields['基金代码'] === fundCode)
      .sort((a, b) => {
        const dateA = String(a.fields['日期'] || '0');
        const dateB = String(b.fields['日期'] || '0');
        // 如果是时间戳，转为数字比较；否则字符串比较
        const numA = /^\d{13}$/.test(dateA) ? parseInt(dateA) : dateA;
        const numB = /^\d{13}$/.test(dateB) ? parseInt(dateB) : dateB;
        return numB > numA ? 1 : (numB < numA ? -1 : 0);
      });
    
    if (fundRecords.length > 0) {
      const latest = fundRecords[0].fields;
      return {
        fundCode: latest['基金代码'],
        fundName: latest['基金名称'],
        date: latest['日期'],
        nav: parseFloat(latest['净值']) || 0,
        dailyChange: parseFloat(latest['日涨跌幅']) || 0,
      };
    }
    
    // 如果本地没有，尝试从API获取
    const marketData = await fetchFundData(fundCode);
    if (marketData) {
      await syncFundToBitable(fundCode, marketData);
      return marketData;
    }
    
    return null;
  } catch (error) {
    console.error(`[MarketService] getLatestMarket Error:`, error.message);
    return null;
  }
}

module.exports = {
  fetchFundData,
  syncFundToBitable,
  syncAllPositions,
  getLatestMarket,
};
