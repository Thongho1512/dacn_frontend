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
import { formatDate } from '../utils/helpers.js';

// Check authentication
requireAuth();

// State management
let users = [];
let filteredUsers = [];
let currentModal = null;
let currentTable = null;
let searchBox = null;

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
    appTitle: 'AdminPro',
    logoText: 'A',
    onMenuToggle: toggleMobileSidebar
  });

  const headerContainer = document.getElementById('header');
  if (headerContainer) {
    headerContainer.innerHTML = header.render();
    header.attachEventListeners();
  }

  // Initialize Sidebar
  const sidebar = new Sidebar({
    activeItem: 'users',
    menuItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: sidebar.getIcon('dashboard'),
        href: '/pages/dashboard.html'
      },
      {
        id: 'users',
        label: 'User Management',
        icon: sidebar.getIcon('users'),
        href: '/pages/users.html'
      },
      {
        id: 'products',
        label: 'Products',
        icon: sidebar.getIcon('products'),
        href: '/pages/products.html'
      },
      {
        id: 'orders',
        label: 'Orders',
        icon: sidebar.getIcon('orders'),
        href: '/pages/orders.html'
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: sidebar.getIcon('settings'),
        href: '/pages/settings.html'
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
    copyrightText: '© 2024 AdminPro. All rights reserved.',
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
    placeholder: 'Search by name or email...',
    onSearch: handleSearch
  });

  const searchContainer = document.getElementById('search-container');
  if (searchContainer) {
    searchContainer.innerHTML = searchBox.render();
    searchBox.attachEventListeners();
  }
}

/**
 * Load users data
 */
async function loadUsers() {
  try {
    // TODO: Replace with actual API call
    // const response = await apiGet('v1/users');
    // users = response.data;
    
    // Mock data for demonstration
    users = generateMockUsers(50);
    filteredUsers = [...users];
    
    renderUsersTable();
  } catch (error) {
    console.error('Failed to load users:', error);
    showNotification('Failed to load users', 'error');
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
      { field: 'name', label: 'Name' },
      { field: 'email', label: 'Email' },
      { 
        field: 'role', 
        label: 'Role',
        render: (value) => `<span class="role-badge role-${value.toLowerCase()}">${value}</span>`
      },
      { 
        field: 'created_date', 
        label: 'Created Date',
        render: (value) => formatDate(value, 'short')
      },
      {
        field: 'actions',
        label: 'Actions',
        render: (value, row) => `
          <div class="actions">
            <button class="btn btn-secondary btn-sm" onclick="window.editUser('${row.id}')">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l.1.1a1.75 1.75 0 0 1 0 2.475l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25a1.75 1.75 0 0 1 .445-.758l8.61-8.61z"/>
              </svg>
              Edit
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.deleteUser('${row.id}')">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M5.5 1a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zM3 3.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM4.118 4h5.764l-.459 6.882a.5.5 0 0 1-.498.468H5.075a.5.5 0 0 1-.498-.468L4.118 4z"/>
              </svg>
              Delete
            </button>
          </div>
        `
      }
    ],
    data: filteredUsers,
    itemsPerPage: 10,
    emptyMessage: 'No users found'
  });

  currentTable.render();
}

/**
 * Handle search
 */
function handleSearch(query) {
  if (!query) {
    filteredUsers = [...users];
  } else {
    const lowerQuery = query.toLowerCase();
    filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery)
    );
  }

  if (currentTable) {
    currentTable.setData(filteredUsers);
  }
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
    title: 'Add New User',
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
    title: 'Edit User',
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
  if (!confirm('Are you sure you want to delete this user?')) {
    return;
  }

  try {
    // TODO: Replace with actual API call
    // await apiDelete(`v1/users/${userId}`);
    
    users = users.filter(u => u.id !== userId);
    filteredUsers = filteredUsers.filter(u => u.id !== userId);
    
    if (currentTable) {
      currentTable.setData(filteredUsers);
    }

    showNotification('User deleted successfully', 'success');
  } catch (error) {
    console.error('Failed to delete user:', error);
    showNotification('Failed to delete user', 'error');
  }
};

/**
 * Handle create user
 */
async function handleCreateUser(data) {
  try {
    // TODO: Replace with actual API call
    // const response = await apiPost('v1/users', data);
    
    const newUser = {
      id: `USR${String(users.length + 1).padStart(4, '0')}`,
      name: data.name,
      email: data.email,
      role: data.role,
      created_date: new Date().toISOString()
    };
    
    users.unshift(newUser);
    filteredUsers = [...users];

    if (currentTable) {
      currentTable.setData(filteredUsers);
    }

    closeModal();
    showNotification('User created successfully', 'success');
  } catch (error) {
    console.error('Failed to create user:', error);
    showNotification('Failed to create user', 'error');
  }
}

/**
 * Handle update user
 */
async function handleUpdateUser(userId, data) {
  try {
    // TODO: Replace with actual API call
    // const response = await apiPut(`v1/users/${userId}`, data);
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        name: data.name,
        email: data.email,
        role: data.role
      };
      filteredUsers = [...users];
      
      if (currentTable) {
        currentTable.setData(filteredUsers);
      }
    }
    
    closeModal();
    showNotification('User updated successfully', 'success');
  } catch (error) {
    console.error('Failed to update user:', error);
    showNotification('Failed to update user', 'error');
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
 * Show notification
 */
function showNotification(message, type = 'info') {
  // TODO: Implement proper toast notification system
  console.log(`[${type.toUpperCase()}] ${message}`);
  alert(message);
}

/**
 * Generate mock users for demonstration
 */
function generateMockUsers(count) {
  const names = [
    'John Doe', 'Jane Smith', 'Michael Johnson', 'Emily Williams', 'David Brown',
    'Sarah Davis', 'James Wilson', 'Jennifer Martinez', 'Robert Anderson', 'Lisa Taylor'
  ];

  const roles = ['User', 'Manager', 'Admin'];
  const mockUsers = [];

  for (let i = 1; i <= count; i++) {
    mockUsers.push({
      id: `USR${String(i).padStart(4, '0')}`,
      name: names[Math.floor(Math.random() * names.length)],
      email: `user${i}@example.com`,
      role: roles[Math.floor(Math.random() * roles.length)],
      created_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return mockUsers;
}