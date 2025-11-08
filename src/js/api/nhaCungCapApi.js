/**
 * Nhà Cung Cấp API Service
 * Xử lý các API calls liên quan đến nhà cung cấp
 */

import { apiFetch } from './baseApi.js';

/**
 * Lấy tất cả nhà cung cấp (có phân trang)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Dữ liệu nhà cung cấp
 */
export async function getAllNhaCungCaps(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/nhacungcaps${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch suppliers');
  }
  
  return await response.json();
}

/**
 * Lấy nhà cung cấp theo ID
 * @param {string|number} id - Nhà cung cấp ID
 * @returns {Promise<Object>} Dữ liệu nhà cung cấp
 */
export async function getNhaCungCapById(id) {
  const response = await apiFetch(`v1/nhacungcaps/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch supplier');
  }
  
  return await response.json();
}

/**
 * Tạo nhà cung cấp mới
 * @param {Object} supplierData - Dữ liệu nhà cung cấp
 * @returns {Promise<Object>} Nhà cung cấp đã tạo
 */
export async function createNhaCungCap(supplierData) {
  const response = await apiFetch('v1/nhacungcaps', {
    method: 'POST',
    body: JSON.stringify(supplierData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create supplier');
  }
  
  return await response.json();
}

/**
 * Cập nhật nhà cung cấp
 * @param {string|number} id - Nhà cung cấp ID
 * @param {Object} supplierData - Dữ liệu nhà cung cấp
 * @returns {Promise<Object>} Nhà cung cấp đã cập nhật
 */
export async function updateNhaCungCap(id, supplierData) {
  const response = await apiFetch(`v1/nhacungcaps/${id}`, {
    method: 'PUT',
    body: JSON.stringify(supplierData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update supplier');
  }
  
  // PUT returns NoContent (204), so we return success
  return { success: true };
}

/**
 * Xóa nhà cung cấp (soft delete)
 * @param {string|number} id - Nhà cung cấp ID
 * @returns {Promise<void>}
 */
export async function deleteNhaCungCap(id) {
  const response = await apiFetch(`v1/nhacungcaps/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete supplier');
  }
}