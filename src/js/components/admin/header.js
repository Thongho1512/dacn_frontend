/**
 * Header Component
 * Renders the application header with logo, notifications, and user profile
 */

import { getUserFromToken } from '../../utils/token.js';
import { logout } from '../../api/authApi.js';

export class Header {
  constructor(config = {}) {
    this.config = {
      appTitle: config.appTitle || 'AdminPro',
      logoText: config.logoText || 'A',
      showNotifications: config.showNotifications !== false,
      showProfile: config.showProfile !== false,
      onMenuToggle: config.onMenuToggle || null,
      ...config
    };
    
    this.user = getUserFromToken();
  }

  render() {
    const userInfo = this.user ? {
      name: this.user.name || 'John Doe',
      role: this.user.role || 'Administrator',
      initials: this.getUserInitials(this.user.name || 'John Doe')
    } : {
      name: 'Guest',
      role: 'Visitor',
      initials: 'G'
    };

    return `
      <header class="header">
        <div class="logo">
          <div class="logo-icon">${this.config.logoText}</div>
          <span id="app-title">${this.config.appTitle}</span>
        </div>
        
        <div class="header-right">
          <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle menu">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 5a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1zM3 10a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1zM3 15a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1z"/>
            </svg>
          </button>
          
          ${this.config.showNotifications ? this.renderNotifications() : ''}
          ${this.config.showProfile ? this.renderUserProfile(userInfo) : ''}
        </div>
      </header>
    `;
  }

  renderNotifications() {
    return `
      <div class="notification-icon" id="notification-btn" role="button" aria-label="Notifications">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 2a6 6 0 0 1 6 6v3.586l1.707 1.707A1 1 0 0 1 17 15H3a1 1 0 0 1-.707-1.707L4 11.586V8a6 6 0 0 1 6-6z"/>
          <path d="M9 17a1 1 0 0 0 2 0"/>
        </svg>
        <div class="notification-badge"></div>
      </div>
    `;
  }

  renderUserProfile(userInfo) {
    return `
      <div class="user-profile" id="user-profile-btn" role="button" aria-label="User profile">
        <div class="user-avatar">${userInfo.initials}</div>
        <div class="user-info">
          <div class="user-name">${userInfo.name}</div>
          <div class="user-role">${userInfo.role}</div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const userProfileBtn = document.getElementById('user-profile-btn');
    const notificationBtn = document.getElementById('notification-btn');

    if (menuBtn && this.config.onMenuToggle) {
      menuBtn.addEventListener('click', this.config.onMenuToggle);
    }

    if (userProfileBtn) {
      userProfileBtn.addEventListener('click', this.handleUserProfileClick.bind(this));
    }

    if (notificationBtn) {
      notificationBtn.addEventListener('click', this.handleNotificationClick.bind(this));
    }
  }

  handleUserProfileClick() {
    this.showUserMenu();
  }

  handleNotificationClick() {
    console.log('Notifications clicked');
  }

  showUserMenu() {
    const existingMenu = document.getElementById('user-menu-dropdown');
    if (existingMenu) {
      existingMenu.remove();
      return;
    }

    const dropdown = document.createElement('div');
    dropdown.id = 'user-menu-dropdown';
    dropdown.className = 'user-menu-dropdown';
    dropdown.innerHTML = `
      <div class="user-menu-item" data-action="profile">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
        </svg>
        <span>Profile</span>
      </div>
      <div class="user-menu-item" data-action="settings">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
          <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z"/>
        </svg>
        <span>Settings</span>
      </div>
      <div class="user-menu-divider"></div>
      <div class="user-menu-item" data-action="logout">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
          <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
        </svg>
        <span>Logout</span>
      </div>
    `;

    const userProfileBtn = document.getElementById('user-profile-btn');
    userProfileBtn.style.position = 'relative';
    userProfileBtn.appendChild(dropdown);

    dropdown.querySelectorAll('.user-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleMenuAction(action);
        dropdown.remove();
      });
    });

    setTimeout(() => {
      document.addEventListener('click', function closeDropdown(e) {
        if (!userProfileBtn.contains(e.target)) {
          dropdown.remove();
          document.removeEventListener('click', closeDropdown);
        }
      });
    }, 0);
  }

  handleMenuAction(action) {
    switch (action) {
      case 'profile':
        window.location.href = '/pages/profile.html';
        break;
      case 'settings':
        window.location.href = '/pages/settings.html';
        break;
      case 'logout':
        this.handleLogout();
        break;
      default:
        console.log('Unknown action:', action);
    }
  }

  async handleLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      await logout();
    }
  }

  getUserInitials(name) {
    if (!name) return 'U';
    
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  updateTitle(title) {
    const titleElement = document.getElementById('app-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  destroy() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (menuBtn && this.config.onMenuToggle) {
      menuBtn.removeEventListener('click', this.config.onMenuToggle);
    }
  }
}