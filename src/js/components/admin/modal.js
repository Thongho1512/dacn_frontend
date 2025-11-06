/**
 * Modal Component
 * Reusable modal dialog component
 */

export class Modal {
  constructor(config = {}) {
    this.config = {
      id: config.id || 'modal',
      title: config.title || 'Modal',
      content: config.content || '',
      footer: config.footer || null,
      size: config.size || 'medium', // small, medium, large
      onOpen: config.onOpen || null,
      onClose: config.onClose || null,
      closeOnOverlay: config.closeOnOverlay !== false,
      ...config
    };

    this.isOpen = false;
  }

  render() {
    const sizeClass = `modal--${this.config.size}`;
    
    return `
      <div class="modal-overlay" id="${this.config.id}-overlay" role="dialog" aria-modal="true">
        <div class="modal ${sizeClass}">
          <div class="modal-header">
            <h2 class="modal-title" id="${this.config.id}-title">${this.config.title}</h2>
            <button class="close-btn" id="${this.config.id}-close" aria-label="Close modal">×</button>
          </div>
          <div class="modal-body" id="${this.config.id}-body">
            ${this.config.content}
          </div>
          ${this.config.footer ? `
            <div class="modal-footer" id="${this.config.id}-footer">
              ${this.config.footer}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const overlay = document.getElementById(`${this.config.id}-overlay`);
    const closeBtn = document.getElementById(`${this.config.id}-close`);

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    if (overlay && this.config.closeOnOverlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target.id === `${this.config.id}-overlay`) {
          this.close();
        }
      });
    }

    // ESC key to close
    this.escKeyHandler = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    };
    document.addEventListener('keydown', this.escKeyHandler);
  }

  open() {
    const overlay = document.getElementById(`${this.config.id}-overlay`);
    if (overlay) {
      overlay.classList.add('active');
      this.isOpen = true;
      document.body.style.overflow = 'hidden'; // Prevent body scroll

      if (this.config.onOpen) {
        this.config.onOpen();
      }
    }
  }

  close() {
    const overlay = document.getElementById(`${this.config.id}-overlay`);
    if (overlay) {
      overlay.classList.remove('active');
      this.isOpen = false;
      document.body.style.overflow = ''; // Restore body scroll

      if (this.config.onClose) {
        this.config.onClose();
      }
    }
  }

  setTitle(title) {
    const titleElement = document.getElementById(`${this.config.id}-title`);
    if (titleElement) {
      titleElement.textContent = title;
      this.config.title = title;
    }
  }

  setContent(content) {
    const bodyElement = document.getElementById(`${this.config.id}-body`);
    if (bodyElement) {
      bodyElement.innerHTML = content;
      this.config.content = content;
    }
  }

  setFooter(footer) {
    const footerElement = document.getElementById(`${this.config.id}-footer`);
    if (footerElement) {
      footerElement.innerHTML = footer;
      this.config.footer = footer;
    }
  }

  destroy() {
    this.close();
    document.removeEventListener('keydown', this.escKeyHandler);
    
    const overlay = document.getElementById(`${this.config.id}-overlay`);
    if (overlay) {
      overlay.remove();
    }
  }
}