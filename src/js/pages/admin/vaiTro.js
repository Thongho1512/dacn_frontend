/**
 * Roles Management Page
 * Quản lý vai trò
 */

import { Header } from '../../components/admin/header.js';
import { Sidebar } from '../../components/admin/sidebar.js';
import { Footer } from '../../components/admin/footer.js';
import { Modal } from '../../components/admin/modal.js';
import { Table } from '../../components/admin/table.js';
import { SearchBox } from '../../components/admin/searchBox.js';
import { requireAuth } from '../../api/authApi.js';
import { getAllVaiTros, createVaiTro, updateVaiTro, deleteVaiTro } from '../../api/vaiTroApi.js';
import { formatDate } from '../../utils/helpers.js';

// Check authentication
requireAuth();

// State
let roles = [];
let filteredRoles = [];
let currentModal = null;
let currentTable = null;
let searchBox = null;
let currentPage = 1;
let pageSize = 10;
let totalCount = 0;
let currentEditingRoleId = null;

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  initializeLayout();
  await loadRoles();
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
    activeItem: 'vaitro',
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
    placeholder: 'Tìm kiếm theo tên vai trò...',
    onSearch: handleSearch
  });

  const searchContainer = document.getElementById('search-container');
  if (searchContainer) {
    searchContainer.innerHTML = searchBox.render();
    searchBox.attachEventListeners();
  }
}

/**
 * Load roles from API
 */
async function loadRoles() {
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

    const response = await getAllVaiTros(params);

    if (response.success && response.data) {
      const { items, totalCount: total, pageNumber, pageSize: size } = response.data;
      
      roles = items || [];
      filteredRoles = [...roles];
      totalCount = total || 0;
      currentPage = pageNumber || 1;
      pageSize = size || 10;
      
      renderRolesTable();
    } else {
      throw new Error(response.message || 'Không thể tải danh sách vai trò');
    }
  } catch (error) {
    console.error('Failed to load roles:', error);
    showNotification(error.message || 'Không thể tải danh sách vai trò', 'error');
    
    roles = [];
    filteredRoles = [];
    renderRolesTable();
  } finally {
    showLoading(false);
  }
}

/**
 * Render roles table
 */
