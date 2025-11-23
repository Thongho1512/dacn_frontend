/**
 * Lô Hàng Management Page
 * Quản lý lô hàng với cảnh báo hạn sử dụng
 */

import { Header } from '../../components/admin/header.js';
import { Sidebar } from '../../components/admin/sidebar.js';
import { Footer } from '../../components/admin/footer.js';
import { Modal } from '../../components/admin/modal.js';
import { Table } from '../../components/admin/table.js';
import { SearchBox } from '../../components/admin/searchBox.js';
import { requireAuth } from '../../api/authApi.js';
import { 
  getAllLoHangs, 
  getLoHangById, 
  getLoHangSapHetHan,
  getLoHangByThuocId,
  updateLoHang,
  createLoHang,
  deleteLoHang
} from '../../api/loHangApi.js';
import { getAllChiNhanhs } from '../../api/chiNhanhApi.js';
import { getAllThuoc } from '../../api/thuocApi.js';

// Check authentication
requireAuth();

// State
let batches = [];
let filteredBatches = [];
let expiringBatches = [];
let branches = [];
let medicines = [];
let currentModal = null;
let currentTable = null;
let searchBox = null;
let currentPage = 1;
let pageSize = 10;
let totalCount = 0;
let currentEditingBatchId = null;

// Filters
let filterChiNhanh = '';
let filterThuoc = '';
let filterHanSuDung = '';
let filterDays = 30;

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  initializeLayout();
  await loadBranches();
  await loadMedicines();
  await loadBatches();
  await loadExpiringBatches();
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
    activeItem: 'lohang'
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
    placeholder: 'Tìm kiếm theo số lô hoặc tên thuốc...',
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
 * Load medicines for filter
 */
