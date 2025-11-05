import { apiFetch } from "./baseApi.js";

/**
 * Get all users
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Users data
 */
export async function getAllUsers(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/nguoidungs${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch users');
  }
  
  return await response.json();
}

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} User data
 */
export async function getUserById(id) {
  const response = await apiFetch(`v1/nguoidungs/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch user');
  }
  
  return await response.json();
}

/**
 * Create new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
export async function createUser(userData) {
  const response = await apiFetch('v1/nguoidungs', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create user');
  }
  
  return await response.json();
}

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Updated user
 */
export async function updateUser(id, userData) {
  const response = await apiFetch(`v1/nguoidungs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user');
  }
  
  return await response.json();
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {Promise<void>}
 */
export async function deleteUser(id) {
  const response = await apiFetch(`v1/nguoidungs/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete user');
  }
}