/**
 * Kho Hàng Management Page
 * Quản lý kho hàng với cảnh báo tồn kho thấp và hạn sử dụng
 */

import { Header } from '../../components/admin/header.js';
import { Sidebar } from '../../components/admin/sidebar.js';
import { Footer } from '../../components/admin/footer.js';
import { Modal } from '../../components/admin/modal.js';
import { Table } from '../../components/admin/table.js';
import { SearchBox } from '../../components/admin/searchBox.js';
import { requireAuth } from '../../api/authApi.js';
import { 
  getAllKhoHangs, 
  getKhoHangById, 
  getTonKhoThap, 
  updateKhoHang 
} from '../../api/khoHangApi.js';
import { getAllChiNhanhs } from '../../api/chiNhanhApi.js';

// Check authentication
requireAuth();

// State
let stocks = [];
let filteredStocks = [];
let lowStockItems = [];
let branches = [];
let currentModal = null;
let currentTable = null;
let searchBox = null;
let currentPage = 1;
let pageSize = 10;
let totalCount = 0;
let currentEditingStockId = null;

// Filters
let filterChiNhanh = '';
let filterTonKho = '';
let filterHanSuDung = '';

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  initializeLayout();
  await loadBranches();
  await loadStocks();
  await loadLowStockItems();
  setupEventListeners();
});

/**
 * Initialize page layout
 */
function initializeLayout() {
  // Header
  const header = new Header({
    appTitle: 'Quản lý bán thuốc',
    logoText: 'QT',
    onMenuToggle: toggleMobileSidebar
  });

  const headerContainer = document.getElementById('header');
  if (headerContainer) {
    headerContainer.innerHTML = header.render();
    header.attachEventListeners();
  }

  // Sidebar
  const sidebar = new Sidebar({
    activeItem: 'khohang',
    menuItems: [
      {
        id: 'dashboard',
        label: 'Trang chủ',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zM3 10a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6zM14 9a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-2z"/></svg>`,
        href: '/src/pages/admin/index.html'
      },
      {
        id: 'thuoc',
        label: 'Thuốc',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zM3 10a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/></svg>`,
        href: '/src/pages/admin/thuoc.html'
      },
      {
        id: 'khohang',
        label: 'Kho hàng',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4zm8 2h3v3h-3V5zM5 5h3v3H5V5zm0 5h3v3H5v-3zm7 0h3v3h-3v-3z"/></svg>`,
        href: '/src/pages/admin/khoHang.html'
      },
      {
        id: 'lohang',
        label: 'Lô hàng',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3z"/><path d="M6 7h8v1H6V7zm0 3h8v1H6v-1z"/></svg>`,
        href: '/src/pages/admin/loHang.html'
      },
      {
        id: 'donnhaphang',
        label: 'Đơn nhập hàng',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3zm1 2h12v10H4V5z"/></svg>`,
        href: '/src/pages/admin/donNhapHang.html'
      }
    ]
  });

  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = sidebar.render();
    sidebar.attachEventListeners();
  }

  // Footer
  const footer = new Footer({
    copyrightText: '© 2024 Quản lý bán thuốc. All rights reserved.',
    versionText: 'Version 1.0.0'
  });

  const footerContainer = document.getElementById('footer');
  if (footerContainer) {
    footerContainer.innerHTML = footer.render();
    footer.attachEventListeners();
  }

  // Search Box
  searchBox = new SearchBox({
    containerId: 'search-container',
    placeholder: 'Tìm kiếm theo tên thuốc hoặc số lô...',
    onSearch: handleSearch
  });

  const searchContainer = document.getElementById('search-container');
  if (searchContainer) {
    searchContainer.innerHTML = searchBox.render();
    searchBox.attachEventListeners();
  }
}

/**
 * Load branches for filter
 */
