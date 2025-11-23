/**
 * Kho Hàng API Service
 * Xử lý các API calls liên quan đến kho hàng
 */

import { apiFetch } from './baseApi.js';

/**
 * Lấy tất cả kho hàng (có phân trang và filter)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Dữ liệu kho hàng
 */
export async function getAllKhoHangs(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/khohangs${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch warehouse stocks');
  }
  
  return await response.json();
}

/**
 * Lấy kho hàng theo ID
 * @param {string|number} id - Kho hàng ID
 * @returns {Promise<Object>} Dữ liệu kho hàng
 */
export async function getKhoHangById(id) {
  const response = await apiFetch(`v1/khohangs/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch warehouse stock');
  }
  
  return await response.json();
}

/**
 * Lấy danh sách tồn kho thấp
 * @param {number} idChiNhanh - Chi nhánh ID (optional)
 * @returns {Promise<Object>} Dữ liệu tồn kho thấp
 */
export async function getTonKhoThap(idChiNhanh = null) {
  const params = {};
  if (idChiNhanh) params.idChiNhanh = idChiNhanh;
  
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/khohangs/ton-kho-thap${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch low stock items');
  }
  
  return await response.json();
}

/**
 * Cập nhật kho hàng
 * @param {string|number} id - Kho hàng ID
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<Object>} Kết quả cập nhật
 */
export async function updateKhoHang(id, data) {
  const response = await apiFetch(`v1/khohangs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update warehouse stock');
  }
  
  return { success: true };
}

/**
 * Tạo kho hàng thủ công
 * @param {Object} data - Dữ liệu kho hàng
 * @returns {Promise<Object>} Kho hàng đã tạo
 */
export async function createKhoHang(data) {
  const response = await apiFetch('v1/khohangs', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create warehouse stock');
  }
  
  return await response.json();
}

/**
 * Xóa kho hàng
 * @param {string|number} id - Kho hàng ID
 * @returns {Promise<Object>} Kết quả xóa
 */
export async function deleteKhoHang(id) {
  const response = await apiFetch(`v1/khohangs/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete warehouse stock');
  }
  
  return await response.json();
}