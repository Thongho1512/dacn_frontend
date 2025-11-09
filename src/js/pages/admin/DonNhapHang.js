/**
 * Đơn Nhập Hàng Management Page
 * Quản lý đơn nhập hàng - Tạo và xem danh sách
 */

import { Header } from '../../components/admin/header.js';
import { Sidebar } from '../../components/admin/sidebar.js';
import { Footer } from '../../components/admin/footer.js';
import { Modal } from '../../components/admin/modal.js';
import { Table } from '../../components/admin/table.js';
import { SearchBox } from '../../components/admin/searchBox.js';
import { requireAuth } from '../../api/authApi.js';
import { getAllDonNhapHangs, createDonNhapHang, getDonNhapHangById, getAllThuocs } from '../../api/donNhapHangApi.js';
import { getAllChiNhanhs } from '../../api/chiNhanhApi.js';
import { getAllNhaCungCaps } from '../api/nhaCungCapApi.js';

requireAuth();

// State
let importOrders = [];
let branches = [];
let suppliers = [];
let medicines = [];
let batchDetails = [];
let currentModal = null;
let currentPage = 1;
let pageSize = 10;
let totalCount = 0;

window.addEventListener('DOMContentLoaded', async () => {
  initializeLayout();
  await loadImportOrders();
  setupEventListeners();
});

// Store component instances globally for re-rendering
let header, sidebar, footer, searchBox;

function initializeLayout() {
  // Initialize header
  header = new Header({ 
    appTitle: 'Quản lý bán thuốc', 
    logoText: 'QT', 
    onMenuToggle: toggleMobileSidebar 
  });
  const headerEl = document.getElementById('header');
  if (headerEl) {
    headerEl.innerHTML = header.render();
    header.attachEventListeners();
  }

  // Initialize sidebar
  sidebar = new Sidebar({ activeItem: 'donnhaphang' });
  const sidebarEl = document.getElementById('sidebar-container');
  if (sidebarEl) {
    sidebarEl.innerHTML = sidebar.render();
    sidebar.attachEventListeners();
  }

  // Initialize footer
  footer = new Footer({ copyrightText: '© 2024 Quản lý bán thuốc.' });
  const footerEl = document.getElementById('footer');
  if (footerEl) {
    footerEl.innerHTML = footer.render();
  }

  // Initialize search box
  searchBox = new SearchBox({
    containerId: 'search-container',
    placeholder: 'Tìm kiếm đơn nhập hàng...',
    onSearch: handleSearch
  });
  const searchEl = document.getElementById('search-container');
  if (searchEl) {
    searchEl.innerHTML = searchBox.render();
    searchBox.attachEventListeners();
  }

  // Force initial render
  setTimeout(() => {
    document.getElementById('header')?.innerHTML = header.render();
    document.getElementById('sidebar-container')?.innerHTML = sidebar.render();
    document.getElementById('footer')?.innerHTML = footer.render();
  }, 0);
}

async function loadImportOrders() {
  try {
    showLoading(true);
    const response = await getAllDonNhapHangs({ pageNumber: currentPage, pageSize });
    
    if (response.success && response.data) {
      const { items, totalCount: total } = response.data;
      importOrders = items || [];
      totalCount = total || 0;
      renderImportOrdersTable();
    }
  } catch (error) {
    console.error('Failed to load import orders:', error);
    showNotification(error.message || 'Không thể tải danh sách đơn nhập hàng', 'error');
  } finally {
    showLoading(false);
  }
}

function renderImportOrdersTable() {
  const table = new Table({
    containerId: 'table-container',
    columns: [
      { field: 'id', label: 'Mã ĐNH', render: v => `<strong>#${v}</strong>` },
      { field: 'soDonNhap', label: 'Số đơn nhập', render: v => `<span style="color:#2563eb;">📄 ${v}</span>` },
      { field: 'tenNhaCungCap', label: 'Nhà cung cấp', render: v => v || 'N/A' },
      { field: 'tenChiNhanh', label: 'Chi nhánh' },
      { field: 'ngayNhap', label: 'Ngày nhập', render: v => formatDate(v) },
      { field: 'tongTien', label: 'Tổng tiền', render: v => `<strong style="color:#16a34a">${formatCurrency(v)}</strong>` },
      { 
        field: 'actions', 
        label: 'Hành động', 
        render: (_, r) => `
          <button class="btn btn-secondary btn-sm" onclick="window.viewImportOrder(${r.id})" title="Xem chi tiết">
            👁️ Xem
          </button>
        `
      }
    ],
    data: importOrders,
    itemsPerPage: pageSize,
    showPagination: false
  });

  table.render();
  renderPagination();
}