async function loadBranches() {
  try {
    const response = await getAllChiNhanhs({ pageNumber: 1, pageSize: 1000, active: true });
    branches = response.data?.items || [];
    
    const filterSelect = document.getElementById('filter-chi-nhanh');
    if (filterSelect) {
      branches.forEach(b => {
        const option = document.createElement('option');
        option.value = b.id;
        option.textContent = b.tenChiNhanh;
        filterSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Failed to load branches:', error);
  }
}

/**
 * Load low stock items for statistics
 */
async function loadLowStockItems() {
  try {
    const response = await getTonKhoThap(filterChiNhanh || null);
    if (response.success && response.data) {
      lowStockItems = response.data || [];
      renderStatistics();
      renderAlertBanner();
    }
  } catch (error) {
    console.error('Failed to load low stock items:', error);
  }
}

/**
 * Load stocks from API
 */
async function loadStocks() {
  try {
    showLoading(true);
    
    const params = {
      pageNumber: currentPage,
      pageSize: pageSize,
    };

    if (filterChiNhanh) {
      params.idChiNhanh = filterChiNhanh;
    }

    if (filterTonKho === 'low') {
      params.tonKhoThap = true;
    }

    const response = await getAllKhoHangs(params);

    if (response.success && response.data) {
      const { items, totalCount: total, pageNumber, pageSize: size } = response.data;
      
      stocks = items || [];
      filteredStocks = applyClientSideFilters([...stocks]);
      totalCount = total || 0;
      currentPage = pageNumber || 1;
      pageSize = size || 10;
      
      renderStocksTable();
    } else {
      throw new Error(response.message || 'Không thể tải danh sách kho hàng');
    }
  } catch (error) {
    console.error('Failed to load stocks:', error);
    showNotification(error.message || 'Không thể tải danh sách kho hàng', 'error');
    
    stocks = [];
    filteredStocks = [];
    renderStocksTable();
  } finally {
    showLoading(false);
  }
}

/**
 * Apply client-side filters (expiry date)
 */
function applyClientSideFilters(items) {
  let filtered = [...items];

  // Filter by expiry date
  if (filterHanSuDung) {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    filtered = filtered.filter(item => {
      if (!item.ngayHetHan) return false;
      
      const expiryDate = parseDateOnly(item.ngayHetHan);
      
      if (filterHanSuDung === 'expired') {
        return expiryDate < today;
      } else if (filterHanSuDung === 'expiring') {
        return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
      } else if (filterHanSuDung === 'ok') {
        return expiryDate > thirtyDaysFromNow;
      }
      
      return true;
    });
  }

  return filtered;
}

/**
 * Render statistics cards
 */
function renderStatistics() {
  const container = document.getElementById('stats-container');
  if (!container) return;

  const totalItems = stocks.length;
  const lowStockCount = lowStockItems.length;
  
  // Count expiring items
  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  const expiringCount = stocks.filter(item => {
    if (!item.ngayHetHan) return false;
    const expiryDate = parseDateOnly(item.ngayHetHan);
    return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
  }).length;

  const expiredCount = stocks.filter(item => {
    if (!item.ngayHetHan) return false;
    const expiryDate = parseDateOnly(item.ngayHetHan);
    return expiryDate < today;
  }).length;

  const totalValue = stocks.reduce((sum, item) => {
    return sum + ((item.soLuongTon || 0) * 1000); // Estimate value
  }, 0);

  container.innerHTML = `
    <div class="stat-card stat-card--info">
      <div class="stat-header">
        <div class="stat-icon stat-icon--info">📦</div>
        <div class="stat-info">
          <div class="stat-label">Tổng mặt hàng</div>
          <div class="stat-value">${totalItems.toLocaleString('vi-VN')}</div>
        </div>
      </div>
      <div class="stat-footer">Tổng số mặt hàng trong kho</div>
    </div>

    <div class="stat-card stat-card--critical">
      <div class="stat-header">
        <div class="stat-icon stat-icon--critical">🚨</div>
        <div class="stat-info">
          <div class="stat-label">Tồn kho thấp</div>
          <div class="stat-value">${lowStockCount.toLocaleString('vi-VN')}</div>
        </div>
      </div>
      <div class="stat-footer">Cần nhập hàng bổ sung</div>
    </div>

    <div class="stat-card stat-card--warning">
      <div class="stat-header">
        <div class="stat-icon stat-icon--warning">⏰</div>
        <div class="stat-info">
          <div class="stat-label">Sắp hết hạn</div>
          <div class="stat-value">${expiringCount.toLocaleString('vi-VN')}</div>
        </div>
      </div>
      <div class="stat-footer">Còn dưới 30 ngày</div>
    </div>

    <div class="stat-card ${expiredCount > 0 ? 'stat-card--critical' : 'stat-card--success'}">
      <div class="stat-header">
        <div class="stat-icon ${expiredCount > 0 ? 'stat-icon--critical' : 'stat-icon--success'}">${expiredCount > 0 ? '🚫' : '✅'}</div>
        <div class="stat-info">
          <div class="stat-label">Đã hết hạn</div>
          <div class="stat-value">${expiredCount.toLocaleString('vi-VN')}</div>
        </div>
      </div>
      <div class="stat-footer">Cần xử lý ngay</div>
    </div>
  `;
}

/**
 * Render alert banner
 */
function renderAlertBanner() {
  const container = document.getElementById('alert-banner-container');
  if (!container) return;

  const criticalCount = lowStockItems.filter(item => {
    const percentage = (item.soLuongTon || 0) / (item.tonKhoToiThieu || 1);
    return percentage < 0.3; // Less than 30% of minimum
  }).length;

  if (criticalCount > 0) {
    container.innerHTML = `
      <div class="alert-banner alert-banner--danger">
        <div class="alert-icon">🚨</div>
        <div class="alert-content">
          <div class="alert-title">Cảnh báo nghiêm trọng!</div>
          <div class="alert-message">
            Có <strong>${criticalCount}</strong> mặt hàng ở mức tồn kho cực thấp (dưới 30% mức tối thiểu). 
            Vui lòng nhập hàng ngay!
          </div>
        </div>
      </div>
    `;
  } else if (lowStockItems.length > 0) {
    container.innerHTML = `
      <div class="alert-banner alert-banner--warning">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <div class="alert-title">Cảnh báo tồn kho thấp</div>
          <div class="alert-message">
            Có <strong>${lowStockItems.length}</strong> mặt hàng dưới mức tồn kho tối thiểu. 
            Cân nhắc nhập hàng bổ sung.
          </div>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = '';
  }
}

/**
 * Render stocks table
 */
function renderStocksTable() {
  currentTable = new Table({
    containerId: 'table-container',
    columns: [
      { 
        field: 'id', 
        label: 'ID',
        render: (value) => `<strong>#${value}</strong>`
      },
      { 
        field: 'tenThuoc', 
        label: 'Tên thuốc',
        render: (value) => `<span style="font-weight: 600; color: #1e293b;">💊 ${value || 'N/A'}</span>`
      },
      { 
        field: 'soLo', 
        label: 'Số lô',
        render: (value) => value ? `<span style="color: #2563eb; font-family: monospace;">${value}</span>` : '-'
      },
      { 
        field: 'tenChiNhanh', 
        label: 'Chi nhánh',
        render: (value) => value || '-'
      },
      { 
        field: 'soLuongTon', 
        label: 'Tồn kho',
        render: (value, row) => renderStockLevel(value, row.tonKhoToiThieu)
      },
      { 
        field: 'tonKhoToiThieu', 
        label: 'Tối thiểu',
        render: (value) => `<span style="color: #64748b;">${value || 0}</span>`
      },
      { 
        field: 'ngayHetHan', 
        label: 'Hạn sử dụng',
        render: (value) => renderExpiryDate(value)
      },
      { 
        field: 'ngayCapNhat', 
        label: 'Cập nhật',
        render: (value) => formatDate(value)
      },
      {
        field: 'actions',
        label: 'Hành động',
        render: (value, row) => `
          <div class="actions">
            <button class="btn btn-secondary btn-sm" onclick="window.updateStock(${row.id})" title="Cập nhật">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l.1.1a1.75 1.75 0 0 1 0 2.475l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25a1.75 1.75 0 0 1 .445-.758l8.61-8.61z"/>
              </svg>
              Cập nhật
            </button>
          </div>
        `
      }
    ],
    data: filteredStocks,
    itemsPerPage: pageSize,
    showPagination: false,
    emptyMessage: 'Không tìm thấy dữ liệu kho hàng'
  });

  currentTable.render();
  renderPagination();
}

