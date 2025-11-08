/**
 * Chi Nhánh Management Page
 * Quản lý chi nhánh - Đầy đủ chức năng CRUD
 */

import { Header } from '../../components/admin/header.js';
import { Sidebar } from '../../components/admin/sidebar.js';
import { Footer } from '../../components/admin/footer.js';
import { Modal } from '../../components/admin/modal.js';
import { Table } from '../../components/admin/table.js';
import { SearchBox } from '../../components/admin/searchBox.js';
import { requireAuth } from '../../api/authApi.js';
import { 
  getAllChiNhanhs, 
  createChiNhanh, 
  updateChiNhanh, 
  deleteChiNhanh 
} from '../../api/chiNhanhApi.js';

// Check authentication
requireAuth();

// State
let branches = [];
let filteredBranches = [];
let currentModal = null;
let currentTable = null;
let searchBox = null;
let currentPage = 1;
let pageSize = 10;
let totalCount = 0;
let currentEditingBranchId = null;

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  initializeLayout();
  await loadBranches();
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
    activeItem: 'chinhanh',
    menuItems: [
      {
        id: 'dashboard',
        label: 'Trang chủ',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zM3 10a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6zM14 9a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-2z"/></svg>`,
        href: '/src/pages/admin/index.html'
      },
      {
        id: 'users',
        label: 'Người dùng',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0zM17 16a7 7 0 1 0-14 0h14zM3 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0z"/></svg>`,
        href: '/src/pages/admin/nguoiDung.html'
      },
      {
        id: 'vaitro',
        label: 'Vai trò',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7 9a7 7 0 1 1 14 0H3z"/></svg>`,
        href: '/src/pages/admin/vaiTro.html'
      },
      {
        id: 'chinhanh',
        label: 'Chi nhánh',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4zm8 2h3v3h-3V5zM5 5h3v3H5V5zm0 5h3v3H5v-3zm7 0h3v3h-3v-3z"/></svg>`,
        href: '/src/pages/admin/chiNhanh.html'
      },
      {
        id: 'danhmuc',
        label: 'Danh mục',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z"/><path d="M3 10a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/></svg>`,
        href: '/src/pages/admin/danhMuc.html'
      },
      {
        id: 'thuoc',
        label: 'Thuốc',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zM3 10a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/></svg>`,
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
    placeholder: 'Tìm kiếm theo tên hoặc địa chỉ chi nhánh...',
    onSearch: handleSearch
  });

  const searchContainer = document.getElementById('search-container');
  if (searchContainer) {
    searchContainer.innerHTML = searchBox.render();
    searchBox.attachEventListeners();
  }
}

/**
 * Load branches from API
 */
async function loadBranches() {
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

    const response = await getAllChiNhanhs(params);

    if (response.success && response.data) {
      const { items, totalCount: total, pageNumber, pageSize: size } = response.data;
      
      branches = items || [];
      filteredBranches = [...branches];
      totalCount = total || 0;
      currentPage = pageNumber || 1;
      pageSize = size || 10;
      
      renderBranchesTable();
    } else {
      throw new Error(response.message || 'Không thể tải danh sách chi nhánh');
    }
  } catch (error) {
    console.error('Failed to load branches:', error);
    showNotification(error.message || 'Không thể tải danh sách chi nhánh', 'error');
    
    branches = [];
    filteredBranches = [];
    renderBranchesTable();
  } finally {
    showLoading(false);
  }
}

/**
 * Render branches table
 */
