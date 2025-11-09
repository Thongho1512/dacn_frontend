/**
 * Khách Hàng Management Page
 * Quản lý khách hàng - Đầy đủ chức năng CRUD
 */

import { Header } from '../../components/admin/header.js';
import { Sidebar } from '../../components/admin/sidebar.js';
import { Footer } from '../../components/admin/footer.js';
import { Modal } from '../../components/admin/modal.js';
import { Table } from '../../components/admin/table.js';
import { SearchBox } from '../../components/admin/searchBox.js';
import { requireAuth } from '../../api/authApi.js';
import { 
  getAllKhachHangs, 
  createKhachHang, 
  updateKhachHang, 
  deleteKhachHang 
} from '../../api/khachHangApi.js';
import { formatDate } from '../../utils/helpers.js';

// Check authentication
requireAuth();

// State
let customers = [];
let filteredCustomers = [];
let currentModal = null;
let currentTable = null;
let searchBox = null;
let currentPage = 1;
let pageSize = 10;
let totalCount = 0;
let currentEditingCustomerId = null;

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  initializeLayout();
  await loadCustomers();
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
  const sidebar = new Sidebar({ activeItem: 'khachhang' });

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
    placeholder: 'Tìm kiếm theo tên hoặc số điện thoại khách hàng...',
    onSearch: handleSearch
  });

  const searchContainer = document.getElementById('search-container');
  if (searchContainer) {
    searchContainer.innerHTML = searchBox.render();
    searchBox.attachEventListeners();
  }
}

/**
 * Load customers from API
 */
async function loadCustomers() {
  try {
    showLoading(true);
    
    const searchTerm = searchBox?.getValue() || '';
    
    const params = {
      pageNumber: currentPage,
      pageSize: pageSize,
      active: true,
    };

    if (searchTerm && searchTerm.length > 0) {
      params.searchTerm = searchTerm;
    }

    const response = await getAllKhachHangs(params);

    if (response.success && response.data) {
      const { items, totalCount: total, pageNumber, pageSize: size } = response.data;
      
      customers = items || [];
      filteredCustomers = [...customers];
      totalCount = total || 0;
      currentPage = pageNumber || 1;
      pageSize = size || 10;
      
      renderCustomersTable();
    } else {
      throw new Error(response.message || 'Không thể tải danh sách khách hàng');
    }
  } catch (error) {
    console.error('Failed to load customers:', error);
    showNotification(error.message || 'Không thể tải danh sách khách hàng', 'error');
    
    customers = [];
    filteredCustomers = [];
    renderCustomersTable();
  } finally {
    showLoading(false);
  }
}

/**
 * Render customers table
 */
function renderCustomersTable() {
  currentTable = new Table({
    containerId: 'table-container',
    columns: [
      { 
        field: 'id', 
        label: 'ID',
        render: (value) => `<strong>#${value}</strong>`
      },
      { 
        field: 'tenKhachHang', 
        label: 'Tên khách hàng',
        render: (value) => `<span style="font-weight: 600; color: #1e293b;">👤 ${value || 'N/A'}</span>`
      },
      { 
        field: 'sdt', 
        label: 'Số điện thoại',
        render: (value) => {
          if (!value) return '<span style="color: #94a3b8;">Chưa cập nhật</span>';
          return `<span style="color: #2563eb; font-family: monospace;">📱 ${value}</span>`;
        }
      },
      { 
        field: 'diemTichLuy', 
        label: 'Điểm tích lũy',
        render: (value) => {
          const points = value || 0;
          let color = '#64748b';
          let icon = '⭐';
          
          if (points >= 1000) {
            color = '#f59e0b';
            icon = '🌟';
          } else if (points >= 500) {
            color = '#3b82f6';
            icon = '💎';
          }
          
          return `<span style="color: ${color}; font-weight: 600;">${icon} ${points} điểm</span>`;
        }
      },
      { 
        field: 'ngayDangKy', 
        label: 'Ngày đăng ký',
        render: (value) => {
          if (!value) return '<span style="color: #94a3b8;">-</span>';
          return `<span style="color: #64748b;">📅 ${formatDate(value, 'short')}</span>`;
        }
      },
      { 
        field: 'trangThai', 
        label: 'Trạng thái',
        render: (value) => {
          if (value === true) {
            return '<span class="role-badge" style="background: #d1fae5; color: #065f46;">🟢 Hoạt động</span>';
          } else {
            return '<span class="role-badge" style="background: #fee2e2; color: #991b1b;">🔴 Ngừng</span>';
          }
        }
      },
      {
        field: 'actions',
        label: 'Hành động',
        render: (value, row) => `
          <div class="actions">
            <button class="btn btn-secondary btn-sm" onclick="window.editCustomer(${row.id})" title="Chỉnh sửa">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l.1.1a1.75 1.75 0 0 1 0 2.475l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25a1.75 1.75 0 0 1 .445-.758l8.61-8.61z"/>
              </svg>
              Sửa
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.deleteCustomer(${row.id})" title="Xóa">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M5.5 1a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zM3 3.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM4.118 4h5.764l-.459 6.882a.5.5 0 0 1-.498.468H5.075a.5.5 0 0 1-.498-.468L4.118 4z"/>
              </svg>
              Xóa
            </button>
          </div>
        `
      }
    ],
    data: filteredCustomers,
    itemsPerPage: pageSize,
    showPagination: false,
    emptyMessage: 'Không tìm thấy khách hàng'
  });

  currentTable.render();
  renderPagination();
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
      Hiển thị ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalCount)} trong tổng số ${totalCount} khách hàng
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
  await loadCustomers();
};