/**
 * Render stock level with badge
 */
function renderStockLevel(current, minimum) {
  const qty = current || 0;
  const min = minimum || 10;
  const percentage = qty / min;

  let badge = '';
  if (percentage < 0.3) {
    badge = `<span class="stock-badge stock-badge--critical">🚨 ${qty}</span>`;
  } else if (percentage < 1) {
    badge = `<span class="stock-badge stock-badge--low">⚠️ ${qty}</span>`;
  } else if (percentage < 2) {
    badge = `<span class="stock-badge stock-badge--normal">✅ ${qty}</span>`;
  } else {
    badge = `<span class="stock-badge stock-badge--high">📦 ${qty}</span>`;
  }

  return badge;
}

/**
 * Render expiry date with warning
 */
function renderExpiryDate(dateValue) {
  if (!dateValue) return '-';

  const expiryDate = parseDateOnly(dateValue);
  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const formatted = formatDate(dateValue);

  if (expiryDate < today) {
    return `<span class="expiry-warning expiry-warning--expired">🚫 ${formatted}</span>`;
  } else if (expiryDate <= thirtyDaysFromNow) {
    return `<span class="expiry-warning expiry-warning--soon">⏰ ${formatted}</span>`;
  } else {
    return `<span class="expiry-warning expiry-warning--ok">✅ ${formatted}</span>`;
  }
}

