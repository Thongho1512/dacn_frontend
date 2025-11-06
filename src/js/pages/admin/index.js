/**
 * Index Page (Dashboard)
 * Trang chính - Thống kê tổng quan
 */

import { Header } from '../../components/admin/header.js';
import { Sidebar } from '../../components/admin/sidebar.js';
import { Footer } from '../../components/admin/footer.js';
import { requireAuth } from '../../api/authApi.js';
import { getAllUsers } from '../../api/nguoiDungApi.js';

// Check authentication
requireAuth();

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  initializeLayout();
  await loadDashboardData();
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
    activeItem: 'dashboard',
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
        id: 'products',
        label: 'Sản phẩm',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zM3 10a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>
        </svg>`,
        href: '/src/pages/admin/products.html'
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
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
  try {
    // Load total users count
    const usersResponse = await getAllUsers({
      pageNumber: 1,
      pageSize: 1,
      active: true
    });

    if (usersResponse.success && usersResponse.data) {
      const totalUsers = usersResponse.data.totalCount || 0;
      updateTotalUsers(totalUsers);
    }

    // TODO: Load other statistics
    // - Total products
    // - Total orders
    // - Revenue
    // - Charts data
    
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}

/**
 * Update total users display
 */
function updateTotalUsers(count) {
  const totalUsersElement = document.getElementById('total-users');
  if (totalUsersElement) {
    // Animate number counting
    animateNumber(totalUsersElement, 0, count, 1000);
  }
}

/**
 * Animate number counting
 */
function animateNumber(element, start, end, duration) {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function
    const easeOutQuad = progress => 1 - (1 - progress) * (1 - progress);
    const current = Math.floor(start + (end - start) * easeOutQuad(progress));
    
    element.textContent = current.toLocaleString('vi-VN');
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
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
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', toggleMobileSidebar);
  }
}