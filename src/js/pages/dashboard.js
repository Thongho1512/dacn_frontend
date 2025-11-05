/**
 * Dashboard Page
 * Main dashboard with user management
 */

import { Header } from '../components/header.js';
import { Sidebar } from '../components/sidebar.js';
import { Footer } from '../components/footer.js';
import { Modal } from '../components/modal.js';
import { Table } from '../components/table.js';
import { SearchBox } from '../components/searchBox.js';
import { UserForm } from '../components/userForm.js';
import { requireAuth } from '../api/authApi.js';
import { getAllUsers, createUser, updateUser, deleteUser } from '../api/nguoiDungApi.js';
import { formatDate } from '../utils/helpers.js';

// Check authentication
requireAuth();

// State management
let users = [];
let filteredUsers = [];
let currentModal = null;
let currentTable = null;
let searchBox = null;
let currentPage = 1;
let pageSize = 10;
let totalCount = 0;

// Initialize dashboard
window.addEventListener('DOMContentLoaded', async () => {
  initializeLayout();
  await loadUsers();
  setupEventListeners();
});

/**
 * Initialize page layout
 */
function initializeLayout() {
  // Initialize Header
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

  // Initialize Sidebar with custom menu items
  const sidebar = new Sidebar({
    activeItem: 'users',
    menuItems: [
      {
        id: 'dashboard',
        label: 'Trang chủ',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zM3 10a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6zM14 9a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-2z"/>
        </svg>`,
        href: '/pages/dashboard.html'
      },
      {
        id: 'users',
        label: 'Quản lý người dùng',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0zM17 16a7 7 0 1 0-14 0h14zM3 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0z"/>
        </svg>`,
        href: '/pages/dashboard.html'
      },
      {
        id: 'products',
        label: 'Sản phẩm',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zM3 10a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>
        </svg>`,
        href: '/pages/products.html'
      },
      {
        id: 'orders',
        label: 'Đơn hàng',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 1a1 1 0 0 0 0 2h1.22l.305 1.222a.997.997 0 0 0 .01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 0 0 0-2H6.414l1-1H14a1 1 0 0 0 .894-.553l3-6A1 1 0 0 0 17 3H6.28l-.31-1.243A1 1 0 0 0 5 1H3zM16 16.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM6.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
        </svg>`,
        href: '/pages/orders.html'
      }
    ]
  });

  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = sidebar.render();
    sidebar.attachEventListeners();
  }

  // Initialize Footer
  const footer = new Footer({
    copyrightText: '© 2024 Quản lý bán thuốc. All rights reserved.',
    versionText: 'Version 1.0.0'
  });

  const footerContainer = document.getElementById('footer');
  if (footerContainer) {
    footerContainer.innerHTML = footer.render();
    footer.attachEventListeners();
  }

  // Initialize Search Box
  searchBox = new SearchBox({
    containerId: 'search-container',
    placeholder: 'Tìm kiếm theo tên hoặc tên đăng nhập...',
    onSearch: handleSearch
  });

  const searchContainer = document.getElementById('search-container');
  if (searchContainer) {
    searchContainer.innerHTML = searchBox.render();
    searchBox.attachEventListeners();
  }
}

/**
 * Load users data from API
 */
async function loadUsers() {
  try {
    showLoading(true);
    
    const searchTerm = searchBox?.getValue() || '';
    
    // Call API with pagination
    const response = await getAllUsers({
      pageNumber: currentPage,
      pageSize: pageSize,
      active: true,
      searchTerm: searchTerm || undefined
    });

    console.log('API Response:', response);

    // Backend returns: { success, message, data: { items, pageNumber, pageSize, totalCount } }
    if (response.success && response.data) {
      const { items, totalCount: total, pageNumber, pageSize: size } = response.data;
      
      users = items || [];
      filteredUsers = [...users];
      totalCount = total || 0;
      currentPage = pageNumber || 1;
      pageSize = size || 10;
      
      console.log('Loaded users:', {
        count: users.length,
        total: totalCount,
        page: currentPage
      });
      
      renderUsersTable();
    } else {
      throw new Error(response.message || 'Không thể tải danh sách người dùng');
    }
  } catch (error) {
    console.error('Failed to load users:', error);
    showNotification(error.message || 'Không thể tải danh sách người dùng', 'error');
    
    // Show empty table
    users = [];
    filteredUsers = [];
    renderUsersTable();
  } finally {
    showLoading(false);
  }
}

/**
 * Render users table
 */
