import { apiFetch } from "./baseApi.js";

/**
 * Get all medicines
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Medicines data
 */
export async function getAllThuoc(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/thuocs${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch medicines');
  }
  
  return await response.json();
}

export async function getThuocByChiNhanh(idChiNhanh, params = {}){
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/thuocs/by-branch/${idChiNhanh}${queryString ? '?' + queryString : ''}`;
  const response = await apiFetch(url);

  if(!response.ok){
    const error = await response.json();
    throw new Error(error.message || 'Lấy danh sách thuốc thất bại.');
  }

  return await response.json();
}

/**
 * Get medicine by ID
 * @param {string} id - Medicine ID
 * @returns {Promise<Object>} Medicine data
 */
export async function getThuocById(id) {
  const response = await apiFetch(`v1/thuocs/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch medicine');
  }
  
  return await response.json();
}

/**
 * Create new medicine
 * @param {Object} thuocData - Medicine data
 * @returns {Promise<Object>} Created medicine
 */
export async function createThuoc(thuocData) {
  const response = await apiFetch('v1/thuocs', {
    method: 'POST',
    body: JSON.stringify(thuocData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create medicine');
  }
  
  return await response.json();
}

/**
 * Update medicine
 * @param {string} id - Medicine ID
 * @param {Object} thuocData - Medicine data
 * @returns {Promise<Object>} Updated medicine
 */
export async function updateThuoc(id, thuocData) {
  const response = await apiFetch(`v1/thuocs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(thuocData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update medicine');
  }
  
  return await response.json();
}

/**
 * Delete medicine (soft delete)
 * @param {string} id - Medicine ID
 * @returns {Promise<void>}
 */
export async function deleteThuoc(id) {
  const response = await apiFetch(`v1/thuocs/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete medicine');
  }
}

/**
 * Get medicines expiring soon
 * @param {number} days - Number of days threshold
 * @param {number} idChiNhanh - Branch ID (optional)
 * @returns {Promise<Object>} Expiring medicines
 */
export async function getThuocSapHetHan(days = 30, idChiNhanh = null) {
  const params = { days };
  if (idChiNhanh) params.idChiNhanh = idChiNhanh;
  
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/thuocs/expiring-soon${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch expiring medicines');
  }
  
  return await response.json();
}

/**
 * Get medicines with low stock
 * @param {number} idChiNhanh - Branch ID (optional)
 * @returns {Promise<Object>} Low stock medicines
 */
export async function getThuocTonKhoThap(idChiNhanh = null) {
  const params = {};
  if (idChiNhanh) params.idChiNhanh = idChiNhanh;
  
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/thuocs/low-stock${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch low stock medicines');
  }
  
  return await response.json();
}