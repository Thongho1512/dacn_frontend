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
        id: 'dashboard',
        label: 'Dashboard',
        icon: this.getIcon('dashboard'),
        href: '/pages/index.html'
      },
      {
        id: 'users',
        label: 'User Management',
        icon: this.getIcon('users'),
        href: '/pages/users.html'
      },
      {
        id: 'products',
        label: 'Products',
        icon: this.getIcon('products'),
        href: '/pages/products.html'
      },
      {
        id: 'orders',
        label: 'Orders',
        icon: this.getIcon('orders'),
        href: '/pages/orders.html'
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: this.getIcon('settings'),
        href: '/pages/settings.html'
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
      users: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0zM17 16a7 7 0 1 0-14 0h14zM3 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0z"/>
        </svg>
      `,
      products: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zM3 10a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>
        </svg>
      `,
      orders: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 1a1 1 0 0 0 0 2h1.22l.305 1.222a.997.997 0 0 0 .01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 0 0 0-2H6.414l1-1H14a1 1 0 0 0 .894-.553l3-6A1 1 0 0 0 17 3H6.28l-.31-1.243A1 1 0 0 0 5 1H3zM16 16.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM6.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
        </svg>
      `,
      settings: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 0 1-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 0 1 .947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 0 1 2.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 0 1 2.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 0 1 .947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 0 1-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 0 1-2.287-.947zM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
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