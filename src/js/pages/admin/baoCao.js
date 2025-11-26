/**
 * Báo Cáo Management Page
 * Trang báo cáo và thống kê với biểu đồ
 */

import { Header } from '../../components/admin/header.js';
import { Sidebar } from '../../components/admin/sidebar.js';
import { Footer } from '../../components/admin/footer.js';
import { requireAuth } from '../../api/authApi.js';
import {
  getBaoCaoDoanhThuTheoThang,
  getBaoCaoDoanhThuTheoNgay,
  getThongKeDashboard,
  getBaoCaoTheoNhanVien,
  exportBaoCaoDoanhThuTheoThang
} from '../../api/baoCaoApi.js';
import { getAllChiNhanhs } from '../../api/chiNhanhApi.js';

requireAuth();

// State
let branches = [];
let charts = {};

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  initializeLayout();
  await loadBranches();
  initializeFilters();
  await loadAllReports();
  setupEventListeners();
});

function initializeLayout() {
  const header = new Header({ appTitle: 'Quản lý bán thuốc', logoText: 'QT', onMenuToggle: toggleMobileSidebar });
  document.getElementById('header').innerHTML = header.render();
  header.attachEventListeners();

  const sidebar = new Sidebar({
    activeItem: 'baoCao'
  });
  document.getElementById('sidebar-container').innerHTML = sidebar.render();
  sidebar.attachEventListeners();

  const footer = new Footer({ copyrightText: '© 2024 Quản lý bán thuốc.' });
  document.getElementById('footer').innerHTML = footer.render();
}

async function loadBranches() {
  try {
    const response = await getAllChiNhanhs({ pageNumber: 1, pageSize: 1000, active: true });
    branches = response.data?.items || [];
    populateBranchFilters();
  } catch (error) {
    console.error('Failed to load branches:', error);
  }
}

function populateBranchFilters() {
  const selects = [
    'dashboard-branch-filter',
    'monthly-branch-filter',
    'daily-branch-filter',
    'employee-branch-filter'
  ];

  selects.forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    
    branches.forEach(b => {
      const option = document.createElement('option');
      option.value = b.id;
      option.textContent = b.tenChiNhanh;
      select.appendChild(option);
    });
  });
}

function initializeFilters() {
  const currentYear = new Date().getFullYear();
  const yearSelect = document.getElementById('monthly-year-filter');
  
  for (let year = currentYear; year >= currentYear - 5; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    if (year === currentYear) option.selected = true;
    yearSelect.appendChild(option);
  }

  const monthSelect = document.getElementById('monthly-month-filter');
  for (let month = 1; month <= 12; month++) {
    const option = document.createElement('option');
    option.value = month;
    option.textContent = `Tháng ${month}`;
    monthSelect.appendChild(option);
  }

  // Set default dates for daily/employee filters
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const dateFields = [
    { from: 'daily-from-date', to: 'daily-to-date' },
    { from: 'employee-from-date', to: 'employee-to-date' }
  ];

  dateFields.forEach(({ from, to }) => {
    document.getElementById(from).valueAsDate = firstDayOfMonth;
    document.getElementById(to).valueAsDate = today;
  });
}

async function loadAllReports() {
  await Promise.all([
    loadDashboard(),
    loadMonthlyRevenue(),
    loadDailyRevenue(),
    loadEmployeePerformance()
  ]);
}

// ============================================
// DASHBOARD
// ============================================
async function loadDashboard() {
  try {
    showLoading('dashboard-stats');
    const branchId = document.getElementById('dashboard-branch-filter').value;
    const params = branchId ? { idChiNhanh: branchId } : {};
    
    const response = await getThongKeDashboard(params);
    
    if (response.success && response.data) {
      renderDashboardStats(response.data);
    }
  } catch (error) {
    console.error('Failed to load dashboard:', error);
    showError('dashboard-stats', 'Không thể tải dữ liệu dashboard');
  }
}

