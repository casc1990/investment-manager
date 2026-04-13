-- 投资管理系统数据库结构
-- D1 Database Schema

-- 账户表
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT '其他',
    status TEXT NOT NULL DEFAULT '正常',
    remark TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- 持仓表
CREATE TABLE IF NOT EXISTS positions (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    account_name TEXT,
    fund_code TEXT NOT NULL,
    fund_name TEXT,
    quantity REAL NOT NULL DEFAULT 0,
    amount REAL DEFAULT 0,
    current_profit REAL DEFAULT 0,
    dividend_method TEXT DEFAULT '红利再投',
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- 交易记录表
CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    fund_code TEXT NOT NULL,
    trade_type TEXT NOT NULL,
    quantity REAL DEFAULT 0,
    amount REAL DEFAULT 0,
    fee REAL DEFAULT 0,
    trade_date INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- 基金行情表
CREATE TABLE IF NOT EXISTS market (
    id TEXT PRIMARY KEY,
    fund_code TEXT NOT NULL,
    fund_name TEXT,
    nav REAL DEFAULT 0,
    daily_change REAL DEFAULT 0,
    date INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    UNIQUE(fund_code, date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_positions_account ON positions(account_id);
CREATE INDEX IF NOT EXISTS idx_positions_fund ON positions(fund_code);
CREATE INDEX IF NOT EXISTS idx_trades_account ON trades(account_id);
CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(trade_date);
CREATE INDEX IF NOT EXISTS idx_market_fund ON market(fund_code);