/**
 * Parse DateOnly object to Date
 */
function parseDateOnly(dateValue) {
  if (typeof dateValue === 'string') {
    return new Date(dateValue);
  }
  if (dateValue.year && dateValue.month && dateValue.day) {
    return new Date(dateValue.year, dateValue.month - 1, dateValue.day);
  }
  return new Date(dateValue);
}

/**
 * Format date
 */
function formatDate(dateValue) {
  if (!dateValue) return '-';
  
  try {
    const date = parseDateOnly(dateValue);
    return date.toLocaleDateString('vi-VN');
  } catch (error) {
    return '-';
  }
}

/**
 * Render pagination
 */
function renderPagination() {
  const container = document.getElementById('table-container');
  if (!container) return;

  const totalPages = Math.ceil(totalCount / pageSize);
  
  if (totalPages <= 1) return;

  let paginationHTML = `
    <div class="pagination">
      <button class="page-btn" onclick="window.goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M8.5 3.5L5 7l3.5 3.5"/>
        </svg>
      </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      paginationHTML += `
        <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.goToPage(${i})">
          ${i}
        </button>
      `;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      paginationHTML += `<span style="padding: 0 4px; color: #94a3b8;">...</span>`;
    }
  }

  paginationHTML += `
      <button class="page-btn" onclick="window.goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M5.5 3.5L9 7l-3.5 3.5"/>
        </svg>
      </button>
    </div>
    <div style="text-align: center; color: #64748b; font-size: 14px; padding-bottom: 20px; margin-top: 16px;">
      Hiển thị ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalCount)} trong tổng số ${totalCount} kho hàng
    </div>
  `;

  container.insertAdjacentHTML('beforeend', paginationHTML);
}

/**
 * Go to page
 */
window.goToPage = async function(page) {
  const totalPages = Math.ceil(totalCount / pageSize);
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  await loadStocks();
};

/**
 * Handle search
 */
async function handleSearch(query) {
  currentPage = 1;
  await loadStocks();
}

/**
 * Handle filter changes
 */
function handleFilterChange() {
  filterChiNhanh = document.getElementById('filter-chi-nhanh')?.value || '';
  filterTonKho = document.getElementById('filter-ton-kho')?.value || '';
  filterHanSuDung = document.getElementById('filter-han-su-dung')?.value || '';
  
  currentPage = 1;
  loadStocks();
  loadLowStockItems();
}

/**
 * Update stock
 */
window.updateStock = async function(stockId) {
  try {
    const response = await getKhoHangById(stockId);
    
    if (!response.success || !response.data) {
      throw new Error('Không thể tải thông tin kho hàng');
    }

    const stock = response.data;
    currentEditingStockId = stockId;
    
    const template = document.getElementById('stock-update-form-template');
    const formContent = template.content.cloneNode(true);
    
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(formContent);
    
    currentModal = new Modal({
      id: 'stock-modal',
      title: '📦 Cập nhật kho hàng',
      content: tempDiv.innerHTML,
      size: 'medium'
    });

    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) {
      modalRoot.innerHTML = currentModal.render();
      currentModal.attachEventListeners();
      currentModal.open();
      
      setupFormEventListeners();
      fillFormData(stock);
    }
  } catch (error) {
    console.error('Failed to load stock:', error);
    showNotification(error.message || 'Không thể tải thông tin kho hàng', 'error');
  }
};

/**
 * Fill form with stock data
 */
function fillFormData(stock) {
  document.getElementById('detail-chi-nhanh').textContent = stock.tenChiNhanh || '-';
  document.getElementById('detail-thuoc').textContent = stock.tenThuoc || '-';
  document.getElementById('detail-so-lo').textContent = stock.soLo || '-';
  document.getElementById('detail-han-su-dung').textContent = formatDate(stock.ngayHetHan);
  
  document.getElementById('tonKhoToiThieu').value = stock.tonKhoToiThieu || 10;
  document.getElementById('soLuongTon').value = stock.soLuongTon || 0;
}

/**
 * Setup form event listeners
 */
function setupFormEventListeners() {
  const form = document.getElementById('stock-update-form');
  const cancelBtn = document.getElementById('cancel-btn');
  const soLuongTonInput = document.getElementById('soLuongTon');
  const quantityWarning = document.getElementById('quantity-warning');
  
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }

  if (soLuongTonInput && quantityWarning) {
    soLuongTonInput.addEventListener('input', () => {
      quantityWarning.classList.add('show');
    });
  }
}

/**
 * Handle form submit
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {
    tonKhoToiThieu: parseInt(formData.get('tonKhoToiThieu')),
    soLuongTon: parseInt(formData.get('soLuongTon'))
  };
  
  if (!validateForm(data)) {
    return;
  }
  
  setFormLoading(true);
  
  try {
    const response = await updateKhoHang(currentEditingStockId, data);
    
    if (response.success || response) {
      closeModal();
      showNotification('✅ Cập nhật kho hàng thành công', 'success');
      await loadStocks();
      await loadLowStockItems();
    } else {
      throw new Error(response.message || 'Không thể cập nhật kho hàng');
    }
  } catch (error) {
    console.error('Form submission error:', error);
    showNotification(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.', 'error');
  } finally {
    setFormLoading(false);
  }
}

/**
 * Validate form
 */
function validateForm(data) {
  if (isNaN(data.tonKhoToiThieu) || data.tonKhoToiThieu < 0) {
    showNotification('❌ Tồn kho tối thiểu phải là số không âm', 'error');
    return false;
  }

  if (isNaN(data.soLuongTon) || data.soLuongTon < 0) {
    showNotification('❌ Số lượng tồn phải là số không âm', 'error');
    return false;
  }

  return true;
}

/**
 * Set form loading state
 */
function setFormLoading(isLoading) {
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn?.querySelector('.btn-text');
  const btnLoading = submitBtn?.querySelector('.btn-loading');
  const inputs = document.querySelectorAll('#stock-update-form input');

  if (isLoading) {
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'inline-flex';
    inputs.forEach(input => input.disabled = true);
  } else {
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnLoading) btnLoading.style.display = 'none';
    inputs.forEach(input => input.disabled = false);
  }
}

/**
 * Close modal
 */
function closeModal() {
  if (currentModal) {
    currentModal.close();
    currentModal = null;
  }
  currentEditingStockId = null;
}

/**
 * Toggle mobile sidebar
 */
function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (sidebar) {
    sidebar.classList.toggle('mobile-open');
  }
  if (overlay) {
    overlay.classList.toggle('active');
  }
}

/**
 * Refresh data
 */
async function handleRefresh() {
  await loadStocks();
  await loadLowStockItems();
  showNotification('✅ Dữ liệu đã được làm mới', 'success');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', toggleMobileSidebar);
  }

  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', handleRefresh);
  }

  // Filter listeners
  const filterChiNhanhSelect = document.getElementById('filter-chi-nhanh');
  const filterTonKhoSelect = document.getElementById('filter-ton-kho');
  const filterHanSuDungSelect = document.getElementById('filter-han-su-dung');

  if (filterChiNhanhSelect) {
    filterChiNhanhSelect.addEventListener('change', handleFilterChange);
  }

  if (filterTonKhoSelect) {
    filterTonKhoSelect.addEventListener('change', handleFilterChange);
  }

  if (filterHanSuDungSelect) {
    filterHanSuDungSelect.addEventListener('change', handleFilterChange);
  }
}

/**
 * Show loading
 */
function showLoading(show) {
  const tableContainer = document.getElementById('table-container');
  if (!tableContainer) return;

  if (show) {
    tableContainer.style.opacity = '0.5';
    tableContainer.style.pointerEvents = 'none';
  } else {
    tableContainer.style.opacity = '1';
    tableContainer.style.pointerEvents = 'auto';
  }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  // Simple alert for now - can be replaced with toast notification
  alert(message);
}