function renderDashboardStats(data) {
  const container = document.getElementById('dashboard-stats');
  
  const stats = [
    {
      icon: '💰',
      label: 'Doanh thu hôm nay',
      value: formatCurrency(data.doanhThuHomNay),
      type: 'success'
    },
    {
      icon: '📦',
      label: 'Đơn hàng hôm nay',
      value: data.soDonHangHomNay.toLocaleString('vi-VN'),
      type: 'primary'
    },
    {
      icon: '💵',
      label: 'Doanh thu tháng này',
      value: formatCurrency(data.doanhThuThangNay),
      type: 'success'
    },
    {
      icon: '🛒',
      label: 'Đơn hàng tháng này',
      value: data.soDonHangThangNay.toLocaleString('vi-VN'),
      type: 'primary'
    },
    {
      icon: '👥',
      label: 'Tổng khách hàng',
      value: data.tongKhachHang.toLocaleString('vi-VN'),
      type: 'primary'
    },
    {
      icon: '⚠️',
      label: 'Thuốc tồn kho thấp',
      value: data.soThuocTonKhoThap.toLocaleString('vi-VN'),
      type: 'warning'
    },
    {
      icon: '⏰',
      label: 'Thuốc sắp hết hạn',
      value: data.soThuocSapHetHan.toLocaleString('vi-VN'),
      type: 'danger'
    },
    {
      icon: '📊',
      label: 'Giá trị tồn kho',
      value: formatCurrency(data.giaTriTonKho),
      type: 'primary'
    }
  ];

  container.innerHTML = stats.map(stat => `
    <div class="stat-card ${stat.type}">
      <div class="stat-icon">${stat.icon}</div>
      <div class="stat-label">${stat.label}</div>
      <div class="stat-value">${stat.value}</div>
    </div>
  `).join('');
}

// ============================================
// DOANH THU THEO THÁNG
// ============================================
async function loadMonthlyRevenue() {
  try {
    showChartLoading('monthly-chart-container');
    
    const year = document.getElementById('monthly-year-filter').value;
    const month = document.getElementById('monthly-month-filter').value;
    const branchId = document.getElementById('monthly-branch-filter').value;
    
    const params = { nam: year };
    if (month) params.thang = month;
    if (branchId) params.idChiNhanh = branchId;
    
    const response = await getBaoCaoDoanhThuTheoThang(params);
    
    if (response.success && response.data) {
      renderMonthlyChart(response.data);
    }
  } catch (error) {
    console.error('Failed to load monthly revenue:', error);
    showChartError('monthly-chart-container');
  }
}

function renderMonthlyChart(data) {
  hideChartLoading('monthly-chart-container');
  
  if (data.length === 0) {
    showEmptyChart('monthly-chart-container');
    return;
  }

  const ctx = document.getElementById('monthly-revenue-chart');
  
  if (charts.monthly) {
    charts.monthly.destroy();
  }

  const labels = data.map(d => `Tháng ${d.thang}`);
  const revenues = data.map(d => d.tongDoanhThu);

  charts.monthly = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Doanh thu (VNĐ)',
        data: revenues,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => formatCurrency(context.parsed.y)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => formatCurrency(value, true)
          }
        }
      }
    }
  });
}
// ============================================
// DOANH THU THEO NGÀY
// ============================================
async function loadDailyRevenue() {
  try {
    showChartLoading('daily-chart-container');
    
    const fromDate = document.getElementById('daily-from-date').value;
    const toDate = document.getElementById('daily-to-date').value;
    const branchId = document.getElementById('daily-branch-filter').value;
    
    if (!fromDate || !toDate) {
      showError('daily-chart-container', 'Vui lòng chọn khoảng thời gian');
      return;
    }
    
    const params = { tuNgay: fromDate, denNgay: toDate };
    if (branchId) params.idChiNhanh = branchId;
    
    const response = await getBaoCaoDoanhThuTheoNgay(params);
    
    if (response.success && response.data) {
      renderDailyChart(response.data);
    }
  } catch (error) {
    console.error('Failed to load daily revenue:', error);
    showChartError('daily-chart-container');
  }
}

function renderDailyChart(data) {
  hideChartLoading('daily-chart-container');
  
  if (data.length === 0) {
    showEmptyChart('daily-chart-container');
    return;
  }

  const ctx = document.getElementById('daily-revenue-chart');
  
  if (charts.daily) {
    charts.daily.destroy();
  }

  const labels = data.map(d => formatDate(d.ngay));
  const revenues = data.map(d => d.tongDoanhThu);

  charts.daily = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Doanh thu (VNĐ)',
        data: revenues,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => formatCurrency(context.parsed.y)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => formatCurrency(value, true)
          }
        }
      }
    }
  });
}

// ============================================
// HIỆU SUẤT NHÂN VIÊN
// ============================================
async function loadEmployeePerformance() {
  try {
    showLoading('employee-table-container');
    
    const fromDate = document.getElementById('employee-from-date').value;
    const toDate = document.getElementById('employee-to-date').value;
    const branchId = document.getElementById('employee-branch-filter').value;
    
    if (!fromDate || !toDate) {
      showError('employee-table-container', 'Vui lòng chọn khoảng thời gian');
      return;
    }
    
    const params = { tuNgay: fromDate, denNgay: toDate };
    if (branchId) params.idChiNhanh = branchId;
    
    const response = await getBaoCaoTheoNhanVien(params);
    
    if (response.success && response.data) {
      renderEmployeeTable(response.data);
      renderEmployeeChart(response.data);
    }
  } catch (error) {
    console.error('Failed to load employee performance:', error);
    showError('employee-table-container', 'Không thể tải dữ liệu');
  }
}

