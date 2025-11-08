import { apiFetch } from "./baseApi.js";

/**
 * Get all roles (with pagination)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Roles data
 */
export async function getAllVaiTros(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/vaitros${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch roles');
  }
  
  return await response.json();
}

/**
 * Get all active roles (for dropdown)
 * @returns {Promise<Object>} Active roles data
 */
export async function getAllActiveVaiTros() {
  const response = await apiFetch('v1/vaitros/active');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch active roles');
  }
  
  return await response.json();
}

/**
 * Get role by ID
 * @param {string|number} id - Role ID
 * @returns {Promise<Object>} Role data
 */
export async function getVaiTroById(id) {
  const response = await apiFetch(`v1/vaitros/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch role');
  }
  
  return await response.json();
}

/**
 * Create new role
 * @param {Object} roleData - Role data
 * @returns {Promise<Object>} Created role
 */
export async function createVaiTro(roleData) {
  const response = await apiFetch('v1/vaitros', {
    method: 'POST',
    body: JSON.stringify(roleData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create role');
  }
  
  return await response.json();
}

/**
 * Update role
 * @param {string|number} id - Role ID
 * @param {Object} roleData - Role data
 * @returns {Promise<Object>} Updated role
 */
export async function updateVaiTro(id, roleData) {
  const response = await apiFetch(`v1/vaitros/${id}`, {
    method: 'PUT',
    body: JSON.stringify(roleData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update role');
  }
  
  // PUT returns NoContent (204), so we return success
  return { success: true };
}

/**
 * Delete role (soft delete)
 * @param {string|number} id - Role ID
 * @returns {Promise<void>}
 */
export async function deleteVaiTro(id) {
  const response = await apiFetch(`v1/vaitros/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete role');
  }
}