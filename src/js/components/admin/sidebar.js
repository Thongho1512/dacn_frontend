/**
 * Sidebar Component
 * Renders the navigation sidebar with menu items
 */

export class Sidebar {
  constructor(config = {}) {
    this.config = {
      menuItems: config.menuItems || this.getDefaultMenuItems(),
      activeItem: config.activeItem || 'dashboard',
      onItemClick: config.onItemClick || null,
      ...config
    };
  }

  getDefaultMenuItems() {
    return [
      
      {
        id: 'baoCao',
        label: 'Thống kê',
        icon: this.getIcon('report'),
        href: '/index.html'
      },
      {
        id: 'chiNhanh',
        label: 'Chi nhánh',
        icon: this.getIcon('branch'),
        href: '/src/pages/admin/chiNhanh.html'
      },
      {
        id: 'danhMuc',
        label: 'Danh mục',
        icon: this.getIcon('category'),
        href: '/src/pages/admin/danhMuc.html'
      },
      {
        id: 'donHang',
        label: 'Đơn hàng',
        icon: this.getIcon('orders'),
        href: '/src/pages/admin/donHang.html'
      },
      {
        id: 'donNhapHang',
        label: 'Đơn nhập hàng',
        icon: this.getIcon('import'),
        href: '/src/pages/admin/DonNhapHang.html'
      },
      {
        id: 'khachHang',
        label: 'Khách hàng',
        icon: this.getIcon('customers'),
        href: '/src/pages/admin/khachHang.html'
      },
      {
        id: 'khoHang',
        label: 'Kho hàng',
        icon: this.getIcon('warehouse'),
        href: '/src/pages/admin/khoHang.html'
      },
      {
        id: 'loHang',
        label: 'Lô hàng',
        icon: this.getIcon('batch'),
        href: '/src/pages/admin/loHang.html'
      },
      {
        id: 'nguoiDung',
        label: 'Người dùng',
        icon: this.getIcon('users'),
        href: '/src/pages/admin/nguoiDung.html'
      },
      {
        id: 'nhaCungCap',
        label: 'Nhà cung cấp',
        icon: this.getIcon('supplier'),
        href: '/src/pages/admin/NhaCungCap.html'
      },
      {
        id: 'thuoc',
        label: 'Thuốc',
        icon: this.getIcon('medicine'),
        href: '/src/pages/admin/thuoc.html'
      },
      {
        id: 'vaiTro',
        label: 'Vai trò',
        icon: this.getIcon('role'),
        href: '/src/pages/admin/vaiTro.html'
      }
    ];
  }

  getIcon(type) {
    const icons = {
      dashboard: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zM3 10a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6zM14 9a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-2z"/>
        </svg>
      `,
      report: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 2v10h2V5H4zm4 0v10h2V5H8zm4 0v10h2V5h-2z"/>
        </svg>
      `,
      branch: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 3a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V3zm2 2v10h10V5H5z"/>
        </svg>
      `,
      category: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z"/>
        </svg>
      `,
      orders: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 1a1 1 0 0 0 0 2h1.22l.305 1.222a.997.997 0 0 0 .01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 0 0 0-2H6.414l1-1H14a1 1 0 0 0 .894-.553l3-6A1 1 0 0 0 17 3H6.28l-.31-1.243A1 1 0 0 0 5 1H3zM16 16.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM6.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
        </svg>
      `,
      import: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
        </svg>
      `,
      customers: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
        </svg>
      `,
      warehouse: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 3a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V3zm2 0v14h10V3H5zm2 2h6v2H7V5zm0 4h6v2H7V9zm0 4h6v2H7v-2z"/>
        </svg>
      `,
      batch: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
        </svg>
      `,
      users: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0zM17 16a7 7 0 1 0-14 0h14zM3 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0z"/>
        </svg>
      `,
      supplier: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
        </svg>
      `,
      medicine: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.649 3.349a4.5 4.5 0 00-6.364 0l-8.586 8.586a4.5 4.5 0 106.364 6.364l8.586-8.586a4.5 4.5 0 000-6.364zM5.879 14.121a2.5 2.5 0 11-3.536-3.536l8.586-8.586a2.5 2.5 0 013.536 3.536l-8.586 8.586z"/>
        </svg>
      `,
      role: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"/>
        </svg>
      `
    };

    return icons[type] || icons.dashboard;
  }

  render() {
    return `
      <aside class="sidebar" id="sidebar">
        <nav class="nav-menu">
          ${this.config.menuItems.map(item => this.renderMenuItem(item)).join('')}
        </nav>
      </aside>
    `;
  }

  renderMenuItem(item) {
    const isActive = item.id === this.config.activeItem;
    
    return `
      <div class="nav-item ${isActive ? 'active' : ''}" data-nav-id="${item.id}" data-href="${item.href}">
        <div class="nav-icon">
          ${item.icon}
        </div>
        <span>${item.label}</span>
      </div>
    `;
  }

  attachEventListeners() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const navId = e.currentTarget.dataset.navId;
        const href = e.currentTarget.dataset.href;
        
        navItems.forEach(nav => nav.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        if (this.config.onItemClick) {
          this.config.onItemClick(navId, href);
        } else {
          if (href) {
            window.location.href = href;
          }
        }
      });
    });
  }

  setActiveItem(itemId) {
    this.config.activeItem = itemId;
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.dataset.navId === itemId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  addMenuItem(item, position = 'end') {
    if (position === 'start') {
      this.config.menuItems.unshift(item);
    } else {
      this.config.menuItems.push(item);
    }
    
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      const navMenu = sidebar.querySelector('.nav-menu');
      if (navMenu) {
        navMenu.innerHTML = this.config.menuItems.map(i => this.renderMenuItem(i)).join('');
        this.attachEventListeners();
      }
    }
  }

  removeMenuItem(itemId) {
    this.config.menuItems = this.config.menuItems.filter(item => item.id !== itemId);
    
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      const navMenu = sidebar.querySelector('.nav-menu');
      if (navMenu) {
        navMenu.innerHTML = this.config.menuItems.map(i => this.renderMenuItem(i)).join('');
        this.attachEventListeners();
      }
    }
  }

  destroy() {
    // Cleanup event listeners
  }
}