function renderBranchesTable() {
  currentTable = new Table({
    containerId: 'table-container',
    columns: [
      { 
        field: 'id', 
        label: 'ID',
        render: (value) => `<strong>#${value}</strong>`
      },
      { 
        field: 'tenChiNhanh', 
        label: 'Tên chi nhánh',
        render: (value) => `<span style="font-weight: 600; color: #1e293b;">🏢 ${value || 'N/A'}</span>`
      },
      { 
        field: 'diaChi', 
        label: 'Địa chỉ',
        render: (value) => {
          if (!value) return '<span style="color: #94a3b8;">Chưa cập nhật</span>';
          const truncated = value.length > 60 ? value.substring(0, 60) + '...' : value;
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
            <button class="btn btn-secondary btn-sm" onclick="window.editBranch(${row.id})" title="Chỉnh sửa">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l.1.1a1.75 1.75 0 0 1 0 2.475l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25a1.75 1.75 0 0 1 .445-.758l8.61-8.61z"/>
              </svg>
              Sửa
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.deleteBranch(${row.id})" title="Xóa">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M5.5 1a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zM3 3.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM4.118 4h5.764l-.459 6.882a.5.5 0 0 1-.498.468H5.075a.5.5 0 0 1-.498-.468L4.118 4z"/>
              </svg>
              Xóa
            </button>
          </div>
        `
      }
    ],
    data: filteredBranches,
    itemsPerPage: pageSize,
    showPagination: false,
    emptyMessage: 'Không tìm thấy chi nhánh'
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
      Hiển thị ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalCount)} trong tổng số ${totalCount} chi nhánh
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
  await loadBranches();
};

/**
 * Handle search
 */
async function handleSearch(query) {
  currentPage = 1;
  await loadBranches();
}

/**
 * Open add branch modal
 */
function openAddBranchModal() {
  currentEditingBranchId = null;
  
  const template = document.getElementById('branch-form-template');
  const formContent = template.content.cloneNode(true);
  
  const tempDiv = document.createElement('div');
  tempDiv.appendChild(formContent);
  
  currentModal = new Modal({
    id: 'branch-modal',
    title: '➕ Thêm chi nhánh mới',
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
 * Edit branch
 */
window.editBranch = function(branchId) {
  const branch = branches.find(b => b.id === branchId);
  if (!branch) return;

  currentEditingBranchId = branchId;
  
  const template = document.getElementById('branch-form-template');
  const formContent = template.content.cloneNode(true);
  
  const tempDiv = document.createElement('div');
  tempDiv.appendChild(formContent);
  
  currentModal = new Modal({
    id: 'branch-modal',
    title: '✏️ Chỉnh sửa chi nhánh',
    content: tempDiv.innerHTML,
    size: 'medium'
  });

  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = currentModal.render();
    currentModal.attachEventListeners();
    currentModal.open();
    
    setupFormEventListeners();
    fillFormData(branch);
  }
};

/**
 * Fill form with branch data
 */
function fillFormData(branch) {
  document.getElementById('tenChiNhanh').value = branch.tenChiNhanh || '';
  document.getElementById('diaChi').value = branch.diaChi || '';
  document.getElementById('trangThai').value = branch.trangThai ? 'true' : 'false';
}

/**
 * Setup form event listeners
 */
function setupFormEventListeners() {
  const form = document.getElementById('branch-form');
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
    
    if (currentEditingBranchId) {
      await updateChiNhanh(currentEditingBranchId, data);
      response = { success: true };
    } else {
      response = await createChiNhanh(data);
    }
    
    if (response.success || response) {
      closeModal();
      showNotification(
        currentEditingBranchId ? '✅ Cập nhật chi nhánh thành công' : '✅ Tạo chi nhánh thành công',
        'success'
      );
      await loadBranches();
    } else {
      throw new Error(response.message || 'Không thể lưu chi nhánh');
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
  if (!data.tenChiNhanh || data.tenChiNhanh.length < 3) {
    showNotification('Tên chi nhánh phải có ít nhất 3 ký tự', 'error');
    return false;
  }

  if (!data.diaChi || data.diaChi.length < 10) {
    showNotification('Địa chỉ phải có ít nhất 10 ký tự', 'error');
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
  const inputs = document.querySelectorAll('#branch-form input, #branch-form select, #branch-form textarea');

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
 * Delete branch
 */
window.deleteBranch = async function(branchId) {
  const branch = branches.find(b => b.id === branchId);
  
  if (!branch) return;
  
  if (!confirm(`🗑️ Bạn có chắc chắn muốn xóa chi nhánh "${branch.tenChiNhanh}"?\n\n⚠️ Lưu ý: Chi nhánh sẽ bị vô hiệu hóa và không thể tạo đơn hàng mới.`)) {
    return;
  }

  try {
    showLoading(true);
    await deleteChiNhanh(branchId);
    
    showNotification('✅ Xóa chi nhánh thành công', 'success');
    await loadBranches();
  } catch (error) {
    console.error('Failed to delete branch:', error);
    showNotification(error.message || 'Không thể xóa chi nhánh', 'error');
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
  currentEditingBranchId = null;
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
  const addBranchBtn = document.getElementById('add-branch-btn');
  if (addBranchBtn) {
    addBranchBtn.addEventListener('click', openAddBranchModal);
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