/**
 * Medicines Management Page
 * Quản lý thuốc - Full Display
 */

import { Header } from '../../components/admin/header.js';
import { Sidebar } from '../../components/admin/sidebar.js';
import { Footer } from '../../components/admin/footer.js';
import { Modal } from '../../components/admin/modal.js';
import { Table } from '../../components/admin/table.js';
import { SearchBox } from '../../components/admin/searchBox.js';
import { requireAuth } from '../../api/authApi.js';
import { getAllThuoc, createThuoc, updateThuoc, deleteThuoc } from '../../api/thuocApi.js';

// Check authentication
requireAuth();

// State
let thuocs = [];
let filteredThuocs = [];
let currentModal = null;
let currentTable = null;
let searchBox = null;
let currentPage = 1;
let pageSize = 10;
let totalCount = 0;
let currentEditingThuocId = null;

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  initializeLayout();
  await loadThuocs();
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
    activeItem: 'thuoc',
    menuItems: [
      {
        id: 'dashboard',
        label: 'Trang chủ',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zM3 10a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6zM14 9a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-2z"/>
        </svg>`,
        href: '/src/pages/admin/index.html'
      },
      {
        id: 'users',
        label: 'Quản lý người dùng',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0zM17 16a7 7 0 1 0-14 0h14zM3 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0z"/>
        </svg>`,
        href: '/src/pages/admin/nguoiDung.html'
      },
      {
        id: 'thuoc',
        label: 'Quản lý thuốc',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a1 1 0 0 1 1 1v1.323l3.954 1.582 1.599-.8a1 1 0 0 1 1.346 1.098l-.164 1.638 1.638.164A1 1 0 0 1 18.3 8.952l-.8 1.6L19.323 14a1 1 0 0 1-1.098 1.346l-1.638-.164-.164 1.638a1 1 0 0 1-1.346 1.098l-1.6-.8L10 19.323V21a1 1 0 1 1-2 0v-1.323l-3.954-1.582-1.599.8a1 1 0 0 1-1.346-1.098l.164-1.638-1.638-.164A1 1 0 0 1 1.7 15.048l.8-1.6L.677 10a1 1 0 0 1 1.098-1.346l1.638.164.164-1.638A1 1 0 0 1 4.923 6.08l1.6.8L10 4.677V3a1 1 0 0 1 1-1z"/>
        </svg>`,
        href: '/src/pages/admin/thuoc.html'
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
    placeholder: 'Tìm kiếm theo tên thuốc hoặc hoạt chất...',
    onSearch: handleSearch
  });

  const searchContainer = document.getElementById('search-container');
  if (searchContainer) {
    searchContainer.innerHTML = searchBox.render();
    searchBox.attachEventListeners();
  }
}

/**
 * Load medicines from API
 */
async function loadThuocs() {
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

    const response = await getAllThuoc(params);

    if (response.success && response.data) {
      const { items, totalCount: total, pageNumber, pageSize: size } = response.data;
      
      thuocs = items || [];
      filteredThuocs = [...thuocs];
      totalCount = total || 0;
      currentPage = pageNumber || 1;
      pageSize = size || 10;
      
      renderThuocsTable();
    } else {
      throw new Error(response.message || 'Không thể tải danh sách thuốc');
    }
  } catch (error) {
    console.error('Failed to load medicines:', error);
    showNotification(error.message || 'Không thể tải danh sách thuốc', 'error');
    
    thuocs = [];
    filteredThuocs = [];
    renderThuocsTable();
  } finally {
    showLoading(false);
  }
}

/**
 * Render medicines table
 */
function renderThuocsTable() {
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
        render: (value) => `<span style="font-weight: 600;">${value || 'N/A'}</span>`
      },
      { 
        field: 'hoatChat', 
        label: 'Hoạt chất',
        render: (value) => value || '<span style="color: #94a3b8;">Chưa cập nhật</span>'
      },
      { 
        field: 'donVi', 
        label: 'Đơn vị',
        render: (value) => value || 'N/A'
      },
      { 
        field: 'giaBan', 
        label: 'Giá bán',
        render: (value) => {
          if (!value) return '<span style="color: #94a3b8;">0 ₫</span>';
          return `<span style="color: #16a34a; font-weight: 600;">${formatCurrency(value)}</span>`;
        }
      },
      { 
        field: 'tenDanhMuc', 
        label: 'Danh mục',
        render: (value) => {
          if (!value) return '<span style="color: #94a3b8;">Chưa phân loại</span>';
          return `<span class="role-badge role-user">${value}</span>`;
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
            <button class="btn btn-secondary btn-sm" onclick="window.editThuoc(${row.id})" title="Chỉnh sửa">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l.1.1a1.75 1.75 0 0 1 0 2.475l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25a1.75 1.75 0 0 1 .445-.758l8.61-8.61z"/>
              </svg>
              Sửa
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.deleteThuoc(${row.id})" title="Xóa">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M5.5 1a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zM3 3.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM4.118 4h5.764l-.459 6.882a.5.5 0 0 1-.498.468H5.075a.5.5 0 0 1-.498-.468L4.118 4z"/>
              </svg>
              Xóa
            </button>
          </div>
        `
      }
    ],
    data: filteredThuocs,
    itemsPerPage: pageSize,
    showPagination: false,
    emptyMessage: 'Không tìm thấy thuốc'
  });

  currentTable.render();
  renderPagination();
}