async function loadMedicines() {
  try {
    const response = await getAllThuoc({ pageNumber: 1, pageSize: 1000, active: true });
    medicines = response.data?.items || [];
    
    const filterSelect = document.getElementById('filter-thuoc');
    if (filterSelect) {
      medicines.forEach(m => {
        const option = document.createElement('option');
        option.value = m.id;
        option.textContent = m.tenThuoc;
        filterSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Failed to load medicines:', error);
  }
}

/**
 * Load expiring batches for statistics
 */
async function loadExpiringBatches() {
  try {
    const response = await getLoHangSapHetHan(filterDays, filterChiNhanh || null);
    if (response.success && response.data) {
      expiringBatches = response.data || [];
      renderStatistics();
      renderAlertBanner();
    }
  } catch (error) {
    console.error('Failed to load expiring batches:', error);
  }
}

/**
 * Load batches from API
 */
async function loadBatches() {
  try {
    showLoading(true);
    
    const params = {
      pageNumber: currentPage,
      pageSize: pageSize,
    };

    if (filterChiNhanh) {
      params.idChiNhanh = filterChiNhanh;
    }

    if (filterThuoc) {
      params.idThuoc = filterThuoc;
    }

    if (filterHanSuDung === 'expiring') {
      params.sapHetHan = true;
      params.daysToExpire = filterDays;
    }

    const response = await getAllLoHangs(params);

    if (response.success && response.data) {
      const { items, totalCount: total, pageNumber, pageSize: size } = response.data;
      
      batches = items || [];
      filteredBatches = applyClientSideFilters([...batches]);
      totalCount = total || 0;
      currentPage = pageNumber || 1;
      pageSize = size || 10;
      
      renderBatchesTable();
    } else {
      throw new Error(response.message || 'Không thể tải danh sách lô hàng');
    }
  } catch (error) {
    console.error('Failed to load batches:', error);
    showNotification(error.message || 'Không thể tải danh sách lô hàng', 'error');
    
    batches = [];
    filteredBatches = [];
    renderBatchesTable();
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
    today.setHours(0, 0, 0, 0);

    filtered = filtered.filter(item => {
      if (!item.ngayHetHan) return false;
      
      const expiryDate = parseDateOnly(item.ngayHetHan);
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      if (filterHanSuDung === 'expired') {
        return daysUntilExpiry < 0;
      } else if (filterHanSuDung === 'expiring') {
        return daysUntilExpiry >= 0 && daysUntilExpiry <= filterDays;
      } else if (filterHanSuDung === 'ok') {
        return daysUntilExpiry > filterDays;
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

  const totalBatches = batches.length;
  
  // Count expired and expiring
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiredCount = batches.filter(item => {
    if (!item.ngayHetHan) return false;
    const expiryDate = parseDateOnly(item.ngayHetHan);
    return expiryDate < today;
  }).length;

  const expiringCount = expiringBatches.length;

  const okCount = totalBatches - expiredCount - expiringCount;

  container.innerHTML = `
    <div class="stat-card stat-card--info">
      <div class="stat-header">
        <div class="stat-icon stat-icon--info">📦</div>
        <div class="stat-info">
          <div class="stat-label">Tổng lô hàng</div>
          <div class="stat-value">${totalBatches.toLocaleString('vi-VN')}</div>
        </div>
      </div>
      <div class="stat-footer">Tổng số lô hàng trong hệ thống</div>
    </div>

    <div class="stat-card ${expiredCount > 0 ? 'stat-card--critical' : 'stat-card--success'}">
      <div class="stat-header">
        <div class="stat-icon ${expiredCount > 0 ? 'stat-icon--critical' : 'stat-icon--success'}">${expiredCount > 0 ? '🚫' : '✅'}</div>
        <div class="stat-info">
          <div class="stat-label">Đã hết hạn</div>
          <div class="stat-value">${expiredCount.toLocaleString('vi-VN')}</div>
        </div>
      </div>
      <div class="stat-footer">Cần xử lý ngay lập tức</div>
    </div>

    <div class="stat-card stat-card--warning">
      <div class="stat-header">
        <div class="stat-icon stat-icon--warning">⏰</div>
        <div class="stat-info">
          <div class="stat-label">Sắp hết hạn</div>
          <div class="stat-value">${expiringCount.toLocaleString('vi-VN')}</div>
        </div>
      </div>
      <div class="stat-footer">Còn dưới ${filterDays} ngày</div>
    </div>

    <div class="stat-card stat-card--success">
      <div class="stat-header">
        <div class="stat-icon stat-icon--success">✅</div>
        <div class="stat-info">
          <div class="stat-label">Còn hạn dài</div>
          <div class="stat-value">${okCount.toLocaleString('vi-VN')}</div>
        </div>
      </div>
      <div class="stat-footer">Hạn sử dụng còn tốt</div>
    </div>
  `;
}

/**
 * Render alert banner
 */
function renderAlertBanner() {
  const container = document.getElementById('alert-banner-container');
  if (!container) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiredCount = batches.filter(item => {
    if (!item.ngayHetHan) return false;
    const expiryDate = parseDateOnly(item.ngayHetHan);
    return expiryDate < today;
  }).length;

  if (expiredCount > 0) {
    container.innerHTML = `
      <div class="alert-banner alert-banner--danger">
        <div class="alert-icon">🚫</div>
        <div class="alert-content">
          <div class="alert-title">Cảnh báo nghiêm trọng!</div>
          <div class="alert-message">
            Có <strong>${expiredCount}</strong> lô hàng đã hết hạn sử dụng. 
            Vui lòng kiểm tra và xử lý ngay!
          </div>
        </div>
      </div>
    `;
  } else if (expiringBatches.length > 0) {
    container.innerHTML = `
      <div class="alert-banner alert-banner--warning">
        <div class="alert-icon">⏰</div>
        <div class="alert-content">
          <div class="alert-title">Cảnh báo sắp hết hạn</div>
          <div class="alert-message">
            Có <strong>${expiringBatches.length}</strong> lô hàng sẽ hết hạn trong vòng ${filterDays} ngày tới. 
            Cần ưu tiên bán trước.
          </div>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="alert-banner alert-banner--info">
        <div class="alert-icon">✅</div>
        <div class="alert-content">
          <div class="alert-title">Tình trạng tốt</div>
          <div class="alert-message">
            Tất cả lô hàng đều còn hạn sử dụng tốt. Không có lô nào sắp hết hạn.
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Render batches table
 */
function renderBatchesTable() {
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
        render: (value) => value ? `<span style="color: #2563eb; font-family: monospace; font-weight: 600;">${value}</span>` : '-'
      },
      { 
        field: 'ngaySanXuat', 
        label: 'Ngày sản xuất',
        render: (value) => formatDate(value)
      },
      { 
        field: 'ngayHetHan', 
        label: 'Ngày hết hạn',
        render: (value) => renderExpiryDate(value)
      },
      { 
        field: 'soLuong', 
        label: 'Số lượng',
        render: (value) => `<span style="font-weight: 600; color: #16a34a;">${value || 0}</span>`
      },
      { 
        field: 'giaNhap', 
        label: 'Giá nhập',
        render: (value) => `<span style="color: #7c3aed; font-weight: 600;">${formatCurrency(value)}</span>`
      },
      { 
        field: 'soDonNhap', 
        label: 'Số đơn nhập',
        render: (value) => value ? `<span style="color: #64748b; font-size: 13px;">📄 ${value}</span>` : '-'
      },
      {
        field: 'actions',
        label: 'Hành động',
        render: (value, row) => `
          <div class="actions">
            <button class="btn btn-secondary btn-sm" onclick="window.updateBatch(${row.id})" title="Cập nhật">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l.1.1a1.75 1.75 0 0 1 0 2.475l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25a1.75 1.75 0 0 1 .445-.758l8.61-8.61z"/>
              </svg>
              Sửa
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.deleteBatch(${row.id})" title="Xóa">
              🗑️ Xóa
            </button>
          </div>
        `
      }
    ],
    data: filteredBatches,
    itemsPerPage: pageSize,
    showPagination: false,
    emptyMessage: 'Không tìm thấy lô hàng'
  });

  currentTable.render();
  renderPagination();
}

/**
 * Render expiry date with warning badge
 */
function renderExpiryDate(dateValue) {
  if (!dateValue) return '-';

  const expiryDate = parseDateOnly(dateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  const formatted = formatDate(dateValue);

  let badge = '';
  let daysText = '';

  if (daysUntilExpiry < 0) {
    const daysExpired = Math.abs(daysUntilExpiry);
    badge = `<span class="expiry-badge expiry-badge--expired">🚫 ${formatted}`;
    daysText = `<span class="days-remaining">Đã hết hạn ${daysExpired} ngày</span>`;
  } else if (daysUntilExpiry <= filterDays) {
    badge = `<span class="expiry-badge expiry-badge--expiring">⏰ ${formatted}`;
    daysText = `<span class="days-remaining">Còn ${daysUntilExpiry} ngày</span>`;
  } else {
    badge = `<span class="expiry-badge expiry-badge--ok">✅ ${formatted}`;
    daysText = `<span class="days-remaining">Còn ${daysUntilExpiry} ngày</span>`;
  }

  return `${badge}${daysText}</span>`;
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
 * Format currency
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value || 0);
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
      Hiển thị ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalCount)} trong tổng số ${totalCount} lô hàng
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
  await loadBatches();
};

/**
 * Handle search
 */
async function handleSearch(query) {
  currentPage = 1;
  await loadBatches();
}

/**
 * Handle filter changes
 */
function handleFilterChange() {
  filterChiNhanh = document.getElementById('filter-chi-nhanh')?.value || '';
  filterThuoc = document.getElementById('filter-thuoc')?.value || '';
  filterHanSuDung = document.getElementById('filter-han-su-dung')?.value || '';
  
  const daysInput = document.getElementById('filter-days');
  if (daysInput) {
    const days = parseInt(daysInput.value);
    if (!isNaN(days) && days > 0 && days <= 365) {
      filterDays = days;
    }
  }
  
  currentPage = 1;
  loadBatches();
  loadExpiringBatches();
}

/**
 * Update batch
 */
window.updateBatch = async function(batchId) {
  try {
    const response = await getLoHangById(batchId);
    
    if (!response.success || !response.data) {
      throw new Error('Không thể tải thông tin lô hàng');
    }

    const batch = response.data;
    currentEditingBatchId = batchId;
    
    const template = document.getElementById('batch-update-form-template');
    const formContent = template.content.cloneNode(true);
    
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(formContent);
    
    currentModal = new Modal({
      id: 'batch-modal',
      title: '📦 Cập nhật lô hàng',
      content: tempDiv.innerHTML,
      size: 'medium'
    });

    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) {
      modalRoot.innerHTML = currentModal.render();
      currentModal.attachEventListeners();
      currentModal.open();
      
      setupFormEventListeners();
      fillFormData(batch);
    }
  } catch (error) {
    console.error('Failed to load batch:', error);
    showNotification(error.message || 'Không thể tải thông tin lô hàng', 'error');
  }
};

/**
 * Fill form with batch data
 */
function fillFormData(batch) {
  document.getElementById('detail-thuoc').textContent = batch.tenThuoc || '-';
  document.getElementById('detail-chi-nhanh').textContent = 'Xem trong kho hàng';
  document.getElementById('detail-so-don-nhap').textContent = batch.soDonNhap || '-';
  document.getElementById('detail-ton-kho').textContent = 'Xem trong kho hàng';
  
  document.getElementById('soLo').value = batch.soLo || '';
  document.getElementById('ngaySanXuat').value = formatDateForInput(batch.ngaySanXuat);
  document.getElementById('ngayHetHan').value = formatDateForInput(batch.ngayHetHan);
  document.getElementById('soLuong').value = batch.soLuong || 0;
  document.getElementById('giaNhap').value = batch.giaNhap || 0;
}

/**
 * Format date for input field
 */
function formatDateForInput(dateValue) {
  if (!dateValue) return '';
  
  try {
    const date = parseDateOnly(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    return '';
  }
}

/**
 * Setup form event listeners
 */
function setupFormEventListeners() {
  const form = document.getElementById('batch-update-form');
  const cancelBtn = document.getElementById('cancel-btn');
  const ngaySanXuatInput = document.getElementById('ngaySanXuat');
  const ngayHetHanInput = document.getElementById('ngayHetHan');
  const dateValidation = document.getElementById('date-validation');
  const dateValidationMessage = document.getElementById('date-validation-message');
  
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }

  // Date validation
  const validateDates = () => {
    const ngaySanXuat = new Date(ngaySanXuatInput.value);
    const ngayHetHan = new Date(ngayHetHanInput.value);
    
    if (ngaySanXuatInput.value && ngayHetHanInput.value) {
      if (ngayHetHan <= ngaySanXuat) {
        dateValidation.style.display = 'block';
        dateValidationMessage.textContent = 'Ngày hết hạn phải sau ngày sản xuất!';
        ngayHetHanInput.setCustomValidity('Ngày hết hạn phải sau ngày sản xuất');
      } else {
        const diffTime = Math.abs(ngayHetHan - ngaySanXuat);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) {
          dateValidation.style.display = 'block';
          dateValidationMessage.textContent = `Khoảng cách chỉ ${diffDays} ngày. Đảm bảo thông tin chính xác.`;
          ngayHetHanInput.setCustomValidity('');
        } else {
          dateValidation.style.display = 'none';
          ngayHetHanInput.setCustomValidity('');
        }
      }
    }
  };

  if (ngaySanXuatInput) {
    ngaySanXuatInput.addEventListener('change', validateDates);
  }
  
  if (ngayHetHanInput) {
    ngayHetHanInput.addEventListener('change', validateDates);
  }
}

/**
 * Handle form submit
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {
    soLo: formData.get('soLo').trim(),
    ngaySanXuat: formData.get('ngaySanXuat'),
    ngayHetHan: formData.get('ngayHetHan'),
    soLuong: parseInt(formData.get('soLuong')),
    giaNhap: parseFloat(formData.get('giaNhap'))
  };
  
  if (!validateForm(data)) {
    return;
  }
  
  setFormLoading(true);
  
  try {
    const response = await updateLoHang(currentEditingBatchId, data);
    
    if (response.success || response) {
      closeModal();
      showNotification('✅ Cập nhật lô hàng thành công', 'success');
      await loadBatches();
      await loadExpiringBatches();
    } else {
      throw new Error(response.message || 'Không thể cập nhật lô hàng');
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
  if (!data.soLo || data.soLo.length < 3) {
    showNotification('❌ Số lô phải có ít nhất 3 ký tự', 'error');
    return false;
  }

  if (!data.ngaySanXuat) {
    showNotification('❌ Vui lòng nhập ngày sản xuất', 'error');
    return false;
  }

  if (!data.ngayHetHan) {
    showNotification('❌ Vui lòng nhập ngày hết hạn', 'error');
    return false;
  }

  const ngaySanXuat = new Date(data.ngaySanXuat);
  const ngayHetHan = new Date(data.ngayHetHan);

  if (ngayHetHan <= ngaySanXuat) {
    showNotification('❌ Ngày hết hạn phải sau ngày sản xuất', 'error');
    return false;
  }

  if (isNaN(data.soLuong) || data.soLuong < 1) {
    showNotification('❌ Số lượng phải lớn hơn 0', 'error');
    return false;
  }

  if (isNaN(data.giaNhap) || data.giaNhap < 0) {
    showNotification('❌ Giá nhập không thể âm', 'error');
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
  const inputs = document.querySelectorAll('#batch-update-form input');

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
  currentEditingBatchId = null;
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
  await loadBatches();
  await loadExpiringBatches();
  showNotification('✅ Dữ liệu đã được làm mới', 'success');
}

/**
 * Open add batch modal
 */
async function openAddBatchModal() {
  await Promise.all([
    loadBranches(),
    loadMedicines()
  ]);

  const content = `
    <div style="padding: 20px;">
      <form id="add-batch-form">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px;">
          <div>
            <label for="batchChiNhanh" style="display: block; margin-bottom: 8px; font-weight: 600;">Chi nhánh:</label>
            <select id="batchChiNhanh" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
              <option value="">-- Chọn chi nhánh --</option>
              ${branches.map(b => `<option value="${b.id}">${b.tenChiNhanh}</option>`).join('')}
            </select>
          </div>
          
          <div>
            <label for="batchThuoc" style="display: block; margin-bottom: 8px; font-weight: 600;">Thuốc:</label>
            <select id="batchThuoc" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
              <option value="">-- Chọn thuốc --</option>
              ${medicines.map(m => `<option value="${m.id}">${m.tenThuoc}</option>`).join('')}
            </select>
          </div>
          
          <div>
            <label for="batchSoLo" style="display: block; margin-bottom: 8px; font-weight: 600;">Số lô:</label>
            <input type="text" id="batchSoLo" required placeholder="Nhập số lô" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;" />
          </div>
          
          <div>
            <label for="batchSoLuong" style="display: block; margin-bottom: 8px; font-weight: 600;">Số lượng:</label>
            <input type="number" id="batchSoLuong" required min="1" value="1" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;" />
          </div>
          
          <div>
            <label for="batchMfg" style="display: block; margin-bottom: 8px; font-weight: 600;">Ngày sản xuất:</label>
            <input type="date" id="batchMfg" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;" />
          </div>
          
          <div>
            <label for="batchExp" style="display: block; margin-bottom: 8px; font-weight: 600;">Ngày hết hạn:</label>
            <input type="date" id="batchExp" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;" />
          </div>
          
          <div>
            <label for="batchPrice" style="display: block; margin-bottom: 8px; font-weight: 600;">Giá nhập:</label>
            <input type="number" id="batchPrice" required min="0" step="1000" value="0" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;" />
          </div>
        </div>
        
        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <button type="submit" id="batch-submit" class="btn btn-primary" style="flex: 1;">
            <span class="btn-text">✅ Tạo lô hàng</span>
            <span class="btn-loading" style="display: none;"><span class="spinner"></span> Đang xử lý...</span>
          </button>
          <button type="button" id="batch-cancel" class="btn btn-secondary" style="flex: 1;">Hủy</button>
        </div>
      </form>
    </div>
  `;

  const modal = new Modal({
    id: 'add-batch-modal',
    title: '✨ Tạo lô hàng thủ công',
    content,
    size: 'medium'
  });

  document.getElementById('modal-root').innerHTML = modal.render();
  modal.attachEventListeners();
  modal.open();

  const form = document.getElementById('add-batch-form');
  const cancelBtn = document.getElementById('batch-cancel');
  const mfgInput = document.getElementById('batchMfg');
  const expInput = document.getElementById('batchExp');

  form.addEventListener('submit', handleAddBatchSubmit);
  cancelBtn.addEventListener('click', () => modal.close());

  // Date validation
  mfgInput.addEventListener('change', () => {
    if (mfgInput.value && expInput.value) {
      const mfg = new Date(mfgInput.value);
      const exp = new Date(expInput.value);
      if (exp <= mfg) {
        showNotification('❌ Ngày hết hạn phải sau ngày sản xuất', 'error');
        expInput.value = '';
      }
    }
  });

  expInput.addEventListener('change', () => {
    if (mfgInput.value && expInput.value) {
      const mfg = new Date(mfgInput.value);
      const exp = new Date(expInput.value);
      if (exp <= mfg) {
        showNotification('❌ Ngày hết hạn phải sau ngày sản xuất', 'error');
        expInput.value = '';
      }
    }
  });
}

/**
 * Handle add batch form submit
 */
async function handleAddBatchSubmit(e) {
  e.preventDefault();

  const chiNhanhId = parseInt(document.getElementById('batchChiNhanh').value);
  const thuocId = parseInt(document.getElementById('batchThuoc').value);
  const soLo = document.getElementById('batchSoLo').value;
  const soLuong = parseInt(document.getElementById('batchSoLuong').value);
  const ngaySanXuat = document.getElementById('batchMfg').value;
  const ngayHetHan = document.getElementById('batchExp').value;
  const giaNhap = parseFloat(document.getElementById('batchPrice').value);

  if (!chiNhanhId || !thuocId || !soLo || soLuong < 1 || !ngaySanXuat || !ngayHetHan || giaNhap < 0) {
    showNotification('❌ Vui lòng điền đầy đủ thông tin', 'error');
    return;
  }

  const submitBtn = document.getElementById('batch-submit');
  submitBtn.disabled = true;
  submitBtn.querySelector('.btn-text').style.display = 'none';
  submitBtn.querySelector('.btn-loading').style.display = 'inline-flex';

  try {
    const data = {
      idthuoc: thuocId,
      soLo: soLo,
      ngaySanXuat: ngaySanXuat,
      ngayHetHan: ngayHetHan,
      soLuong: soLuong,
      giaNhap: giaNhap
    };

    const response = await createLoHang(data, chiNhanhId);
    
    if (response.success || response.data) {
      document.getElementById('add-batch-modal').closest('.modal').parentElement.innerHTML = '';
      showNotification('✅ Tạo lô hàng thủ công thành công!', 'success');
      await loadBatches();
      await loadExpiringBatches();
    }
  } catch (error) {
    showNotification(error.message || 'Không thể tạo lô hàng', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').style.display = 'inline';
    submitBtn.querySelector('.btn-loading').style.display = 'none';
  }
}

/**
 * Delete batch
 */
window.deleteBatch = async function(batchId) {
  if (!confirm('🗑️ Bạn có chắc chắn muốn xóa lô hàng này?')) return;

  try {
    showLoading(true);
    await deleteLoHang(batchId);
    showNotification('✅ Xóa lô hàng thành công', 'success');
    await loadBatches();
    await loadExpiringBatches();
  } catch (error) {
    showNotification(error.message || 'Không thể xóa lô hàng', 'error');
  } finally {
    showLoading(false);
  }
};

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

  const addBatchBtn = document.getElementById('add-batch-btn');
  if (addBatchBtn) {
    addBatchBtn.addEventListener('click', openAddBatchModal);
  }

  // Filter listeners
  const filterChiNhanhSelect = document.getElementById('filter-chi-nhanh');
  const filterThuocSelect = document.getElementById('filter-thuoc');
  const filterHanSuDungSelect = document.getElementById('filter-han-su-dung');
  const filterDaysInput = document.getElementById('filter-days');

  if (filterChiNhanhSelect) {
    filterChiNhanhSelect.addEventListener('change', handleFilterChange);
  }

  if (filterThuocSelect) {
    filterThuocSelect.addEventListener('change', handleFilterChange);
  }

  if (filterHanSuDungSelect) {
    filterHanSuDungSelect.addEventListener('change', handleFilterChange);
  }

  if (filterDaysInput) {
    filterDaysInput.addEventListener('change', handleFilterChange);
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
  alert(message);
}