function renderPagination() {
  const container = document.getElementById('table-container');
  if (!container) return;

  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return;

  let html = `<div class="pagination">
    <button class="page-btn" onclick="window.goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.goToPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span>...</span>`;
    }
  }

  html += `<button class="page-btn" onclick="window.goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>›</button></div>`;
  container.insertAdjacentHTML('beforeend', html);
}

window.goToPage = async function(page) {
  const totalPages = Math.ceil(totalCount / pageSize);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  await loadImportOrders();
};

async function handleSearch(query) {
  currentPage = 1;
  await loadImportOrders();
}

async function openAddImportOrderModal() {
  batchDetails = [];
  
  await Promise.all([
    loadBranches(),
    loadSuppliers(),
    loadMedicines()
  ]);

  const template = document.getElementById('import-order-form-template');
  currentModal = new Modal({
    id: 'import-order-modal',
    title: '📦 Tạo đơn nhập hàng mới',
    content: template.innerHTML,
    size: 'large'
  });

  document.getElementById('modal-root').innerHTML = currentModal.render();
  currentModal.attachEventListeners();
  currentModal.open();
  
  populateDropdowns();
  setupFormEventListeners();
  addBatchDetail();
}

async function loadBranches() {
  const response = await getAllChiNhanhs({ pageNumber: 1, pageSize: 1000, active: true });
  branches = response.data?.items || [];
}

async function loadSuppliers() {
  const response = await getAllNhaCungCaps({ pageNumber: 1, pageSize: 1000, active: true });
  suppliers = response.data?.items || [];
}

async function loadMedicines() {
  const response = await getAllThuocs({ pageNumber: 1, pageSize: 1000, active: true });
  medicines = response.data?.items || [];
}

function populateDropdowns() {
  const branchSelect = document.getElementById('idchiNhanh');
  branches.forEach(b => {
    const option = document.createElement('option');
    option.value = b.id;
    option.textContent = b.tenChiNhanh;
    branchSelect.appendChild(option);
  });

  const supplierSelect = document.getElementById('idnhaCungCap');
  suppliers.forEach(s => {
    const option = document.createElement('option');
    option.value = s.id;
    option.textContent = s.tenNhaCungCap;
    supplierSelect.appendChild(option);
  });
}