function renderRolesTable() {
  currentTable = new Table({
    containerId: 'table-container',
    columns: [
      { 
        field: 'id', 
        label: 'ID',
        render: (value) => `<strong>#${value}</strong>`
      },
      { 
        field: 'tenVaiTro', 
        label: 'Tên vai trò',
        render: (value) => {
          const badges = {
            'ADMIN': 'background: #fef3c7; color: #92400e;',
            'MANAGER': 'background: #e9d5ff; color: #6b21a8;',
            'STAFF': 'background: #dbeafe; color: #1e40af;',
            'WAREHOUSE_STAFF': 'background: #d1fae5; color: #065f46;'
          };
          const style = badges[value] || 'background: #f1f5f9; color: #475569;';
          return `<span class="role-badge" style="${style}">${value}</span>`;
        }
      },
      { 
        field: 'moTa', 
        label: 'Mô tả',
        render: (value) => value || '<span style="color: #94a3b8;">Chưa có mô tả</span>'
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
            <button class="btn btn-secondary btn-sm" onclick="window.editRole(${row.id})" title="Chỉnh sửa">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l.1.1a1.75 1.75 0 0 1 0 2.475l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25a1.75 1.75 0 0 1 .445-.758l8.61-8.61z"/>
              </svg>
              Sửa
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.deleteRole(${row.id})" title="Xóa" ${row.tenVaiTro === 'ADMIN' || row.tenVaiTro === 'USER' ? 'disabled' : ''}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M5.5 1a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zM3 3.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM4.118 4h5.764l-.459 6.882a.5.5 0 0 1-.498.468H5.075a.5.5 0 0 1-.498-.468L4.118 4z"/>
              </svg>
              Xóa
            </button>
          </div>
        `
      }
    ],
    data: filteredRoles,
    itemsPerPage: pageSize,
    showPagination: false,
    emptyMessage: 'Không tìm thấy vai trò'
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
      Hiển thị ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalCount)} trong tổng số ${totalCount} vai trò
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
  await loadRoles();
};

/**
 * Handle search
 */
async function handleSearch(query) {
  currentPage = 1;
  await loadRoles();
}

/**
 * Open add role modal
 */
function openAddRoleModal() {
  currentEditingRoleId = null;
  
  const template = document.getElementById('role-form-template');
  const formContent = template.content.cloneNode(true);
  
  const tempDiv = document.createElement('div');
  tempDiv.appendChild(formContent);
  
  currentModal = new Modal({
    id: 'role-modal',
    title: 'Thêm vai trò mới',
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
 * Edit role
 */
window.editRole = function(roleId) {
  const role = roles.find(r => r.id === roleId);
  if (!role) return;

  currentEditingRoleId = roleId;
  
  const template = document.getElementById('role-form-template');
  const formContent = template.content.cloneNode(true);
  
  const tempDiv = document.createElement('div');
  tempDiv.appendChild(formContent);
  
  currentModal = new Modal({
    id: 'role-modal',
    title: 'Chỉnh sửa vai trò',
    content: tempDiv.innerHTML,
    size: 'medium'
  });

  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = currentModal.render();
    currentModal.attachEventListeners();
    currentModal.open();
    
    setupFormEventListeners();
    fillFormData(role);
  }
};

/**
 * Fill form with role data
 */
function fillFormData(role) {
  document.getElementById('tenVaiTro').value = role.tenVaiTro || '';
  document.getElementById('moTa').value = role.moTa || '';
  document.getElementById('trangThai').value = role.trangThai ? 'true' : 'false';
  
  // Disable tên vai trò nếu là ADMIN hoặc USER
  if (role.tenVaiTro === 'ADMIN' || role.tenVaiTro === 'USER') {
    document.getElementById('tenVaiTro').disabled = true;
  }
}

/**
 * Setup form event listeners
 */
function setupFormEventListeners() {
  const form = document.getElementById('role-form');
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
    
    if (currentEditingRoleId) {
      await updateVaiTro(currentEditingRoleId, data);
      response = { success: true };
    } else {
      response = await createVaiTro(data);
    }
    
    if (response.success || response) {
      closeModal();
      showNotification(
        currentEditingRoleId ? 'Cập nhật vai trò thành công' : 'Tạo vai trò thành công',
        'success'
      );
      await loadRoles();
    } else {
      throw new Error(response.message || 'Không thể lưu vai trò');
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
  if (!data.tenVaiTro || data.tenVaiTro.length < 2) {
    showNotification('Tên vai trò phải có ít nhất 2 ký tự', 'error');
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
  const inputs = document.querySelectorAll('#role-form input, #role-form select, #role-form textarea');

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
 * Delete role
 */
window.deleteRole = async function(roleId) {
  const role = roles.find(r => r.id === roleId);
  
  if (role && (role.tenVaiTro === 'ADMIN' || role.tenVaiTro === 'USER')) {
    showNotification('Không thể xóa vai trò hệ thống', 'error');
    return;
  }
  
  if (!confirm('Bạn có chắc chắn muốn xóa vai trò này?')) {
    return;
  }

  try {
    showLoading(true);
    await deleteVaiTro(roleId);
    
    showNotification('Xóa vai trò thành công', 'success');
    await loadRoles();
  } catch (error) {
    console.error('Failed to delete role:', error);
    showNotification(error.message || 'Không thể xóa vai trò', 'error');
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
  currentEditingRoleId = null;
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
  const addRoleBtn = document.getElementById('add-role-btn');
  if (addRoleBtn) {
    addRoleBtn.addEventListener('click', openAddRoleModal);
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