import { apiFetch } from './baseApi.js';

/**
 * Lấy tất cả chi nhánh (có phân trang)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Dữ liệu chi nhánh
 */
export async function getAllChiNhanhs(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/chinhanhs${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch branches');
  }
  
  return await response.json();
}

/**
 * Lấy chi nhánh theo ID
 * @param {string|number} id - Chi nhánh ID
 * @returns {Promise<Object>} Dữ liệu chi nhánh
 */
export async function getChiNhanhById(id) {
  const response = await apiFetch(`v1/chinhanhs/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch branch');
  }
  
  return await response.json();
}

/**
 * Tạo chi nhánh mới
 * @param {Object} branchData - Dữ liệu chi nhánh
 * @returns {Promise<Object>} Chi nhánh đã tạo
 */
export async function createChiNhanh(branchData) {
  const response = await apiFetch('v1/chinhanhs', {
    method: 'POST',
    body: JSON.stringify(branchData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create branch');
  }
  
  return await response.json();
}

/**
 * Cập nhật chi nhánh
 * @param {string|number} id - Chi nhánh ID
 * @param {Object} branchData - Dữ liệu chi nhánh
 * @returns {Promise<Object>} Chi nhánh đã cập nhật
 */
export async function updateChiNhanh(id, branchData) {
  const response = await apiFetch(`v1/chinhanhs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(branchData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update branch');
  }
  
  // PUT returns NoContent (204), so we return success
  return { success: true };
}

/**
 * Xóa chi nhánh (soft delete)
 * @param {string|number} id - Chi nhánh ID
 * @returns {Promise<void>}
 */
export async function deleteChiNhanh(id) {
  const response = await apiFetch(`v1/chinhanhs/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete branch');
  }
}