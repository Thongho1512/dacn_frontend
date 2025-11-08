import { apiFetch } from "./baseApi.js";

/**
 * Lấy tất cả danh mục
 * @returns {Promise<Object>} Dữ liệu danh mục
 */
export async function getAllDanhMucs() {
  const response = await apiFetch('v1/danhmucs');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch categories');
  }
  return await response.json();
}

/**
 * Lấy danh mục theo ID
 * @param {string|number} id 
 * @returns {Promise<Object>}
 */
export async function getDanhMucById(id) {
  const response = await apiFetch(`v1/danhmucs/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch category');
  }
  return await response.json();
}

/**
 * Tạo mới danh mục
 * @param {Object} categoryData 
 * @returns {Promise<Object>}
 */
export async function createDanhMuc(categoryData) {
  const response = await apiFetch('v1/danhmucs', {
    method: 'POST',
    body: JSON.stringify(categoryData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create category');
  }
  return await response.json();
}

/**
 * Cập nhật danh mục
 * @param {string|number} id 
 * @param {Object} categoryData 
 */
export async function updateDanhMuc(id, categoryData) {
  const response = await apiFetch(`v1/danhmucs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update category');
  }
  return { success: true };
}

/**
 * Xóa danh mục
 * @param {string|number} id 
 */
export async function deleteDanhMuc(id) {
  const response = await apiFetch(`v1/danhmucs/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete category');
  }
}
