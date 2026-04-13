/**
 * 账户管理路由
 * Account Management Routes
 * 
 * 提供账户的 CRUD 操作接口
 */

const express = require('express');
const router = express.Router();
const feishuService = require('../services/feishu');

/**
 * GET /api/accounts
 * 获取所有账户列表
 */
router.get('/', async (req, res) => {
  try {
    const result = await feishuService.listRecords('account');
    
    // 格式化返回数据
    const accounts = result.records.map(record => ({
      id: record.record_id,
      ...record.fields,
    }));
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        total: result.total,
        accounts,
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
 * GET /api/accounts/:id
 * 获取单个账户详情
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await feishuService.getRecord('account', id);
    
    if (!record) {
      return res.status(404).json({
        code: 404,
        message: 'Account not found',
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
 * POST /api/accounts
 * 创建新账户
 * 
 * Body: { accountName, channel, status, remark }
 */
router.post('/', async (req, res) => {
  try {
    const { accountName, channel, status, remark } = req.body;
    
    if (!accountName) {
      return res.status(400).json({
        code: 400,
        message: 'accountName is required',
        data: null,
      });
    }
    
    const fields = {
      账户名称: accountName,
      渠道: channel || '其他',
      账户状态: status || '正常',
      备注: remark || '',
    };
    
    const record = await feishuService.createRecord('account', fields);
    
    res.json({
      code: 0,
      message: 'Account created successfully',
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
 * PUT /api/accounts/:id
 * 更新账户信息
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { accountName, channel, status, remark } = req.body;
    
    const fields = {};
    if (accountName) fields['账户名称'] = accountName;
    if (channel) fields['渠道'] = channel;
    if (status) fields['账户状态'] = status;
    if (remark !== undefined) fields['备注'] = remark;
    
    const record = await feishuService.updateRecord('account', id, fields);
    
    res.json({
      code: 0,
      message: 'Account updated successfully',
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
 * DELETE /api/accounts/:id
 * 删除账户
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await feishuService.deleteRecord('account', id);
    
    res.json({
      code: 0,
      message: 'Account deleted successfully',
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
