/**
 * SearchBox Component
 * Reusable search input with debounce
 */

export class SearchBox {
  constructor(config = {}) {
    this.config = {
      containerId: config.containerId || 'search-container',
      placeholder: config.placeholder || 'Search...',
      debounceTime: config.debounceTime || 300,
      onSearch: config.onSearch || null,
      ...config
    };

    this.debounceTimer = null;
  }

  render() {
    return `
      <div class="search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
        <input 
          type="text" 
          class="search-input" 
          id="search-input-${this.config.containerId}" 
          placeholder="${this.config.placeholder}"
          autocomplete="off"
        />
      </div>
    `;
  }

  attachEventListeners() {
    const input = document.getElementById(`search-input-${this.config.containerId}`);
    
    if (input) {
      input.addEventListener('input', (e) => {
        this.handleInput(e.target.value);
      });

      // Clear search on ESC
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          input.value = '';
          this.handleInput('');
        }
      });
    }
  }

  handleInput(value) {
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      if (this.config.onSearch) {
        this.config.onSearch(value.trim());
      }
    }, this.config.debounceTime);
  }

  getValue() {
    const input = document.getElementById(`search-input-${this.config.containerId}`);
    return input ? input.value : '';
  }

  setValue(value) {
    const input = document.getElementById(`search-input-${this.config.containerId}`);
    if (input) {
      input.value = value;
    }
  }

  clear() {
    this.setValue('');
    if (this.config.onSearch) {
      this.config.onSearch('');
    }
  }

  destroy() {
    clearTimeout(this.debounceTimer);
  }
}