/**
 * Format currency
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
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
      Hiển thị ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalCount)} trong tổng số ${totalCount} thuốc
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
  await loadThuocs();
};

/**
 * Handle search
 */
async function handleSearch(query) {
  currentPage = 1;
  await loadThuocs();
}

/**
 * Open add medicine modal
 */
function openAddThuocModal() {
  currentEditingThuocId = null;
  
  const template = document.getElementById('thuoc-form-template');
  const formContent = template.content.cloneNode(true);
  
  const tempDiv = document.createElement('div');
  tempDiv.appendChild(formContent);
  
  currentModal = new Modal({
    id: 'thuoc-modal',
    title: 'Thêm thuốc mới',
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
 * Edit medicine
 */
window.editThuoc = function(thuocId) {
  const thuoc = thuocs.find(t => t.id === thuocId);
  if (!thuoc) return;

  currentEditingThuocId = thuocId;
  
  const template = document.getElementById('thuoc-form-template');
  const formContent = template.content.cloneNode(true);
  
  const tempDiv = document.createElement('div');
  tempDiv.appendChild(formContent);
  
  currentModal = new Modal({
    id: 'thuoc-modal',
    title: 'Chỉnh sửa thuốc',
    content: tempDiv.innerHTML,
    size: 'medium'
  });

  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = currentModal.render();
    currentModal.attachEventListeners();
    currentModal.open();
    
    setupFormEventListeners();
    fillFormData(thuoc);
  }
};

/**
 * Fill form with medicine data
 */
function fillFormData(thuoc) {
  document.getElementById('tenThuoc').value = thuoc.tenThuoc || '';
  document.getElementById('hoatChat').value = thuoc.hoatChat || '';
  document.getElementById('donVi').value = thuoc.donVi || '';
  document.getElementById('giaBan').value = thuoc.giaBan || '';
  document.getElementById('iddanhMuc').value = thuoc.iddanhMuc || '';
  document.getElementById('moTa').value = thuoc.moTa || '';
  document.getElementById('trangThai').value = thuoc.trangThai ? 'true' : 'false';
}

/**
 * Setup form event listeners
 */
function setupFormEventListeners() {
  const form = document.getElementById('thuoc-form');
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
    if (key === 'iddanhMuc') {
      data[key] = value ? parseInt(value) : null;
    } else if (key === 'giaBan') {
      data[key] = value ? parseFloat(value) : null;
    } else if (key === 'trangThai') {
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
    
    if (currentEditingThuocId) {
      response = await updateThuoc(currentEditingThuocId, data);
    } else {
      response = await createThuoc(data);
    }
    
    if (response.success) {
      closeModal();
      showNotification(
        currentEditingThuocId ? 'Cập nhật thuốc thành công' : 'Tạo thuốc thành công',
        'success'
      );
      await loadThuocs();
    } else {
      throw new Error(response.message || 'Không thể lưu thuốc');
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
  if (!data.tenThuoc || data.tenThuoc.length < 2) {
    showNotification('Tên thuốc phải có ít nhất 2 ký tự', 'error');
    return false;
  }

  if (!data.donVi || data.donVi.length < 1) {
    showNotification('Vui lòng nhập đơn vị', 'error');
    return false;
  }

  if (!data.giaBan || data.giaBan <= 0) {
    showNotification('Giá bán phải lớn hơn 0', 'error');
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
  const inputs = document.querySelectorAll('#thuoc-form input, #thuoc-form select, #thuoc-form textarea');

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
 * Delete medicine
 */
window.deleteThuoc = async function(thuocId) {
  if (!confirm('Bạn có chắc chắn muốn xóa thuốc này?')) {
    return;
  }

  try {
    showLoading(true);
    await deleteThuoc(thuocId);
    
    showNotification('Xóa thuốc thành công', 'success');
    await loadThuocs();
  } catch (error) {
    console.error('Failed to delete medicine:', error);
    showNotification(error.message || 'Không thể xóa thuốc', 'error');
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
  currentEditingThuocId = null;
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
  const addThuocBtn = document.getElementById('add-thuoc-btn');
  if (addThuocBtn) {
    addThuocBtn.addEventListener('click', openAddThuocModal);
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