function renderEmployeeTable(data) {
  const container = document.getElementById('employee-table-container');
  
  if (data.length === 0) {
    container.innerHTML = '<div class="empty-chart"><p>Không có dữ liệu</p></div>';
    return;
  }

  const tableHTML = `
    <table class="report-table">
      <thead>
        <tr>
          <th>STT</th>
          <th>Nhân viên</th>
          <th>Chi nhánh</th>
          <th>Số đơn hàng</th>
          <th>Tổng số lượng bán</th>
          <th>Tổng doanh thu</th>
          <th>Đơn hàng TB</th>
          <th>Đơn lớn nhất</th>
        </tr>
      </thead>
      <tbody>
        ${data.map((emp, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${emp.tenNhanVien}</strong></td>
            <td>${emp.tenChiNhanh || 'N/A'}</td>
            <td>${emp.soDonHang}</td>
            <td>${emp.tongSoLuongBan}</td>
            <td><strong style="color:#10b981">${formatCurrency(emp.tongDoanhThu)}</strong></td>
            <td>${formatCurrency(emp.doanhThuTrungBinh)}</td>
            <td>${formatCurrency(emp.donHangLonNhat)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = tableHTML;
}

function renderEmployeeChart(data) {
  if (data.length === 0) return;

  const ctx = document.getElementById('employee-performance-chart');
  
  if (charts.employee) {
    charts.employee.destroy();
  }

  const labels = data.map(d => d.tenNhanVien);
  const revenues = data.map(d => d.tongDoanhThu);

  charts.employee = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Doanh thu (VNĐ)',
        data: revenues,
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 2
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => formatCurrency(context.parsed.x)
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: (value) => formatCurrency(value, true)
          }
        }
      }
    }
  });
}

// ============================================
// EXPORT
// ============================================
async function handleExport() {
  try {
    const year = document.getElementById('monthly-year-filter').value;
    const month = document.getElementById('monthly-month-filter').value;
    const branchId = document.getElementById('monthly-branch-filter').value;
    
    const params = { nam: year, format: 'excel' };
    if (month) params.thang = month;
    if (branchId) params.idChiNhanh = branchId;
    
    const response = await exportBaoCaoDoanhThuTheoThang(params);
    
    alert('📥 Tính năng xuất báo cáo đang được phát triển.\n\n' + 
          'Backend chưa implement export Excel/PDF.\n' +
          'Hiện tại chỉ trả về dữ liệu JSON.');
    
    console.log('Export data:', response);
  } catch (error) {
    alert('❌ Không thể xuất báo cáo: ' + error.message);
  }
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
  document.getElementById('dashboard-branch-filter')?.addEventListener('change', loadDashboard);
  document.getElementById('apply-monthly-filter')?.addEventListener('click', loadMonthlyRevenue);
  document.getElementById('apply-daily-filter')?.addEventListener('click', loadDailyRevenue);
  document.getElementById('apply-employee-filter')?.addEventListener('click', loadEmployeePerformance);
  document.getElementById('export-monthly-btn')?.addEventListener('click', handleExport);
  document.getElementById('sidebar-overlay')?.addEventListener('click', toggleMobileSidebar);
}

// ============================================
// HELPERS
// ============================================
function toggleMobileSidebar() {
  document.getElementById('sidebar-container')?.classList.toggle('mobile-open');
  document.getElementById('sidebar-overlay')?.classList.toggle('active');
}

function showChartLoading(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const existing = container.querySelector('.loading-overlay');
  if (existing) return;
  
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.innerHTML = '<div class="spinner"></div>';
  container.appendChild(overlay);
}

function hideChartLoading(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const overlay = container.querySelector('.loading-overlay');
  if (overlay) overlay.remove();
}

function showChartError(containerId) {
  hideChartLoading(containerId);
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<div class="empty-chart"><p>❌ Lỗi tải dữ liệu</p></div>';
}

function showEmptyChart(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<div class="empty-chart"><p>📊 Không có dữ liệu</p></div>';
}

function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.style.opacity = '0.5';
  container.style.pointerEvents = 'none';
}

function showError(containerId, message) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<div class="empty-chart"><p>❌ ${message}</p></div>`;
}

function formatCurrency(value, short = false) {
  if (!value) return '0 ₫';
  if (short && value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M ₫';
  }
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatDate(dateObj) {
  if (!dateObj) return '-';
  if (typeof dateObj === 'string') return dateObj;
  if (dateObj.year && dateObj.month && dateObj.day) {
    return `${dateObj.day}/${dateObj.month}/${dateObj.year}`;
  }
  return '-';
}