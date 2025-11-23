// src/js/api/loHangApi.js
/**
 * Lô Hàng API Service
 * Xử lý các API calls liên quan đến lô hàng
 */

import { apiFetch } from './baseApi.js';

/**
 * Lấy tất cả lô hàng (có phân trang và filter)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Dữ liệu lô hàng
 */
export async function getAllLoHangs(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/lohangs${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch batches');
  }
  
  return await response.json();
}

/**
 * Lấy lô hàng theo ID
 * @param {string|number} id - Lô hàng ID
 * @returns {Promise<Object>} Dữ liệu lô hàng
 */
export async function getLoHangById(id) {
  const response = await apiFetch(`v1/lohangs/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch batch');
  }
  
  return await response.json();
}

/**
 * Lấy lô hàng sắp hết hạn
 * @param {number} days - Số ngày threshold (mặc định 30)
 * @param {number} idChiNhanh - Chi nhánh ID (optional)
 * @returns {Promise<Object>} Dữ liệu lô hàng sắp hết hạn
 */
export async function getLoHangSapHetHan(days = 30, idChiNhanh = null) {
  const params = { days };
  if (idChiNhanh) params.idChiNhanh = idChiNhanh;
  
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/lohangs/sap-het-han${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch expiring batches');
  }
  
  return await response.json();
}

/**
 * Lấy lô hàng theo thuốc ID
 * @param {string|number} thuocId - Thuốc ID
 * @returns {Promise<Object>} Dữ liệu lô hàng
 */
export async function getLoHangByThuocId(thuocId) {
  const response = await apiFetch(`v1/lohangs/thuoc/${thuocId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch batches by medicine');
  }
  
  return await response.json();
}

/**
 * Cập nhật lô hàng
 * @param {string|number} id - Lô hàng ID
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<Object>} Kết quả cập nhật
 */
export async function updateLoHang(id, data) {
  const response = await apiFetch(`v1/lohangs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update batch');
  }
  
  return { success: true };
}

/**
 * Tạo lô hàng thủ công
 * @param {Object} data - Dữ liệu lô hàng
 * @param {number} idChiNhanh - Chi nhánh ID
 * @returns {Promise<Object>} Lô hàng đã tạo
 */
export async function createLoHang(data, idChiNhanh) {
  const response = await apiFetch(`v1/lohangs?idChiNhanh=${idChiNhanh}`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create batch');
  }
  
  return await response.json();
}

/**
 * Xóa lô hàng
 * @param {string|number} id - Lô hàng ID
 * @returns {Promise<Object>} Kết quả xóa
 */
export async function deleteLoHang(id) {
  const response = await apiFetch(`v1/lohangs/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete batch');
  }
  
  return await response.json();
}