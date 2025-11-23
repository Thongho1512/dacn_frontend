/**
 * Đơn Nhập Hàng API Service
 * Xử lý các API calls liên quan đến đơn nhập hàng
 */

import { apiFetch } from './baseApi.js';

/**
 * Lấy tất cả đơn nhập hàng (có phân trang và filter)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Dữ liệu đơn nhập hàng
 */
export async function getAllDonNhapHangs(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/donnhaphangs${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch import orders');
  }
  
  return await response.json();
}

/**
 * Lấy đơn nhập hàng theo ID
 * @param {string|number} id - Đơn nhập hàng ID
 * @returns {Promise<Object>} Dữ liệu đơn nhập hàng
 */
export async function getDonNhapHangById(id) {
  const response = await apiFetch(`v1/donnhaphangs/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch import order');
  }
  
  return await response.json();
}

/**
 * Tạo đơn nhập hàng mới
 * @param {Object} orderData - Dữ liệu đơn nhập hàng
 * @returns {Promise<Object>} Đơn nhập hàng đã tạo
 */
export async function createDonNhapHang(orderData) {
  const response = await apiFetch('v1/donnhaphangs', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create import order');
  }
  
  return await response.json();
}

/**
 * Cập nhật đơn nhập hàng
 * @param {string|number} id - Đơn nhập hàng ID
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<Object>} Kết quả cập nhật
 */
export async function updateDonNhapHang(id, data) {
  const response = await apiFetch(`v1/donnhaphangs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update import order');
  }
  
  return { success: true };
}

/**
 * Xóa đơn nhập hàng
 * @param {string|number} id - Đơn nhập hàng ID
 * @returns {Promise<Object>} Kết quả xóa
 */
export async function deleteDonNhapHang(id) {
  const response = await apiFetch(`v1/donnhaphangs/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete import order');
  }
  
  return await response.json();
}

/**
 * Lấy tất cả thuốc (cho dropdown)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Dữ liệu thuốc
 */
export async function getAllThuocs(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/thuocs${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch medicines');
  }
  
  return await response.json();
}