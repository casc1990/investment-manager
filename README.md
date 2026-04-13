# 📊 投资管理系统 API 文档

> 移动端 H5 投资管理后端服务

---

## 🔧 环境配置

```bash
# 复制配置示例
cp .env.example .env

# 编辑 .env 填写飞书凭证
vim .env
```

---

## 🚀 启动服务

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产模式
npm start
```

---

## 📋 API 列表

### 健康检查

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 服务健康检查 |

**响应示例：**
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "service": "Investment Manager API",
    "version": "1.0.0",
    "timestamp": 1744166400000
  }
}
```

---

### 🏦 账户管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/accounts` | 获取所有账户 |
| GET | `/api/accounts/:id` | 获取账户详情 |
| POST | `/api/accounts` | 创建账户 |
| PUT | `/api/accounts/:id` | 更新账户 |
| DELETE | `/api/accounts/:id` | 删除账户 |

**创建账户 - 请求体：**
```json
{
  "accountName": "支付宝-主账户",
  "channel": "支付宝",
  "status": "正常",
  "remark": "日常理财"
}
```

---

### 📦 持仓管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/positions` | 获取所有持仓 |
| GET | `/api/positions/:id` | 获取持仓详情 |
| POST | `/api/positions` | 添加持仓 |
| PUT | `/api/positions/:id` | 更新持仓 |
| DELETE | `/api/positions/:id` | 删除持仓 |

**添加持仓 - 请求体：**
```json
{
  "accountId": "支付宝-主账户",
  "fundCode": "008163",
  "fundName": "南方红利低波50ETF联接A",
  "quantity": 5000,
  "buyNav": 1.0843,
  "costPrice": 1.05
}
```

---

### 💹 交易记录

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/trades` | 获取交易记录 |
| POST | `/api/trades` | 记录交易 |
| DELETE | `/api/trades/:id` | 删除记录 |

**记录交易 - 请求体：**
```json
{
  "accountId": "支付宝-主账户",
  "fundCode": "008163",
  "tradeType": "买入",
  "quantity": 1000,
  "amount": 1084.3,
  "fee": 0.5,
  "tradeDate": "2026-04-09"
}
```

---

### 📈 行情数据

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/market` | 获取行情列表 |
| GET | `/api/market/:fundCode` | 获取基金最新行情 |
| POST | `/api/market/sync` | 手动触发行情同步 |

---

### 📊 收益统计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/stats/overview` | 收益总览 |
| GET | `/api/stats/position/:id` | 持仓收益详情 |
| GET | `/api/stats/history` | 历史收益记录 |

**收益总览 - 响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "summary": {
      "totalInvested": "50000.00",
      "totalMarketValue": "53500.00",
      "totalProfit": "3500.00",
      "totalProfitRate": "7.00"
    },
    "accounts": [
      {
        "accountId": "支付宝-主账户",
        "accountName": "支付宝-主账户",
        "channel": "支付宝",
        "invested": "30000.00",
        "marketValue": "32000.00",
        "profit": "2000.00",
        "profitRate": "6.67"
      }
    ]
  }
}
```

---

## ⏰ 定时任务

| 任务 | 时间 | 说明 |
|------|------|------|
| 行情同步 | 每个交易日 21:30 | 自动同步基金净值 |

---

## 📁 数据表结构

| 表名 | App Token | Table ID | 用途 |
|------|-----------|----------|------|
| 基金行情表 | `ZXlFbUXjcafrVIsH3PqcJDM7nRe` | `tblXO3apfS96yo2t` | 基金净值/涨跌幅 |
| 投资账户表 | `Xeq2b2OFDaD1CVsKBZNcopUcnkd` | `tblFJ7NKesJQApWM` | 账户信息 |
| 投资持仓表 | `Lgutb8rYqaewimssf3JcPiAqnCB` | `tbl8k7TJHT5Y8B3X` | 持仓记录 |
| 投资交易记录表 | `Om4YbJpRTa7uHrsjyIgct4WnnSr` | `tblEPBZwxrNirUql` | 交易流水 |

---

## 🔐 注意事项

1. **飞书凭证**：需要配置有效的 `FEISHU_APP_ACCESS_TOKEN` 才能访问多维表格
2. **CORS**：当前配置允许所有来源跨域（仅用于开发环境）
3. **数据安全**：生产环境请配置正确的 CORS 策略和认证机制
