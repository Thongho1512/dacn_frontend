/**
 * Báo Cáo API Service
 * Xử lý các API calls liên quan đến báo cáo và thống kê
 */

import { apiFetch } from './baseApi.js';

/**
 * Lấy báo cáo doanh thu theo tháng
 * @param {Object} params - Query parameters (nam, thang?, idChiNhanh?)
 * @returns {Promise<Object>} Dữ liệu báo cáo
 */
export async function getBaoCaoDoanhThuTheoThang(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/baocao/doanh-thu/thang${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch monthly revenue report');
  }
  
  return await response.json();
}

/**
 * Lấy báo cáo doanh thu theo ngày
 * @param {Object} params - Query parameters (tuNgay, denNgay, idChiNhanh?)
 * @returns {Promise<Object>} Dữ liệu báo cáo
 */
export async function getBaoCaoDoanhThuTheoNgay(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/baocao/doanh-thu/ngay${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch daily revenue report');
  }
  
  return await response.json();
}

/**
 * Lấy top thuốc bán chạy
 * @param {Object} params - Query parameters (top?, tuNgay?, denNgay?, idChiNhanh?)
 * @returns {Promise<Object>} Dữ liệu báo cáo
 */
export async function getTopThuocBanChay(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/baocao/thuoc-ban-chay${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch best-selling medicines');
  }
  
  return await response.json();
}

/**
 * Lấy thống kê dashboard
 * @param {Object} params - Query parameters (idChiNhanh?)
 * @returns {Promise<Object>} Dữ liệu dashboard
 */
export async function getThongKeDashboard(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/baocao/dashboard${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch dashboard statistics');
  }
  
  return await response.json();
}

/**
 * Lấy báo cáo hiệu suất nhân viên
 * @param {Object} params - Query parameters (tuNgay, denNgay, idChiNhanh?)
 * @returns {Promise<Object>} Dữ liệu báo cáo
 */
export async function getBaoCaoTheoNhanVien(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/baocao/nhan-vien${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch employee performance report');
  }
  
  return await response.json();
}

/**
 * Xuất báo cáo doanh thu theo tháng
 * @param {Object} params - Query parameters (nam, thang?, idChiNhanh?, format)
 * @returns {Promise<Blob>} File báo cáo
 */
export async function exportBaoCaoDoanhThuTheoThang(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `v1/baocao/xuat/doanh-thu-thang${queryString ? '?' + queryString : ''}`;
  
  const response = await apiFetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to export report');
  }
  
  // Note: Backend chưa implement, trả về JSON thay vì file
  return await response.json();
}