/**
 * Handle search
 */
async function handleSearch(query) {
  currentPage = 1;
  await loadCustomers();
}

/**
 * Open add customer modal
 */
function openAddCustomerModal() {
  currentEditingCustomerId = null;
  
  const template = document.getElementById('customer-form-template');
  const formContent = template.content.cloneNode(true);
  
  const tempDiv = document.createElement('div');
  tempDiv.appendChild(formContent);
  
  currentModal = new Modal({
    id: 'customer-modal',
    title: '➕ Thêm khách hàng mới',
    content: tempDiv.innerHTML,
    size: 'medium'
  });

  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = currentModal.render();
    currentModal.attachEventListeners();
    currentModal.open();
    
    setupFormEventListeners();
  }
}

/**
 * Edit customer
 */
window.editCustomer = function(customerId) {
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return;

  currentEditingCustomerId = customerId;
  
  const template = document.getElementById('customer-form-template');
  const formContent = template.content.cloneNode(true);
  
  const tempDiv = document.createElement('div');
  tempDiv.appendChild(formContent);
  
  currentModal = new Modal({
    id: 'customer-modal',
    title: '✏️ Chỉnh sửa khách hàng',
    content: tempDiv.innerHTML,
    size: 'medium'
  });

  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = currentModal.render();
    currentModal.attachEventListeners();
    currentModal.open();
    
    setupFormEventListeners();
    fillFormData(customer);
  }
};

/**
 * Fill form with customer data
 */
function fillFormData(customer) {
  document.getElementById('tenKhachHang').value = customer.tenKhachHang || '';
  document.getElementById('sdt').value = customer.sdt || '';
  document.getElementById('diemTichLuy').value = customer.diemTichLuy || 0;
  document.getElementById('trangThai').value = customer.trangThai ? 'true' : 'false';
  
  // Disable điểm tích lũy khi sửa (không cho phép sửa trực tiếp)
  if (currentEditingCustomerId) {
    const diemInput = document.getElementById('diemTichLuy');
    if (diemInput) {
      diemInput.disabled = true;
      diemInput.style.backgroundColor = '#f1f5f9';
      diemInput.style.cursor = 'not-allowed';
    }
  }
}

/**
 * Setup form event listeners
 */
function setupFormEventListeners() {
  const form = document.getElementById('customer-form');
  const cancelBtn = document.getElementById('cancel-btn');
  
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }
}

/**
 * Handle form submit
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {};
  
  for (const [key, value] of formData.entries()) {
    if (key === 'trangThai') {
      data[key] = value === 'true';
    } else if (key === 'diemTichLuy') {
      data[key] = parseInt(value) || 0;
    } else {
      data[key] = value.trim();
    }
  }
  
  if (!validateForm(data)) {
    return;
  }
  
  setFormLoading(true);
  
  try {
    let response;
    
    if (currentEditingCustomerId) {
      await updateKhachHang(currentEditingCustomerId, data);
      response = { success: true };
    } else {
      response = await createKhachHang(data);
    }
    
    if (response.success || response) {
      closeModal();
      showNotification(
        currentEditingCustomerId ? '✅ Cập nhật khách hàng thành công' : '✅ Tạo khách hàng thành công',
        'success'
      );
      await loadCustomers();
    } else {
      throw new Error(response.message || 'Không thể lưu khách hàng');
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
  if (!data.tenKhachHang || data.tenKhachHang.length < 2) {
    showNotification('❌ Tên khách hàng phải có ít nhất 2 ký tự', 'error');
    return false;
  }

  const phoneRegex = /^[0-9]{10,11}$/;
  if (!data.sdt || !phoneRegex.test(data.sdt)) {
    showNotification('❌ Số điện thoại phải có 10-11 chữ số', 'error');
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
  const inputs = document.querySelectorAll('#customer-form input, #customer-form select');

  if (isLoading) {
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'inline-flex';
    inputs.forEach(input => {
      if (!input.disabled) input.disabled = true;
    });
  } else {
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnLoading) btnLoading.style.display = 'none';
    inputs.forEach(input => {
      if (input.id !== 'diemTichLuy' || !currentEditingCustomerId) {
        input.disabled = false;
      }
    });
  }
}

/**
 * Delete customer
 */
window.deleteCustomer = async function(customerId) {
  const customer = customers.find(c => c.id === customerId);
  
  if (!customer) return;
  
  if (!confirm(`🗑️ Bạn có chắc chắn muốn xóa khách hàng "${customer.tenKhachHang}"?\n\n⚠️ Lưu ý: Khách hàng sẽ bị vô hiệu hóa và không thể tạo đơn hàng mới.`)) {
    return;
  }

  try {
    showLoading(true);
    await deleteKhachHang(customerId);
    
    showNotification('✅ Xóa khách hàng thành công', 'success');
    await loadCustomers();
  } catch (error) {
    console.error('Failed to delete customer:', error);
    showNotification(error.message || 'Không thể xóa khách hàng', 'error');
  } finally {
    showLoading(false);
  }
};

/**
 * Close modal
 */
function closeModal() {
  if (currentModal) {
    currentModal.close();
    currentModal = null;
  }
  currentEditingCustomerId = null;
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
 * Setup event listeners
 */
function setupEventListeners() {
  const addCustomerBtn = document.getElementById('add-customer-btn');
  if (addCustomerBtn) {
    addCustomerBtn.addEventListener('click', openAddCustomerModal);
  }

  const sidebarOverlay = document.getElementById('sidebar-overlay');
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', toggleMobileSidebar);
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