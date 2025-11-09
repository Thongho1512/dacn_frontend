/**
 * Nhà Cung Cấp Management Page
 * Quản lý nhà cung cấp - Đầy đủ chức năng CRUD
 */

import { Header } from '../../components/admin/header.js';
import { Sidebar } from '../../components/admin/sidebar.js';
import { Footer } from '../../components/admin/footer.js';
import { Modal } from '../../components/admin/modal.js';
import { Table } from '../../components/admin/table.js';
import { SearchBox } from '../../components/admin/searchBox.js';
import { requireAuth } from '../../api/authApi.js';
import { 
  getAllNhaCungCaps, 
  createNhaCungCap, 
  updateNhaCungCap, 
  deleteNhaCungCap 
} from '../api/nhaCungCapApi.js';

// Check authentication
requireAuth();

// State
let suppliers = [];
let filteredSuppliers = [];
let currentModal = null;
let currentTable = null;
let searchBox = null;
let currentPage = 1;
let pageSize = 10;
let totalCount = 0;
let currentEditingSupplierId = null;

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  initializeLayout();
  await loadSuppliers();
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
    activeItem: 'nhacungcap'
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
    placeholder: 'Tìm kiếm theo tên, SĐT hoặc email nhà cung cấp...',
    onSearch: handleSearch
  });

  const searchContainer = document.getElementById('search-container');
  if (searchContainer) {
    searchContainer.innerHTML = searchBox.render();
    searchBox.attachEventListeners();
  }
}

/**
 * Load suppliers from API
 */
async function loadSuppliers() {
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

    const response = await getAllNhaCungCaps(params);

    if (response.success && response.data) {
      const { items, totalCount: total, pageNumber, pageSize: size } = response.data;
      
      suppliers = items || [];
      filteredSuppliers = [...suppliers];
      totalCount = total || 0;
      currentPage = pageNumber || 1;
      pageSize = size || 10;
      
      renderSuppliersTable();
    } else {
      throw new Error(response.message || 'Không thể tải danh sách nhà cung cấp');
    }
  } catch (error) {
    console.error('Failed to load suppliers:', error);
    showNotification(error.message || 'Không thể tải danh sách nhà cung cấp', 'error');
    
    suppliers = [];
    filteredSuppliers = [];
    renderSuppliersTable();
  } finally {
    showLoading(false);
  }
}

/**
 * Render suppliers table
 */
