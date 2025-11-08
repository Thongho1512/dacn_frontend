/**
 * Đơn Hàng API Service
 * Xử lý các API calls liên quan đến đơn hàng
 */

import { apiFetch } from './baseApi.js';

/**
 * Lấy tất cả đơn hàng (có phân trang và filter)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Dữ liệu đơn hàng
 */
export async function getAllDonHangs(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/donhangs${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch orders');
  }
  
  return await response.json();
}

/**
 * Lấy đơn hàng theo ID
 * @param {string|number} id - Đơn hàng ID
 * @returns {Promise<Object>} Dữ liệu đơn hàng
 */
export async function getDonHangById(id) {
  const response = await apiFetch(`v1/donhangs/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch order');
  }
  
  return await response.json();
}

/**
 * Lấy lịch sử mua hàng của khách hàng
 * @param {string|number} khachHangId - Khách hàng ID
 * @returns {Promise<Object>} Dữ liệu lịch sử mua hàng
 */
export async function getDonHangsByKhachHang(khachHangId) {
  const response = await apiFetch(`v1/donhangs/khachhang/${khachHangId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch customer orders');
  }
  
  return await response.json();
}

/**
 * Tạo đơn hàng mới
 * @param {Object} orderData - Dữ liệu đơn hàng
 * @returns {Promise<Object>} Đơn hàng đã tạo
 */
export async function createDonHang(orderData) {
  const response = await apiFetch('v1/donhangs', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create order');
  }
  
  return await response.json();
}

/**
 * Xóa đơn hàng
 * @param {string|number} id - Đơn hàng ID
 * @returns {Promise<void>}
 */
export async function deleteDonHang(id) {
  const response = await apiFetch(`v1/donhangs/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete order');
  }
}