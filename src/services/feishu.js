/**
 * 飞书多维表格 API 服务封装
 * Feishu Bitable API Service
 * 
 * 提供统一的 CRUD 操作接口，封装飞书 Bitable API
 */

const axios = require('axios');
const TABLE_CONFIG = require('../config/tables');

// 飞书 API 基础地址
const BASE_URL = 'https://open.feishu.cn/open-apis/bitable/v1';

// 从环境变量获取 App Access Token
// 注意：实际部署时需要通过飞书应用获取 tenant_access_token
const APP_ACCESS_TOKEN = process.env.FEISHU_APP_ACCESS_TOKEN || '';

/**
 * 通用请求头
 */
const getHeaders = () => ({
  'Authorization': `Bearer ${APP_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
});

/**
 * 获取数据表中的所有记录
 * @param {string} tableKey - 表标识 (market/account/position/trade)
 * @param {Object} options - 查询选项 { pageSize, pageToken, filter }
 * @returns {Promise<Array>} 记录数组
 */
async function listRecords(tableKey, options = {}) {
  const { appToken, tableId } = TABLE_CONFIG[tableKey];
  const { pageSize = 100, pageToken = '' } = options;
  
  let url = `${BASE_URL}/apps/${appToken}/tables/${tableId}/records?page_size=${pageSize}`;
  if (pageToken) {
    url += `&page_token=${pageToken}`;
  }
  
  try {
    const response = await axios.get(url, { headers: getHeaders() });
    const data = response.data;
    
    if (data.code !== 0) {
      throw new Error(`Feishu API Error: ${data.msg}`);
    }
    
    return {
      records: data.data?.items || [],
      hasMore: data.data?.has_more || false,
      nextPageToken: data.data?.next_page_token || '',
      total: data.data?.total || 0,
    };
  } catch (error) {
    console.error(`[FeishuService] listRecords Error:`, error.message);
    throw error;
  }
}

/**
 * 获取单条记录
 * @param {string} tableKey - 表标识
 * @param {string} recordId - 记录ID
 * @returns {Promise<Object>} 记录对象
 */
async function getRecord(tableKey, recordId) {
  const { appToken, tableId } = TABLE_CONFIG[tableKey];
  const url = `${BASE_URL}/apps/${appToken}/tables/${tableId}/records/${recordId}`;
  
  try {
    const response = await axios.get(url, { headers: getHeaders() });
    const data = response.data;
    
    if (data.code !== 0) {
      throw new Error(`Feishu API Error: ${data.msg}`);
    }
    
    return data.data?.record || null;
  } catch (error) {
    console.error(`[FeishuService] getRecord Error:`, error.message);
    throw error;
  }
}

/**
 * 创建记录
 * @param {string} tableKey - 表标识
 * @param {Object} fields - 字段数据 { field_name: value }
 * @returns {Promise<Object>} 创建的记录
 */
async function createRecord(tableKey, fields) {
  const { appToken, tableId } = TABLE_CONFIG[tableKey];
  const url = `${BASE_URL}/apps/${appToken}/tables/${tableId}/records`;
  
  try {
    const response = await axios.post(url, { fields }, { headers: getHeaders() });
    const data = response.data;
    
    if (data.code !== 0) {
      throw new Error(`Feishu API Error: ${data.msg}`);
    }
    
    return data.data?.record || null;
  } catch (error) {
    console.error(`[FeishuService] createRecord Error:`, error.message);
    throw error;
  }
}

/**
 * 更新记录
 * @param {string} tableKey - 表标识
 * @param {string} recordId - 记录ID
 * @param {Object} fields - 更新的字段数据
 * @returns {Promise<Object>} 更新后的记录
 */
async function updateRecord(tableKey, recordId, fields) {
  const { appToken, tableId } = TABLE_CONFIG[tableKey];
  const url = `${BASE_URL}/apps/${appToken}/tables/${tableId}/records/${recordId}`;
  
  try {
    const response = await axios.put(url, { fields }, { headers: getHeaders() });
    const data = response.data;
    
    if (data.code !== 0) {
      throw new Error(`Feishu API Error: ${data.msg}`);
    }
    
    return data.data?.record || null;
  } catch (error) {
    console.error(`[FeishuService] updateRecord Error:`, error.message);
    throw error;
  }
}

/**
 * 删除记录
 * @param {string} tableKey - 表标识
 * @param {string} recordId - 记录ID
 * @returns {Promise<boolean>} 是否删除成功
 */
async function deleteRecord(tableKey, recordId) {
  const { appToken, tableId } = TABLE_CONFIG[tableKey];
  const url = `${BASE_URL}/apps/${appToken}/tables/${tableId}/records/${recordId}`;
  
  try {
    const response = await axios.delete(url, { headers: getHeaders() });
    const data = response.data;
    
    if (data.code !== 0) {
      throw new Error(`Feishu API Error: ${data.msg}`);
    }
    
    return true;
  } catch (error) {
    console.error(`[FeishuService] deleteRecord Error:`, error.message);
    throw error;
  }
}

/**
 * 批量创建记录
 * @param {string} tableKey - 表标识
 * @param {Array<Object>} records - 记录数组 [{ fields: {...} }]
 * @returns {Promise<Object>} 批量操作结果
 */
async function batchCreateRecords(tableKey, records) {
  const { appToken, tableId } = TABLE_CONFIG[tableKey];
  const url = `${BASE_URL}/apps/${appToken}/tables/${tableId}/records/batch_create`;
  
  try {
    const response = await axios.post(url, { records }, { headers: getHeaders() });
    const data = response.data;
    
    if (data.code !== 0) {
      throw new Error(`Feishu API Error: ${data.msg}`);
    }
    
    return {
      records: data.data?.records || [],
      total: data.data?.records?.length || 0,
    };
  } catch (error) {
    console.error(`[FeishuService] batchCreateRecords Error:`, error.message);
    throw error;
  }
}

module.exports = {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  batchCreateRecords,
};
