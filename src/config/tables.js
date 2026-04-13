/**
 * 飞书多维表格配置
 * Investment Manager - Feishu Bitable Configuration
 */

// 多维表格 App Token 和 Table ID 配置
const TABLE_CONFIG = {
  // 基金行情表
  market: {
    appToken: 'ZXlFbUXjcafrVIsH3PqcJDM7nRe',
    tableId: 'tblXO3apfS96yo2t',
  },
  // 投资账户表
  account: {
    appToken: 'Xeq2b2OFDaD1CVsKBZNcopUcnkd',
    tableId: 'tblFJ7NKesJQApWM',
  },
  // 投资持仓表
  position: {
    appToken: 'Lgutb8rYqaewimssf3JcPiAqnCB',
    tableId: 'tbl8k7TJHT5Y8B3X',
  },
  // 投资交易记录表
  trade: {
    appToken: 'Om4YbJpRTa7uHrsjyIgct4WnnSr',
    tableId: 'tblEPBZwxrNirUql',
  },
};

module.exports = TABLE_CONFIG;
