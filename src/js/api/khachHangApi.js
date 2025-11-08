/**
 * Khách Hàng API Service
 * Xử lý các API calls liên quan đến khách hàng
 */

import { apiFetch } from './baseApi.js';

/**
 * Lấy tất cả khách hàng (có phân trang)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Dữ liệu khách hàng
 */
export async function getAllKhachHangs(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/khachhangs${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch customers');
  }
  
  return await response.json();
}

/**
 * Lấy khách hàng theo ID
 * @param {string|number} id - Khách hàng ID
 * @returns {Promise<Object>} Dữ liệu khách hàng
 */
export async function getKhachHangById(id) {
  const response = await apiFetch(`v1/khachhangs/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch customer');
  }
  
  return await response.json();
}

/**
 * Lấy khách hàng theo số điện thoại
 * @param {string} sdt - Số điện thoại
 * @returns {Promise<Object>} Dữ liệu khách hàng
 */
export async function getKhachHangBySdt(sdt) {
  const response = await apiFetch(`v1/khachhangs/phone/${sdt}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch customer by phone');
  }
  
  return await response.json();
}

/**
 * Tạo khách hàng mới
 * @param {Object} customerData - Dữ liệu khách hàng
 * @returns {Promise<Object>} Khách hàng đã tạo
 */
export async function createKhachHang(customerData) {
  const response = await apiFetch('v1/khachhangs', {
    method: 'POST',
    body: JSON.stringify(customerData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create customer');
  }
  
  return await response.json();
}

/**
 * Cập nhật khách hàng
 * @param {string|number} id - Khách hàng ID
 * @param {Object} customerData - Dữ liệu khách hàng
 * @returns {Promise<Object>} Khách hàng đã cập nhật
 */
export async function updateKhachHang(id, customerData) {
  const response = await apiFetch(`v1/khachhangs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(customerData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update customer');
  }
  
  // PUT returns NoContent (204), so we return success
  return { success: true };
}

/**
 * Xóa khách hàng (soft delete)
 * @param {string|number} id - Khách hàng ID
 * @returns {Promise<void>}
 */
export async function deleteKhachHang(id) {
  const response = await apiFetch(`v1/khachhangs/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete customer');
  }
}