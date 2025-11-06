/**
 * Footer Component
 * Renders the application footer with copyright and version info
 */

export class Footer {
  constructor(config = {}) {
    this.config = {
      copyrightText: config.copyrightText || `© ${new Date().getFullYear()} AdminPro. All rights reserved.`,
      versionText: config.versionText || 'Version 1.0.0',
      showLinks: config.showLinks !== false,
      links: config.links || [],
      ...config
    };
  }

  render() {
    return `
      <footer class="footer">
        <div class="footer-left">
          <span id="copyright-text">${this.config.copyrightText}</span>
          ${this.config.showLinks && this.config.links.length > 0 ? this.renderLinks() : ''}
        </div>
        <div class="footer-right">
          <span id="version-text">${this.config.versionText}</span>
        </div>
      </footer>
    `;
  }

  renderLinks() {
    return `
      <div class="footer-links">
        ${this.config.links.map(link => `
          <a href="${link.href}" class="footer-link" ${link.external ? 'target="_blank" rel="noopener noreferrer"' : ''}>
            ${link.label}
          </a>
        `).join('')}
      </div>
    `;
  }

  attachEventListeners() {
    // Add any footer-specific event listeners if needed
  }

  updateCopyright(text) {
    const copyrightElement = document.getElementById('copyright-text');
    if (copyrightElement) {
      copyrightElement.textContent = text;
      this.config.copyrightText = text;
    }
  }

  updateVersion(text) {
    const versionElement = document.getElementById('version-text');
    if (versionElement) {
      versionElement.textContent = text;
      this.config.versionText = text;
    }
  }

  destroy() {
    // Cleanup if needed
  }
}