function addBatchDetail() {
  const detailId = Date.now();
  const detail = {
    id: detailId,
    idthuoc: null,
    soLo: '',
    ngaySanXuat: '',
    ngayHetHan: '',
    soLuong: 1,
    giaNhap: 0,
    thanhTien: 0
  };
  
  batchDetails.push(detail);
  
  const container = document.querySelector('.batch-details-list');
  const itemHTML = `
    <div class="batch-detail-item" data-detail-id="${detailId}">
      <select class="form-select-small detail-medicine" data-detail-id="${detailId}" required>
        <option value="">-- Chọn thuốc --</option>
        ${medicines.map(m => `<option value="${m.id}">${m.tenThuoc}</option>`).join('')}
      </select>
      <input type="text" class="form-input-small detail-solo" data-detail-id="${detailId}" placeholder="Số lô" required />
      <input type="date" class="form-input-small detail-mfg" data-detail-id="${detailId}" required />
      <input type="date" class="form-input-small detail-exp" data-detail-id="${detailId}" required />
      <input type="number" class="form-input-small detail-quantity" data-detail-id="${detailId}" value="1" min="1" required />
      <input type="number" class="form-input-small detail-price" data-detail-id="${detailId}" value="0" min="0" step="1000" required />
      <input type="text" class="form-input-small detail-total" readonly value="0" />
      <button type="button" class="btn-remove" onclick="window.removeBatchDetail(${detailId})">✕</button>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', itemHTML);
  
  const medicineSelect = container.querySelector(`select[data-detail-id="${detailId}"]`);
  const quantityInput = container.querySelector(`input.detail-quantity[data-detail-id="${detailId}"]`);
  const priceInput = container.querySelector(`input.detail-price[data-detail-id="${detailId}"]`);
  const mfgInput = container.querySelector(`input.detail-mfg[data-detail-id="${detailId}"]`);
  const expInput = container.querySelector(`input.detail-exp[data-detail-id="${detailId}"]`);
  
  medicineSelect.addEventListener('change', () => handleDetailChange(detailId));
  quantityInput.addEventListener('input', () => handleDetailChange(detailId));
  priceInput.addEventListener('input', () => handleDetailChange(detailId));
  mfgInput.addEventListener('change', () => validateDates(detailId));
  expInput.addEventListener('change', () => validateDates(detailId));
}

function validateDates(detailId) {
  const container = document.querySelector(`[data-detail-id="${detailId}"]`);
  const mfgInput = container.querySelector('.detail-mfg');
  const expInput = container.querySelector('.detail-exp');
  
  const mfg = new Date(mfgInput.value);
  const exp = new Date(expInput.value);
  
  if (mfgInput.value && expInput.value && exp <= mfg) {
    expInput.setCustomValidity('Ngày hết hạn phải sau ngày sản xuất');
    showNotification('❌ Ngày hết hạn phải sau ngày sản xuất', 'error');
  } else {
    expInput.setCustomValidity('');
  }
}

function handleDetailChange(detailId) {
  const detail = batchDetails.find(d => d.id === detailId);
  if (!detail) return;
  
  const container = document.querySelector(`[data-detail-id="${detailId}"]`);
  const medicineSelect = container.querySelector('.detail-medicine');
  const soLoInput = container.querySelector('.detail-solo');
  const mfgInput = container.querySelector('.detail-mfg');
  const expInput = container.querySelector('.detail-exp');
  const quantityInput = container.querySelector('.detail-quantity');
  const priceInput = container.querySelector('.detail-price');
  const totalInput = container.querySelector('.detail-total');
  
  const price = parseFloat(priceInput.value) || 0;
  const quantity = parseInt(quantityInput.value) || 0;
  const total = price * quantity;
  
  detail.idthuoc = parseInt(medicineSelect.value) || null;
  detail.soLo = soLoInput.value;
  detail.ngaySanXuat = mfgInput.value;
  detail.ngayHetHan = expInput.value;
  detail.soLuong = quantity;
  detail.giaNhap = price;
  detail.thanhTien = total;
  
  totalInput.value = formatCurrency(total);
  
  calculateOrderSummary();
}

window.removeBatchDetail = function(detailId) {
  batchDetails = batchDetails.filter(d => d.id !== detailId);
  document.querySelector(`[data-detail-id="${detailId}"]`).remove();
  calculateOrderSummary();
};

function calculateOrderSummary() {
  const tongTien = batchDetails.reduce((sum, d) => sum + d.thanhTien, 0);
  document.getElementById('summary-total').textContent = formatCurrency(tongTien);
}

function setupFormEventListeners() {
  const form = document.getElementById('import-order-form');
  const addDetailBtn = document.getElementById('add-detail-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  
  form.addEventListener('submit', handleFormSubmit);
  addDetailBtn.addEventListener('click', addBatchDetail);
  cancelBtn.addEventListener('click', closeModal);
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  if (batchDetails.length === 0) {
    showNotification('❌ Vui lòng thêm ít nhất 1 lô hàng', 'error');
    return;
  }
  
  const invalidDetail = batchDetails.find(d => !d.idthuoc || !d.soLo || !d.ngaySanXuat || !d.ngayHetHan || d.soLuong <= 0 || d.giaNhap < 0);
  if (invalidDetail) {
    showNotification('❌ Vui lòng điền đầy đủ thông tin lô hàng', 'error');
    return;
  }
  
  const formData = new FormData(e.target);
  const data = {
    idchiNhanh: parseInt(formData.get('idchiNhanh')),
    idnhaCungCap: parseInt(formData.get('idnhaCungCap')),
    soDonNhap: formData.get('soDonNhap'),
    ngayNhap: formData.get('ngayNhap'),
    loHangs: batchDetails.map(d => ({
      idthuoc: d.idthuoc,
      soLo: d.soLo,
      ngaySanXuat: d.ngaySanXuat,
      ngayHetHan: d.ngayHetHan,
      soLuong: d.soLuong,
      giaNhap: d.giaNhap
    }))
  };
  
  setFormLoading(true);
  
  try {
    const response = await createDonNhapHang(data);
    
    if (response.success) {
      closeModal();
      showNotification('✅ Tạo đơn nhập hàng thành công! Kho hàng đã được cập nhật.', 'success');
      await loadImportOrders();
    }
  } catch (error) {
    showNotification(error.message || 'Không thể tạo đơn nhập hàng', 'error');
  } finally {
    setFormLoading(false);
  }
}

window.viewImportOrder = async function(orderId) {
  try {
    const response = await getDonNhapHangById(orderId);
    if (response.success && response.data) {
      const order = response.data;
      
      const detailsHTML = order.loHangs.map(d => `
        <tr>
          <td>${d.tenThuoc}</td>
          <td>${d.soLo}</td>
          <td>${formatDate(d.ngaySanXuat)}</td>
          <td>${formatDate(d.ngayHetHan)}</td>
          <td>${d.soLuong}</td>
          <td>${formatCurrency(d.giaNhap)}</td>
          <td><strong>${formatCurrency(d.thanhTien)}</strong></td>
        </tr>
      `).join('');
      
      const content = `
        <div style="padding: 20px;">
          <h3 style="margin-bottom: 16px;">📦 Chi tiết đơn nhập hàng #${order.id}</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
            <div><strong>Số đơn nhập:</strong> ${order.soDonNhap}</div>
            <div><strong>Nhà cung cấp:</strong> ${order.tenNhaCungCap}</div>
            <div><strong>Chi nhánh:</strong> ${order.tenChiNhanh}</div>
            <div><strong>Ngày nhập:</strong> ${formatDate(order.ngayNhap)}</div>
          </div>
          
          <h4 style="margin: 20px 0 12px;">Chi tiết lô hàng</h4>
          <table class="table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 12px; text-align: left;">Tên thuốc</th>
                <th style="padding: 12px; text-align: left;">Số lô</th>
                <th style="padding: 12px; text-align: left;">NSX</th>
                <th style="padding: 12px; text-align: left;">HSD</th>
                <th style="padding: 12px; text-align: left;">SL</th>
                <th style="padding: 12px; text-align: left;">Giá nhập</th>
                <th style="padding: 12px; text-align: left;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>${detailsHTML}</tbody>
          </table>
          
          <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px;">
              <span>Tổng tiền:</span>
              <strong style="color: #16a34a;">${formatCurrency(order.tongTien)}</strong>
            </div>
          </div>
        </div>
      `;
      
      const modal = new Modal({
        id: 'view-import-order-modal',
        title: '📦 Chi tiết đơn nhập hàng',
        content,
        size: 'large'
      });
      
      document.getElementById('modal-root').innerHTML = modal.render();
      modal.attachEventListeners();
      modal.open();
    }
  } catch (error) {
    showNotification('Không thể xem chi tiết đơn nhập hàng', 'error');
  }
};

function setFormLoading(isLoading) {
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn?.querySelector('.btn-text');
  const btnLoading = submitBtn?.querySelector('.btn-loading');
  const inputs = document.querySelectorAll('#import-order-form input, #import-order-form select, #import-order-form button');

  if (isLoading) {
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    inputs.forEach(input => input.disabled = true);
  } else {
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
    inputs.forEach(input => input.disabled = false);
  }
}

function closeModal() {
  if (currentModal) {
    currentModal.close();
    currentModal = null;
  }
  batchDetails = [];
}

function toggleMobileSidebar() {
  document.getElementById('sidebar-container')?.classList.toggle('mobile-open');
  document.getElementById('sidebar-overlay')?.classList.toggle('active');
}

function setupEventListeners() {
  document.getElementById('add-import-order-btn')?.addEventListener('click', openAddImportOrderModal);
  document.getElementById('sidebar-overlay')?.addEventListener('click', toggleMobileSidebar);

  // Force re-render components to ensure they're displayed
  document.getElementById('header')?.innerHTML = header.render();
  document.getElementById('sidebar-container')?.innerHTML = sidebar.render();
  document.getElementById('footer')?.innerHTML = footer.render();
}

function showLoading(show) {
  const el = document.getElementById('table-container');
  if (el) el.style.opacity = show ? '0.5' : '1';
}

function showNotification(msg) {
  alert(msg);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}

function formatDate(date) {
  if (!date) return '-';
  if (typeof date === 'string') {
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
  }
  if (date.year && date.month && date.day) {
    const d = new Date(date.year, date.month - 1, date.day);
    return d.toLocaleDateString('vi-VN');
  }
  return '-';
}