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
import { getAllDonNhapHangs, createDonNhapHang, getDonNhapHangById, getAllThuocs, updateDonNhapHang, deleteDonNhapHang } from '../../api/donNhapHangApi.js';
import { getAllChiNhanhs } from '../../api/chiNhanhApi.js';
import { getAllNhaCungCaps } from '../../api/nhaCungCapApi.js';

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
let currentEditingOrderId = null;

window.addEventListener('DOMContentLoaded', async () => {
  initializeLayout();
  await loadImportOrders();
  setupEventListeners();
});

function initializeLayout() {
  // Initialize header
  const header = new Header({ 
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
  const sidebar = new Sidebar({ activeItem: 'donnhaphang' });
  const sidebarEl = document.getElementById('sidebar-container');
  if (sidebarEl) {
    sidebarEl.innerHTML = sidebar.render();
    sidebar.attachEventListeners();
  }

  // Initialize footer
  const footer = new Footer({ copyrightText: '© 2024 Quản lý bán thuốc.' });
  const footerEl = document.getElementById('footer');
  if (footerEl) {
    footerEl.innerHTML = footer.render();
  }

  // Initialize search box
  const searchBox = new SearchBox({
    containerId: 'search-container',
    placeholder: 'Tìm kiếm đơn nhập hàng...',
    onSearch: handleSearch
  });
  const searchEl = document.getElementById('search-container');
  if (searchEl) {
    searchEl.innerHTML = searchBox.render();
    searchBox.attachEventListeners();
  }
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
          <div class="actions">
            <button class="btn btn-secondary btn-sm" onclick="window.viewImportOrder(${r.id})" title="Xem chi tiết">
              👁️ Xem
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.editImportOrder(${r.id})" title="Chỉnh sửa">
              ✏️ Sửa
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.deleteImportOrder(${r.id})" title="Xóa">
              🗑️ Xóa
            </button>
          </div>
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
  if (branchSelect) {
    branches.forEach(b => {
      const option = document.createElement('option');
      option.value = b.id;
      option.textContent = b.tenChiNhanh;
      branchSelect.appendChild(option);
    });
  }

  const supplierSelect = document.getElementById('idnhaCungCap');
  if (supplierSelect) {
    suppliers.forEach(s => {
      const option = document.createElement('option');
      option.value = s.id;
      option.textContent = s.tenNhaCungCap;
      supplierSelect.appendChild(option);
    });
  }
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
  if (!container) return;
  
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
  const soLoInput = container.querySelector(`input.detail-solo[data-detail-id="${detailId}"]`);
  const quantityInput = container.querySelector(`input.detail-quantity[data-detail-id="${detailId}"]`);
  const priceInput = container.querySelector(`input.detail-price[data-detail-id="${detailId}"]`);
  const mfgInput = container.querySelector(`input.detail-mfg[data-detail-id="${detailId}"]`);
  const expInput = container.querySelector(`input.detail-exp[data-detail-id="${detailId}"]`);
  
  if (medicineSelect) medicineSelect.addEventListener('change', () => handleDetailChange(detailId));
  if (soLoInput) soLoInput.addEventListener('input', () => handleDetailChange(detailId));
  if (quantityInput) quantityInput.addEventListener('input', () => handleDetailChange(detailId));
  if (priceInput) priceInput.addEventListener('input', () => handleDetailChange(detailId));
  if (mfgInput) mfgInput.addEventListener('change', () => validateDates(detailId));
  if (expInput) expInput.addEventListener('change', () => validateDates(detailId));
}

function validateDates(detailId) {
  const container = document.querySelector(`[data-detail-id="${detailId}"]`);
  if (!container) return;
  
  const mfgInput = container.querySelector('.detail-mfg');
  const expInput = container.querySelector('.detail-exp');
  
  if (!mfgInput || !expInput) return;
  
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
  if (!container) return;
  
  const medicineSelect = container.querySelector('.detail-medicine');
  const soLoInput = container.querySelector('.detail-solo');
  const mfgInput = container.querySelector('.detail-mfg');
  const expInput = container.querySelector('.detail-exp');
  const quantityInput = container.querySelector('.detail-quantity');
  const priceInput = container.querySelector('.detail-price');
  const totalInput = container.querySelector('.detail-total');
  
  const price = parseFloat(priceInput?.value) || 0;
  const quantity = parseInt(quantityInput?.value) || 0;
  const total = price * quantity;
  
  detail.idthuoc = parseInt(medicineSelect?.value) || null;
  detail.soLo = soLoInput?.value || '';
  detail.ngaySanXuat = mfgInput?.value || '';
  detail.ngayHetHan = expInput?.value || '';
  detail.soLuong = quantity;
  detail.giaNhap = price;
  detail.thanhTien = total;
  
  if (totalInput) {
    totalInput.value = formatCurrency(total);
  }
  
  calculateOrderSummary();
}

window.removeBatchDetail = function(detailId) {
  batchDetails = batchDetails.filter(d => d.id !== detailId);
  const element = document.querySelector(`[data-detail-id="${detailId}"]`);
  if (element) {
    element.remove();
  }
  calculateOrderSummary();
};

function calculateOrderSummary() {
  const tongTien = batchDetails.reduce((sum, d) => sum + d.thanhTien, 0);
  const summaryTotal = document.getElementById('summary-total');
  if (summaryTotal) {
    summaryTotal.textContent = formatCurrency(tongTien);
  }
}

function setupFormEventListeners() {
  const form = document.getElementById('import-order-form');
  const addDetailBtn = document.getElementById('add-detail-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  
  if (form) form.addEventListener('submit', handleFormSubmit);
  if (addDetailBtn) addDetailBtn.addEventListener('click', addBatchDetail);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
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
  
  setFormLoading(true);
  
  try {
    if (currentEditingOrderId) {
      // Update mode
      const data = {
        idnhaCungCap: parseInt(formData.get('idnhaCungCap')),
        soDonNhap: formData.get('soDonNhap'),
        ngayNhap: formData.get('ngayNhap'),
        loHangs: batchDetails.map(d => ({
          id: d.dbId || null,
          idthuoc: d.idthuoc,
          soLo: d.soLo,
          ngaySanXuat: d.ngaySanXuat,
          ngayHetHan: d.ngayHetHan,
          soLuong: d.soLuong,
          giaNhap: d.giaNhap
        }))
      };
      
      const response = await updateDonNhapHang(currentEditingOrderId, data);
      
      if (response.success) {
        closeModal();
        showNotification('✅ Cập nhật đơn nhập hàng thành công!', 'success');
        await loadImportOrders();
      }
    } else {
      // Create mode
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
      
      const response = await createDonNhapHang(data);
      
      if (response.success) {
        closeModal();
        showNotification('✅ Tạo đơn nhập hàng thành công! Kho hàng đã được cập nhật.', 'success');
        await loadImportOrders();
      }
    }
  } catch (error) {
    showNotification(error.message || 'Không thể lưu đơn nhập hàng', 'error');
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

window.editImportOrder = async function(orderId) {
  try {
    const response = await getDonNhapHangById(orderId);
    if (response.success && response.data) {
      const order = response.data;
      currentEditingOrderId = orderId;
      batchDetails = order.loHangs.map((d, idx) => ({
        id: idx + 1000,
        idthuoc: d.idthuoc,
        soLo: d.soLo,
        ngaySanXuat: d.ngaySanXuat,
        ngayHetHan: d.ngayHetHan,
        soLuong: d.soLuong,
        giaNhap: d.giaNhap,
        thanhTien: d.thanhTien,
        dbId: d.id
      }));

      await Promise.all([
        loadBranches(),
        loadSuppliers(),
        loadMedicines()
      ]);

      const template = document.getElementById('import-order-form-template');
      currentModal = new Modal({
        id: 'import-order-modal',
        title: '✏️ Cập nhật đơn nhập hàng',
        content: template.innerHTML,
        size: 'large'
      });

      document.getElementById('modal-root').innerHTML = currentModal.render();
      currentModal.attachEventListeners();
      currentModal.open();
      
      populateDropdowns();
      fillEditForm(order);
      renderBatchDetailsForEdit();
      setupFormEventListeners();
    }
  } catch (error) {
    showNotification(error.message || 'Không thể tải đơn nhập hàng', 'error');
  }
};

function fillEditForm(order) {
  document.getElementById('idchiNhanh').value = order.idchiNhanh;
  document.getElementById('idnhaCungCap').value = order.idnhaCungCap;
  document.getElementById('soDonNhap').value = order.soDonNhap;
  document.getElementById('ngayNhap').value = formatDateForInput(order.ngayNhap);
  document.getElementById('submit-btn').innerHTML = '<span class="btn-text">💾 Cập nhật</span><span class="btn-loading" style="display: none;"><span class="spinner"></span> Đang xử lý...</span>';
}

function renderBatchDetailsForEdit() {
  const container = document.querySelector('.batch-details-list');
  if (!container) return;

  container.innerHTML = '';
  
  batchDetails.forEach(detail => {
    const itemHTML = `
      <div class="batch-detail-item" data-detail-id="${detail.id}">
        <select class="form-select-small detail-medicine" data-detail-id="${detail.id}" required>
          <option value="">-- Chọn thuốc --</option>
          ${medicines.map(m => `<option value="${m.id}" ${m.id === detail.idthuoc ? 'selected' : ''}>${m.tenThuoc}</option>`).join('')}
        </select>
        <input type="text" class="form-input-small detail-solo" data-detail-id="${detail.id}" placeholder="Số lô" value="${detail.soLo}" required />
        <input type="date" class="form-input-small detail-mfg" data-detail-id="${detail.id}" value="${formatDateForInput(detail.ngaySanXuat)}" required />
        <input type="date" class="form-input-small detail-exp" data-detail-id="${detail.id}" value="${formatDateForInput(detail.ngayHetHan)}" required />
        <input type="number" class="form-input-small detail-quantity" data-detail-id="${detail.id}" value="${detail.soLuong}" min="1" required />
        <input type="number" class="form-input-small detail-price" data-detail-id="${detail.id}" value="${detail.giaNhap}" min="0" step="1000" required />
        <input type="text" class="form-input-small detail-total" readonly value="${formatCurrency(detail.thanhTien)}" />
        <button type="button" class="btn-remove" onclick="window.removeBatchDetail(${detail.id})">✕</button>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', itemHTML);
    
    const medicineSelect = container.querySelector(`select[data-detail-id="${detail.id}"]`);
    const soLoInput = container.querySelector(`input.detail-solo[data-detail-id="${detail.id}"]`);
    const quantityInput = container.querySelector(`input.detail-quantity[data-detail-id="${detail.id}"]`);
    const priceInput = container.querySelector(`input.detail-price[data-detail-id="${detail.id}"]`);
    const mfgInput = container.querySelector(`input.detail-mfg[data-detail-id="${detail.id}"]`);
    const expInput = container.querySelector(`input.detail-exp[data-detail-id="${detail.id}"]`);
    
    if (medicineSelect) medicineSelect.addEventListener('change', () => handleDetailChange(detail.id));
    if (soLoInput) soLoInput.addEventListener('input', () => handleDetailChange(detail.id));
    if (quantityInput) quantityInput.addEventListener('input', () => handleDetailChange(detail.id));
    if (priceInput) priceInput.addEventListener('input', () => handleDetailChange(detail.id));
    if (mfgInput) mfgInput.addEventListener('change', () => validateDates(detail.id));
    if (expInput) expInput.addEventListener('change', () => validateDates(detail.id));
  });
}

function formatDateForInput(dateValue) {
  if (!dateValue) return '';
  
  let date;
  if (typeof dateValue === 'string') {
    date = new Date(dateValue);
  } else if (dateValue.year && dateValue.month && dateValue.day) {
    date = new Date(dateValue.year, dateValue.month - 1, dateValue.day);
  } else {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

window.deleteImportOrder = async function(orderId) {
  if (!confirm('🗑️ Bạn có chắc chắn muốn xóa đơn nhập hàng này?')) return;
  
  try {
    showLoading(true);
    await deleteDonNhapHang(orderId);
    showNotification('✅ Xóa đơn nhập hàng thành công', 'success');
    await loadImportOrders();
  } catch (error) {
    showNotification(error.message || 'Không thể xóa đơn nhập hàng', 'error');
  } finally {
    showLoading(false);
  }
};

function setFormLoading(isLoading) {
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn?.querySelector('.btn-text');
  const btnLoading = submitBtn?.querySelector('.btn-loading');
  const inputs = document.querySelectorAll('#import-order-form input, #import-order-form select, #import-order-form button');

  if (isLoading) {
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'inline-flex';
    inputs.forEach(input => input.disabled = true);
  } else {
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnLoading) btnLoading.style.display = 'none';
    inputs.forEach(input => input.disabled = false);
  }
}

function closeModal() {
  if (currentModal) {
    currentModal.close();
    currentModal = null;
  }
  batchDetails = [];
  currentEditingOrderId = null;
}

function toggleMobileSidebar() {
  document.getElementById('sidebar-container')?.classList.toggle('mobile-open');
  document.getElementById('sidebar-overlay')?.classList.toggle('active');
}

function setupEventListeners() {
  const addBtn = document.getElementById('add-import-order-btn');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (addBtn) addBtn.addEventListener('click', openAddImportOrderModal);
  if (overlay) overlay.addEventListener('click', toggleMobileSidebar);
}

function showLoading(show) {
  const el = document.getElementById('table-container');
  if (el) el.style.opacity = show ? '0.5' : '1';
}

function showNotification(msg, type) {
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