function renderUsersTable() {
  currentTable = new Table({
    containerId: 'table-container',
    columns: [
      { field: 'id', label: 'ID' },
      { field: 'tenDangNhap', label: 'Tên đăng nhập' },
      { field: 'hoTen', label: 'Họ và tên' },
      { 
        field: 'idvaiTro', 
        label: 'Vai trò',
        render: (value) => {
          const roleMap = {
            1: { label: 'Admin', class: 'role-admin' },
            2: { label: 'User', class: 'role-user' }
          };
          const role = roleMap[value] || { label: 'Unknown', class: 'role-user' };
          return `<span class="role-badge ${role.class}">${role.label}</span>`;
        }
      },
      { 
        field: 'ngayTao', 
        label: 'Ngày tạo',
        render: (value) => value ? formatDate(value, 'short') : '-'
      },
      {
        field: 'actions',
        label: 'Hành động',
        render: (value, row) => `
          <div class="actions">
            <button class="btn btn-secondary btn-sm" onclick="window.editUser(${row.id})">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l.1.1a1.75 1.75 0 0 1 0 2.475l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25a1.75 1.75 0 0 1 .445-.758l8.61-8.61z"/>
              </svg>
              Sửa
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.deleteUser(${row.id})">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M5.5 1a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zM3 3.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM4.118 4h5.764l-.459 6.882a.5.5 0 0 1-.498.468H5.075a.5.5 0 0 1-.498-.468L4.118 4z"/>
              </svg>
              Xóa
            </button>
          </div>
        `
      }
    ],
    data: filteredUsers,
    itemsPerPage: pageSize,
    showPagination: false,
    emptyMessage: 'Không tìm thấy người dùng'
  });

  currentTable.render();
  
  // Render custom pagination for server-side
  renderPagination();
}

/**
 * Render server-side pagination
 */
function renderPagination() {
  const container = document.getElementById('table-container');
  if (!container) return;

  const totalPages = Math.ceil(totalCount / pageSize);
  
  if (totalPages <= 1) return;

  let paginationHTML = `
    <div class="pagination" style="display: flex; justify-content: center; gap: 8px; padding: 20px 0;">
      <button class="page-btn" onclick="window.goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M8.5 3.5L5 7l3.5 3.5"/>
        </svg>
      </button>
  `;

  // Show page numbers
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
    <div style="text-align: center; color: #64748b; font-size: 14px; padding-bottom: 20px;">
      Hiển thị ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalCount)} trong tổng số ${totalCount} người dùng
    </div>
  `;

  container.insertAdjacentHTML('beforeend', paginationHTML);
}

/**
 * Go to page (server-side pagination)
 */
window.goToPage = async function(page) {
  const totalPages = Math.ceil(totalCount / pageSize);
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  await loadUsers();
};

/**
 * Handle search
 */
async function handleSearch(query) {
  currentPage = 1;
  await loadUsers();
}

/**
 * Open add user modal
 */
function openAddUserModal() {
  const userForm = new UserForm({
    formId: 'user-form',
    mode: 'create',
    onSubmit: handleCreateUser,
    onCancel: closeModal
  });

  currentModal = new Modal({
    id: 'user-modal',
    title: 'Thêm người dùng mới',
    content: userForm.render(),
    size: 'medium',
    onClose: () => {
      userForm.destroy();
    }
  });

  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = currentModal.render();
    currentModal.attachEventListeners();
    userForm.attachEventListeners();
    currentModal.open();
  }
}

/**
 * Edit user
 */
window.editUser = function(userId) {
  const user = users.find(u => u.id === userId);
  if (!user) return;

  const userForm = new UserForm({
    formId: 'user-form',
    mode: 'edit',
    userData: user,
    onSubmit: (data) => handleUpdateUser(userId, data),
    onCancel: closeModal
  });

  currentModal = new Modal({
    id: 'user-modal',
    title: 'Chỉnh sửa người dùng',
    content: userForm.render(),
    size: 'medium',
    onClose: () => {
      userForm.destroy();
    }
  });

  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = currentModal.render();
    currentModal.attachEventListeners();
    userForm.attachEventListeners();
    currentModal.open();
  }
};

/**
 * Delete user
 */
window.deleteUser = async function(userId) {
  if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
    return;
  }

  try {
    showLoading(true);
    await deleteUser(userId);
    
    showNotification('Xóa người dùng thành công', 'success');
    await loadUsers();
  } catch (error) {
    console.error('Failed to delete user:', error);
    showNotification(error.message || 'Không thể xóa người dùng', 'error');
  } finally {
    showLoading(false);
  }
};

/**
 * Handle create user
 */
async function handleCreateUser(data) {
  try {
    console.log('Creating user with data:', data);
    
    const response = await createUser(data);
    
    console.log('Create user response:', response);
    
    if (response.success) {
      closeModal();
      showNotification('Tạo người dùng thành công', 'success');
      await loadUsers();
    } else {
      throw new Error(response.message || 'Không thể tạo người dùng');
    }
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}

/**
 * Handle update user
 */
async function handleUpdateUser(userId, data) {
  try {
    console.log('Updating user', userId, 'with data:', data);
    
    const response = await updateUser(userId, data);
    
    console.log('Update user response:', response);
    
    if (response.success) {
      closeModal();
      showNotification('Cập nhật người dùng thành công', 'success');
      await loadUsers();
    } else {
      throw new Error(response.message || 'Không thể cập nhật người dùng');
    }
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
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
  const addUserBtn = document.getElementById('add-user-btn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', openAddUserModal);
  }

  const sidebarOverlay = document.getElementById('sidebar-overlay');
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', toggleMobileSidebar);
  }
}

/**
 * Show loading indicator
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
  console.log(`[${type.toUpperCase()}] ${message}`);
  alert(message);
}