function renderSuppliersTable() {
  currentTable = new Table({
    containerId: 'table-container',
    columns: [
      { 
        field: 'id', 
        label: 'ID',
        render: (value) => `<strong>#${value}</strong>`
      },
      { 
        field: 'tenNhaCungCap', 
        label: 'Tên nhà cung cấp',
        render: (value) => `<span style="font-weight: 600; color: #1e293b;">🏭 ${value || 'N/A'}</span>`
      },
      { 
        field: 'sdt', 
        label: 'Số điện thoại',
        render: (value) => {
          if (!value) return '<span style="color: #94a3b8;">Chưa cập nhật</span>';
          return `<span style="color: #2563eb;">📞 ${value}</span>`;
        }
      },
      { 
        field: 'email', 
        label: 'Email',
        render: (value) => {
          if (!value) return '<span style="color: #94a3b8;">Chưa cập nhật</span>';
          const truncated = value.length > 30 ? value.substring(0, 30) + '...' : value;
          return `<span style="color: #7c3aed;" title="${value}">✉️ ${truncated}</span>`;
        }
      },
      { 
        field: 'diaChi', 
        label: 'Địa chỉ',
        render: (value) => {
          if (!value) return '<span style="color: #94a3b8;">Chưa cập nhật</span>';
          const truncated = value.length > 40 ? value.substring(0, 40) + '...' : value;
          return `<span style="color: #64748b;" title="${value}">📍 ${truncated}</span>`;
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
            <button class="btn btn-secondary btn-sm" onclick="window.editSupplier(${row.id})" title="Chỉnh sửa">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l.1.1a1.75 1.75 0 0 1 0 2.475l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25a1.75 1.75 0 0 1 .445-.758l8.61-8.61z"/>
              </svg>
              Sửa
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.deleteSupplier(${row.id})" title="Xóa">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M5.5 1a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zM3 3.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM4.118 4h5.764l-.459 6.882a.5.5 0 0 1-.498.468H5.075a.5.5 0 0 1-.498-.468L4.118 4z"/>
              </svg>
              Xóa
            </button>
          </div>
        `
      }
    ],
    data: filteredSuppliers,
    itemsPerPage: pageSize,
    showPagination: false,
    emptyMessage: 'Không tìm thấy nhà cung cấp'
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
      Hiển thị ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalCount)} trong tổng số ${totalCount} nhà cung cấp
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
  await loadSuppliers();
};

/**
 * Handle search
 */
async function handleSearch(query) {
  currentPage = 1;
  await loadSuppliers();
}

/**
 * Open add supplier modal
 */
function openAddSupplierModal() {
  currentEditingSupplierId = null;
  
  const template = document.getElementById('supplier-form-template');
  const formContent = template.content.cloneNode(true);
  
  const tempDiv = document.createElement('div');
  tempDiv.appendChild(formContent);
  
  currentModal = new Modal({
    id: 'supplier-modal',
    title: '➕ Thêm nhà cung cấp mới',
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
 * Edit supplier
 */
window.editSupplier = function(supplierId) {
  const supplier = suppliers.find(s => s.id === supplierId);
  if (!supplier) return;

  currentEditingSupplierId = supplierId;
  
  const template = document.getElementById('supplier-form-template');
  const formContent = template.content.cloneNode(true);
  
  const tempDiv = document.createElement('div');
  tempDiv.appendChild(formContent);
  
  currentModal = new Modal({
    id: 'supplier-modal',
    title: '✏️ Chỉnh sửa nhà cung cấp',
    content: tempDiv.innerHTML,
    size: 'medium'
  });

  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = currentModal.render();
    currentModal.attachEventListeners();
    currentModal.open();
    
    setupFormEventListeners();
    fillFormData(supplier);
  }
};

/**
 * Fill form with supplier data
 */
function fillFormData(supplier) {
  document.getElementById('tenNhaCungCap').value = supplier.tenNhaCungCap || '';
  document.getElementById('sdt').value = supplier.sdt || '';
  document.getElementById('email').value = supplier.email || '';
  document.getElementById('diaChi').value = supplier.diaChi || '';
  document.getElementById('trangThai').value = supplier.trangThai ? 'true' : 'false';
}

/**
 * Setup form event listeners
 */
function setupFormEventListeners() {
  const form = document.getElementById('supplier-form');
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
    
    if (currentEditingSupplierId) {
      await updateNhaCungCap(currentEditingSupplierId, data);
      response = { success: true };
    } else {
      response = await createNhaCungCap(data);
    }
    
    if (response.success || response) {
      closeModal();
      showNotification(
        currentEditingSupplierId ? '✅ Cập nhật nhà cung cấp thành công' : '✅ Tạo nhà cung cấp thành công',
        'success'
      );
      await loadSuppliers();
    } else {
      throw new Error(response.message || 'Không thể lưu nhà cung cấp');
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
  if (!data.tenNhaCungCap || data.tenNhaCungCap.length < 3) {
    showNotification('❌ Tên nhà cung cấp phải có ít nhất 3 ký tự', 'error');
    return false;
  }

  const phoneRegex = /^[0-9]{10,11}$/;
  if (!data.sdt || !phoneRegex.test(data.sdt)) {
    showNotification('❌ Số điện thoại phải có 10-11 chữ số', 'error');
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    showNotification('❌ Email không đúng định dạng', 'error');
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
  const inputs = document.querySelectorAll('#supplier-form input, #supplier-form select, #supplier-form textarea');

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
 * Delete supplier
 */
window.deleteSupplier = async function(supplierId) {
  const supplier = suppliers.find(s => s.id === supplierId);
  
  if (!supplier) return;
  
  if (!confirm(`🗑️ Bạn có chắc chắn muốn xóa nhà cung cấp "${supplier.tenNhaCungCap}"?\n\n⚠️ Lưu ý: Nhà cung cấp sẽ bị vô hiệu hóa và không thể tạo đơn nhập hàng mới.`)) {
    return;
  }

  try {
    showLoading(true);
    await deleteNhaCungCap(supplierId);
    
    showNotification('✅ Xóa nhà cung cấp thành công', 'success');
    await loadSuppliers();
  } catch (error) {
    console.error('Failed to delete supplier:', error);
    showNotification(error.message || 'Không thể xóa nhà cung cấp', 'error');
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
  currentEditingSupplierId = null;
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
  const addSupplierBtn = document.getElementById('add-supplier-btn');
  if (addSupplierBtn) {
    addSupplierBtn.addEventListener('click', openAddSupplierModal);
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