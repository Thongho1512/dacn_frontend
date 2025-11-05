/**
 * Table Component
 * Reusable data table with pagination
 */

export class Table {
  constructor(config = {}) {
    this.config = {
      containerId: config.containerId || 'table-container',
      columns: config.columns || [],
      data: config.data || [],
      itemsPerPage: config.itemsPerPage || 10,
      showPagination: config.showPagination !== false,
      emptyMessage: config.emptyMessage || 'No data available',
      onRowClick: config.onRowClick || null,
      renderCell: config.renderCell || null,
      ...config
    };

    this.currentPage = 1;
    this.filteredData = [...this.config.data];
  }

  render() {
    const container = document.getElementById(this.config.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              ${this.config.columns.map(col => `
                <th>${col.label}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody id="${this.config.containerId}-tbody">
            ${this.renderRows()}
          </tbody>
        </table>
      </div>
      ${this.config.showPagination ? `
        <div class="pagination" id="${this.config.containerId}-pagination">
          ${this.renderPagination()}
        </div>
      ` : ''}
    `;

    this.attachEventListeners();
  }

  renderRows() {
    const start = (this.currentPage - 1) * this.config.itemsPerPage;
    const end = start + this.config.itemsPerPage;
    const pageData = this.filteredData.slice(start, end);

    if (pageData.length === 0) {
      return `
        <tr>
          <td colspan="${this.config.columns.length}">
            <div class="empty-state">
              <div class="empty-state-icon">📋</div>
              <div class="empty-state-text">${this.config.emptyMessage}</div>
            </div>
          </td>
        </tr>
      `;
    }

    return pageData.map((row, index) => `
      <tr data-row-index="${start + index}" ${this.config.onRowClick ? 'style="cursor: pointer;"' : ''}>
        ${this.config.columns.map(col => `
          <td>${this.renderCellContent(row, col)}</td>
        `).join('')}
      </tr>
    `).join('');
  }

  renderCellContent(row, column) {
    if (this.config.renderCell) {
      const customContent = this.config.renderCell(row, column);
      if (customContent !== undefined) {
        return customContent;
      }
    }

    const value = row[column.field];
    
    if (column.render) {
      return column.render(value, row);
    }

    return value || '';
  }

  renderPagination() {
    const totalPages = Math.ceil(this.filteredData.length / this.config.itemsPerPage);

    if (totalPages <= 1) {
      return '';
    }

    let html = `
      <button class="page-btn" data-action="prev" ${this.currentPage === 1 ? 'disabled' : ''}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M8.5 3.5L5 7l3.5 3.5"/>
        </svg>
      </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        html += `<span style="padding: 0 4px; color: #94a3b8;">...</span>`;
      }
    }

    html += `
      <button class="page-btn" data-action="next" ${this.currentPage === totalPages ? 'disabled' : ''}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M5.5 3.5L9 7l-3.5 3.5"/>
        </svg>
      </button>
    `;

    return html;
  }

  attachEventListeners() {
    // Row click events
    if (this.config.onRowClick) {
      const rows = document.querySelectorAll(`#${this.config.containerId}-tbody tr[data-row-index]`);
      rows.forEach(row => {
        row.addEventListener('click', (e) => {
          const index = parseInt(e.currentTarget.dataset.rowIndex);
          this.config.onRowClick(this.filteredData[index], index);
        });
      });
    }

    // Pagination events
    const paginationContainer = document.getElementById(`${this.config.containerId}-pagination`);
    if (paginationContainer) {
      paginationContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.page-btn');
        if (!btn || btn.disabled) return;

        const action = btn.dataset.action;
        const page = btn.dataset.page;

        if (action === 'prev') {
          this.goToPage(this.currentPage - 1);
        } else if (action === 'next') {
          this.goToPage(this.currentPage + 1);
        } else if (page) {
          this.goToPage(parseInt(page));
        }
      });
    }
  }

  goToPage(page) {
    const totalPages = Math.ceil(this.filteredData.length / this.config.itemsPerPage);
    if (page < 1 || page > totalPages) return;

    this.currentPage = page;
    this.updateTable();
  }

  updateTable() {
    const tbody = document.getElementById(`${this.config.containerId}-tbody`);
    const pagination = document.getElementById(`${this.config.containerId}-pagination`);

    if (tbody) {
      tbody.innerHTML = this.renderRows();
    }

    if (pagination) {
      pagination.innerHTML = this.renderPagination();
    }

    this.attachEventListeners();
  }

  setData(data) {
    this.config.data = data;
    this.filteredData = [...data];
    this.currentPage = 1;
    this.updateTable();
  }

  filter(filterFn) {
    this.filteredData = this.config.data.filter(filterFn);
    this.currentPage = 1;
    this.updateTable();
  }

  resetFilter() {
    this.filteredData = [...this.config.data];
    this.currentPage = 1;
    this.updateTable();
  }

  destroy() {
    const container = document.getElementById(this.config.containerId);
    if (container) {
      container.innerHTML = '';
    }
  }
}