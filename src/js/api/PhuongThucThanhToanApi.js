/**
 * Phương Thức Thanh Toán API Service
 */

import { apiFetch } from './baseApi.js';

/**
 * Lấy tất cả phương thức thanh toán
 * @returns {Promise<Object>} Dữ liệu phương thức thanh toán
 */
export async function getAllPhuongThucThanhToans() {
  const response = await apiFetch('v1/phuongthucthanhtoan');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch payment methods');
  }
  
  return await response.json();
}