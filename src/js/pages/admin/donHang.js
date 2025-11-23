/**
 * Đơn Hàng Management Page
 * Quản lý đơn hàng với tính năng điểm tích lũy
 */

import { Header } from '../../components/admin/header.js';
import { Sidebar } from '../../components/admin/sidebar.js';
import { Footer } from '../../components/admin/footer.js';
import { Modal } from '../../components/admin/modal.js';
import { Table } from '../../components/admin/table.js';
import { SearchBox } from '../../components/admin/searchBox.js';
import { requireAuth } from '../../api/authApi.js';
import { getAllDonHangs, createDonHang, deleteDonHang, getDonHangById, updateDonHang } from '../../api/donHangApi.js';
import { getAllKhachHangs } from '../../api/khachHangApi.js';
import { getAllChiNhanhs } from '../../api/chiNhanhApi.js';
import { getAllPhuongThucThanhToans } from '../../api/PhuongThucThanhToanApi.js';
import { getAllThuoc, getThuocByChiNhanh } from '../../api/thuocApi.js';

requireAuth();

// State
let orders = [];
let customers = [];
let branches = [];
let paymentMethods = [];
let medicines = [];
let orderDetails = [];
let currentModal = null;
let currentPage = 1;
let pageSize = 10;
let totalCount = 0;
let currentBranchId = null;
let currentEditingOrderId = null;

// Constants
const DIEM_TO_VND = 1000; // 1 điểm = 1,000 VNĐ
const VND_TO_DIEM = 10000; // 10,000 VNĐ = 1 điểm
const MIN_POINTS_USE = 10; // Tối thiểu 10 điểm mới dùng được
const MAX_DISCOUNT_PERCENT = 0.5; // Giảm tối đa 50%

window.addEventListener('DOMContentLoaded', async () => {
  initializeLayout();
  await loadOrders();
  setupEventListeners();
});

function initializeLayout() {
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

  const sidebar = new Sidebar({ activeItem: 'donhang' });
  const sidebarEl = document.getElementById('sidebar-container');
  if (sidebarEl) {
    sidebarEl.innerHTML = sidebar.render();
    sidebar.attachEventListeners();
  }

  const footer = new Footer({ copyrightText: '© 2024 Quản lý bán thuốc.' });
  const footerEl = document.getElementById('footer');
  if (footerEl) {
    footerEl.innerHTML = footer.render();
  }

  const searchBox = new SearchBox({
    containerId: 'search-container',
    placeholder: 'Tìm kiếm đơn hàng...',
    onSearch: handleSearch
  });
  const searchEl = document.getElementById('search-container');
  if (searchEl) {
    searchEl.innerHTML = searchBox.render();
    searchBox.attachEventListeners();
  }
}

async function loadOrders() {
  try {
    showLoading(true);
    const response = await getAllDonHangs({ pageNumber: currentPage, pageSize, active: true });
    
    if (response.success && response.data) {
      const { items, totalCount: total } = response.data;
      orders = items || [];
      totalCount = total || 0;
      renderOrdersTable();
    }
  } catch (error) {
    console.error('Failed to load orders:', error);
    showNotification(error.message || 'Không thể tải danh sách đơn hàng', 'error');
  } finally {
    showLoading(false);
  }
}

function renderOrdersTable() {
  const table = new Table({
    containerId: 'table-container',
    columns: [
      { field: 'id', label: 'Mã ĐH', render: v => `<strong>#${v}</strong>` },
      { field: 'tenKhachHang', label: 'Khách hàng', render: v => v || '<em style="color:#94a3b8;">Khách vãng lai</em>' },
      { field: 'tenChiNhanh', label: 'Chi nhánh' },
      { field: 'tongTien', label: 'Tổng tiền', render: v => formatCurrency(v) },
      { field: 'tienGiamGia', label: 'Giảm giá', render: v => v ? `<span style="color:#ef4444">-${formatCurrency(v)}</span>` : '0 ₫' },
      { field: 'thanhTien', label: 'Thành tiền', render: v => `<strong style="color:#16a34a">${formatCurrency(v)}</strong>` },
      { field: 'ngayTao', label: 'Ngày tạo', render: v => formatDate(v) },
      { 
        field: 'actions', 
        label: 'Hành động', 
        render: (_, r) => `
          <div class="actions">
            <button class="btn btn-secondary btn-sm" onclick="window.viewOrder(${r.id})" title="Xem chi tiết">
              👁️ Xem
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.editOrder(${r.id})" title="Chỉnh sửa">
              ✏️ Sửa
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.deleteOrder(${r.id})" title="Xóa">
              🗑️ Xóa
            </button>
          </div>
        `
      }
    ],
    data: orders,
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
  await loadOrders();
};

async function handleSearch(query) {
  currentPage = 1;
  await loadOrders();
}

async function openAddOrderModal() {
  orderDetails = [];
  
  await Promise.all([
    loadCustomers(),
    loadBranches(),
    loadPaymentMethods(),
    loadMedicines()
  ]);

  const template = document.getElementById('order-form-template');
  currentModal = new Modal({
    id: 'order-modal',
    title: '🛒 Tạo đơn hàng mới',
    content: template.innerHTML,
    size: 'large'
  });

  document.getElementById('modal-root').innerHTML = currentModal.render();
  currentModal.attachEventListeners();
  currentModal.open();
  
  populateDropdowns();
  setupFormEventListeners();
  addOrderDetail();
}

async function loadCustomers() {
  const response = await getAllKhachHangs({ pageNumber: 1, pageSize: 1000, active: true });
  customers = response.data?.items || [];
}

async function loadBranches() {
  const response = await getAllChiNhanhs({ pageNumber: 1, pageSize: 1000, active: true });
  branches = response.data?.items || [];
}

async function loadPaymentMethods() {
  const response = await getAllPhuongThucThanhToans();
  paymentMethods = response.data || [];
}

async function loadMedicines(branchId = null) {
  try{
    let response;

    if(branchId){
      // lấy thuốc theo chi nhánh
      response = await getThuocByChiNhanh(branchId, {
        pageNumber: 1,
        pageSize: 1000,
        active: true
      });
    } else {
      response = await getAllThuoc({
        pageNumber: 1,
        pageSize: 1000,
        active: true
      });
    }

    medicines = response.data?.items || [];
    updateMedicineDropdowns();
  } catch (error) {
    console.error('Failed to load medicines:', error);
    medicines = [];
    showNotification('Không thể tải danh sách thuốc', 'error');
  }
}

function updateMedicineDropdowns() {
  const allMedicineSelects = document.querySelectorAll('.detail-medicine');

  allMedicineSelects.forEach(select => {
    const currentValue = select.value;

    // xóa các option cũ
    while (select.options.length > 1){
      select.remove(1);
    }

    // Thêm các thuốc mới
    medicines.forEach(m => {
      const option = document.createElement('option');
      option.value = m.id;
      option.textContent = `${m.tenThuoc} - ${formatCurrency(m.giaBan)}`;
      option.dataset.price = m.giaBan;
      select.appendChild(option);
    });
    
    // Khôi phục giá trị đã chọn nếu còn tồn tại
    if (currentValue && medicines.find(m => m.id == currentValue)) {
      select.value = currentValue;
    }
  })
}

function populateDropdowns() {
  const customerSelect = document.getElementById('idkhachHang');
  customers.forEach(c => {
    const option = document.createElement('option');
    option.value = c.id;
    option.textContent = `${c.tenKhachHang} - ${c.sdt} (${c.diemTichLuy || 0} điểm)`;
    option.dataset.points = c.diemTichLuy || 0;
    customerSelect.appendChild(option);
  });

  customerSelect.addEventListener('change', handleCustomerChange);

  const branchSelect = document.getElementById('idchiNhanh');
  branches.forEach(b => {
    const option = document.createElement('option');
    option.value = b.id;
    option.textContent = b.tenChiNhanh;
    branchSelect.appendChild(option);
  });

  branchSelect.addEventListener('change', handleBranchChange);

  const paymentSelect = document.getElementById('idphuongThucTt');
  paymentMethods.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.tenPhuongThuc;
    paymentSelect.appendChild(option);
  });
}

async function handleBranchChange(e){
  const branchId = e.target.value;
  const warningDiv = document.getElementById('branch-warning');

  if (!branchId) {
    // hiển thị cảnh báo
    if(warningDiv) warningDiv.style.display = 'block';
    // Nếu không chọn chi nhánh, xóa tất cả chi tiết đơn hàng
    orderDetails = [];
    document.querySelector('.order-details-list').innerHTML = `
      <div class="order-detail-item order-detail-header">
        <div>Thuốc</div>
        <div>Số lượng</div>
        <div>Đơn giá (VNĐ)</div>
        <div>Thành tiền</div>
        <div></div>
      </div>
    `;
    medicines = [];
    currentBranchId = null;
    calculateOrderSummary();
    return;
  }

  // Ẩn cảnh báo khi đã chọn chi nhánh
  if(warningDiv) warningDiv.style.display = 'none';
  
  // Hiển thị loading
  const medicineSelects = document.querySelectorAll('.detail-medicine');
  medicineSelects.forEach(select => {
    select.disabled = true;
    select.innerHTML = '<option value="">Đang tải...</option>';
  });
  
  try {
    currentBranchId = parseInt(branchId);
    
    // Tải lại danh sách thuốc theo chi nhánh
    await loadMedicines(currentBranchId);
    
    if (medicines.length === 0) {
      showNotification('⚠️ Chi nhánh này chưa có thuốc nào có tồn kho', 'warning');
    } else {
      showNotification(`✅ Đã tải ${medicines.length} thuốc có sẵn tại chi nhánh này`, 'success');
    }
    
  } catch (error) {
    console.error('Error loading medicines by branch:', error);
    showNotification('❌ Không thể tải danh sách thuốc của chi nhánh', 'error');
    medicines = [];
    currentBranchId = null;
  } finally {
    // Enable lại các select
    medicineSelects.forEach(select => {
      select.disabled = false;
    });
  }
}

function handleCustomerChange(e) {
  const selectedOption = e.target.selectedOptions[0];
  const points = parseInt(selectedOption?.dataset?.points || 0);
  
  const pointsDisplay = document.getElementById('customer-points-display');
  const currentPointsSpan = document.getElementById('current-points');
  
  if (e.target.value && points > 0) {
    pointsDisplay.style.display = 'block';
    currentPointsSpan.textContent = points.toLocaleString('vi-VN');
  } else {
    pointsDisplay.style.display = 'none';
  }
  
  calculateOrderSummary();
}

function addOrderDetail() {
  

  const detailId = Date.now();
  const detail = {
    id: detailId,
    idthuoc: null,
    soLuong: 1,
    donGia: 0,
    thanhTien: 0
  };
  
  orderDetails.push(detail);
  
  const container = document.querySelector('.order-details-list');
  const itemHTML = `
    <div class="order-detail-item" data-detail-id="${detailId}">
      <select class="form-select-small detail-medicine" data-detail-id="${detailId}" required>
        <option value="">-- Chọn thuốc --</option>
        ${medicines.map(m => `<option value="${m.id}" data-price="${m.giaBan}">${m.tenThuoc} - ${formatCurrency(m.giaBan)}</option>`).join('')}
      </select>
      <input type="number" class="form-input-small detail-quantity" data-detail-id="${detailId}" value="1" min="1" required />
      <input type="text" class="form-input-small detail-price" readonly value="0" />
      <input type="text" class="form-input-small detail-total" readonly value="0" />
      <button type="button" class="btn-remove" onclick="window.removeOrderDetail(${detailId})">✕</button>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', itemHTML);
  
  const medicineSelect = container.querySelector(`select[data-detail-id="${detailId}"]`);
  const quantityInput = container.querySelector(`input.detail-quantity[data-detail-id="${detailId}"]`);
  
  medicineSelect.addEventListener('change', () => handleDetailChange(detailId));
  quantityInput.addEventListener('input', () => handleDetailChange(detailId));
}

function handleDetailChange(detailId) {
  const detail = orderDetails.find(d => d.id === detailId);
  if (!detail) return;
  
  const container = document.querySelector(`[data-detail-id="${detailId}"]`);
  const medicineSelect = container.querySelector('.detail-medicine');
  const quantityInput = container.querySelector('.detail-quantity');
  const priceInput = container.querySelector('.detail-price');
  const totalInput = container.querySelector('.detail-total');
  
  const selectedOption = medicineSelect.selectedOptions[0];
  const price = parseFloat(selectedOption?.dataset?.price || 0);
  const quantity = parseInt(quantityInput.value) || 0;
  const total = price * quantity;
  
  detail.idthuoc = parseInt(medicineSelect.value) || null;
  detail.soLuong = quantity;
  detail.donGia = price;
  detail.thanhTien = total;
  
  priceInput.value = formatCurrency(price);
  totalInput.value = formatCurrency(total);
  
  calculateOrderSummary();
}

window.removeOrderDetail = function(detailId) {
  orderDetails = orderDetails.filter(d => d.id !== detailId);
  document.querySelector(`[data-detail-id="${detailId}"]`).remove();
  calculateOrderSummary();
};

function calculateOrderSummary() {
  const tongTien = orderDetails.reduce((sum, d) => sum + d.thanhTien, 0);
  
  const customerSelect = document.getElementById('idkhachHang');
  const selectedOption = customerSelect?.selectedOptions[0];
  const customerPoints = parseInt(selectedOption?.dataset?.points || 0);
  
  let tienGiamGia = 0;
  let diemSuDung = 0;
  
  if (customerPoints >= MIN_POINTS_USE) {
    const maxDiscount = tongTien * MAX_DISCOUNT_PERCENT;
    const maxPointsCanUse = Math.floor(maxDiscount / DIEM_TO_VND);
    diemSuDung = Math.min(customerPoints, maxPointsCanUse);
    tienGiamGia = diemSuDung * DIEM_TO_VND;
  }
  
  const thanhTien = tongTien - tienGiamGia;
  
  document.getElementById('summary-total').textContent = formatCurrency(tongTien);
  document.getElementById('summary-discount').textContent = formatCurrency(tienGiamGia);
  document.getElementById('summary-points-used').textContent = `${diemSuDung} điểm`;
  document.getElementById('summary-final').textContent = formatCurrency(thanhTien);
}

function setupFormEventListeners() {
  const form = document.getElementById('order-form');
  const addDetailBtn = document.getElementById('add-detail-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  
  console.log('🔗 Setting up form event listeners');
  console.log('Form element:', form);
  console.log('Add detail btn:', addDetailBtn);
  console.log('Cancel btn:', cancelBtn);
  
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
    console.log('✅ Form submit listener attached');
  } else {
    console.error('❌ Form element not found!');
  }
  
  if (addDetailBtn) {
    addDetailBtn.addEventListener('click', addOrderDetail);
    console.log('✅ Add detail btn listener attached');
  } else {
    console.error('❌ Add detail btn not found!');
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
    console.log('✅ Cancel btn listener attached');
  } else {
    console.error('❌ Cancel btn not found!');
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  console.log('🔍 Form submit triggered');
  console.log('📦 orderDetails:', orderDetails);
  
  if (orderDetails.length === 0) {
    showNotification('❌ Vui lòng thêm ít nhất 1 sản phẩm', 'error');
    return;
  }
  
  const invalidDetail = orderDetails.find(d => !d.idthuoc || d.soLuong <= 0);
  if (invalidDetail) {
    console.log('❌ Invalid detail found:', invalidDetail);
    showNotification('❌ Vui lòng điền đầy đủ thông tin chi tiết đơn hàng', 'error');
    return;
  }
  
  const formData = new FormData(e.target);
  
  setFormLoading(true);
  
  try {
    if (currentEditingOrderId) {
      // Update mode
      const data = {
        idkhachHang: formData.get('idkhachHang') ? parseInt(formData.get('idkhachHang')) : null,
        idphuongThucTt: parseInt(formData.get('idphuongThucTt')),
        chiTietDonHangs: orderDetails.map(d => ({
          id: d.dbId || null,
          idthuoc: d.idthuoc,
          soLuong: d.soLuong,
          donGia: d.donGia
        }))
      };

      console.log('📝 Updating order data:', data);
      
      const response = await updateDonHang(currentEditingOrderId, data);
      
      console.log('✅ API Response:', response);
      
      if (response.success) {
        closeModal();
        showNotification('✅ Cập nhật đơn hàng thành công!', 'success');
        await loadOrders();
      } else {
        showNotification('❌ ' + (response.message || 'Không thể cập nhật đơn hàng'), 'error');
      }
    } else {
      // Create mode
      const data = {
        idkhachHang: formData.get('idkhachHang') ? parseInt(formData.get('idkhachHang')) : null,
        idchiNhanh: parseInt(formData.get('idchiNhanh')),
        idphuongThucTt: parseInt(formData.get('idphuongThucTt')),
        chiTietDonHangs: orderDetails.map(d => ({
          idthuoc: d.idthuoc,
          soLuong: d.soLuong,
          donGia: d.donGia
        }))
      };
      
      console.log('📝 Submitting order data:', data);
      
      const response = await createDonHang(data);
      
      console.log('✅ API Response:', response);
      
      if (response.success) {
        closeModal();
        showNotification('✅ Tạo đơn hàng thành công!', 'success');
        await loadOrders();
      } else {
        showNotification('❌ ' + (response.message || 'Không thể tạo đơn hàng'), 'error');
      }
    }
  } catch (error) {
    console.error('❌ Error creating/updating order:', error);
    showNotification(error.message || 'Không thể lưu đơn hàng', 'error');
  } finally {
    setFormLoading(false);
  }
}

window.viewOrder = async function(orderId) {
  try {
    const response = await getDonHangById(orderId);
    if (response.success && response.data) {
      const order = response.data;
      
      const detailsHTML = order.chiTietDonHangs.map(d => `
        <tr>
          <td>${d.tenThuoc}</td>
          <td>${d.soLuong}</td>
          <td>${formatCurrency(d.donGia)}</td>
          <td><strong>${formatCurrency(d.thanhTien)}</strong></td>
        </tr>
      `).join('');
      
      const content = `
        <div style="padding: 20px;">
          <h3 style="margin-bottom: 16px;">📋 Thông tin đơn hàng #${order.id}</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
            <div><strong>Khách hàng:</strong> ${order.tenKhachHang || 'Khách vãng lai'}</div>
            <div><strong>Chi nhánh:</strong> ${order.tenChiNhanh}</div>
            <div><strong>Ngày tạo:</strong> ${formatDate(order.ngayTao)}</div>
            <div><strong>Thanh toán:</strong> ${order.tenPhuongThucTt}</div>
          </div>
          
          <h4 style="margin: 20px 0 12px;">Chi tiết sản phẩm</h4>
          <table class="table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 12px; text-align: left;">Tên thuốc</th>
                <th style="padding: 12px; text-align: left;">SL</th>
                <th style="padding: 12px; text-align: left;">Đơn giá</th>
                <th style="padding: 12px; text-align: left;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>${detailsHTML}</tbody>
          </table>
          
          <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
              <span>Tổng tiền:</span>
              <strong>${formatCurrency(order.tongTien)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; color: #ef4444;">
              <span>Giảm giá:</span>
              <strong>-${formatCurrency(order.tienGiamGia || 0)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #cbd5e1; font-size: 18px;">
              <span>Thành tiền:</span>
              <strong style="color: #16a34a;">${formatCurrency(order.thanhTien)}</strong>
            </div>
          </div>
        </div>
      `;
      
      const modal = new Modal({
        id: 'view-order-modal',
        title: '🛒 Chi tiết đơn hàng',
        content,
        size: 'large'
      });
      
      document.getElementById('modal-root').innerHTML = modal.render();
      modal.attachEventListeners();
      modal.open();
    }
  } catch (error) {
    showNotification('Không thể xem chi tiết đơn hàng', 'error');
  }
};

window.editOrder = async function(orderId) {
  try {
    const response = await getDonHangById(orderId);
    if (response.success && response.data) {
      const order = response.data;
      currentEditingOrderId = orderId;

      // Load data
      await Promise.all([
        loadCustomers(),
        loadBranches(),
        loadPaymentMethods(),
        loadMedicines()
      ]);

      // Build order details from response
      orderDetails = order.chiTietDonHangs.map((d, idx) => ({
        id: idx + 2000,
        idthuoc: d.idthuoc,
        soLuong: d.soLuong,
        donGia: d.donGia,
        thanhTien: d.thanhTien,
        dbId: d.id
      }));

      const template = document.getElementById('order-form-template');
      currentModal = new Modal({
        id: 'order-modal',
        title: '✏️ Cập nhật đơn hàng',
        content: template.innerHTML,
        size: 'large'
      });

      document.getElementById('modal-root').innerHTML = currentModal.render();
      currentModal.attachEventListeners();
      currentModal.open();
      
      populateDropdowns();
      fillOrderEditForm(order);
      renderOrderDetailsForEdit();
      setupFormEventListeners();
    }
  } catch (error) {
    showNotification(error.message || 'Không thể tải đơn hàng', 'error');
  }
};

function fillOrderEditForm(order) {
  document.getElementById('idkhachHang').value = order.idkhachHang || '';
  document.getElementById('idchiNhanh').value = order.idchiNhanh;
  document.getElementById('idphuongThucTt').value = order.idphuongThucTt;
  document.getElementById('submit-btn').innerHTML = '<span class="btn-text">💾 Cập nhật</span><span class="btn-loading" style="display: none;"><span class="spinner"></span> Đang xử lý...</span>';
  
  currentBranchId = order.idchiNhanh;
}

function renderOrderDetailsForEdit() {
  const container = document.querySelector('.order-details-list');
  if (!container) return;

  container.innerHTML = '';
  
  orderDetails.forEach(detail => {
    const itemHTML = `
      <div class="order-detail-item" data-detail-id="${detail.id}">
        <select class="form-select-small detail-medicine" data-detail-id="${detail.id}" required>
          <option value="">-- Chọn thuốc --</option>
          ${medicines.map(m => `<option value="${m.id}" data-price="${m.giaBan}" ${m.id === detail.idthuoc ? 'selected' : ''}>${m.tenThuoc} - ${formatCurrency(m.giaBan)}</option>`).join('')}
        </select>
        <input type="number" class="form-input-small detail-quantity" data-detail-id="${detail.id}" value="${detail.soLuong}" min="1" required />
        <input type="text" class="form-input-small detail-price" readonly value="${formatCurrency(detail.donGia)}" />
        <input type="text" class="form-input-small detail-total" readonly value="${formatCurrency(detail.thanhTien)}" />
        <button type="button" class="btn-remove" onclick="window.removeOrderDetail(${detail.id})">✕</button>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', itemHTML);
    
    const medicineSelect = container.querySelector(`select[data-detail-id="${detail.id}"]`);
    const quantityInput = container.querySelector(`input.detail-quantity[data-detail-id="${detail.id}"]`);
    
    if (medicineSelect) medicineSelect.addEventListener('change', () => handleDetailChange(detail.id));
    if (quantityInput) quantityInput.addEventListener('input', () => handleDetailChange(detail.id));
  });
};

window.deleteOrder = async function(orderId) {
  if (!confirm('🗑️ Bạn có chắc chắn muốn xóa đơn hàng này?')) return;
  
  try {
    showLoading(true);
    await deleteDonHang(orderId);
    showNotification('✅ Xóa đơn hàng thành công', 'success');
    await loadOrders();
  } catch (error) {
    showNotification(error.message || 'Không thể xóa đơn hàng', 'error');
  } finally {
    showLoading(false);
  }
};

function setFormLoading(isLoading) {
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn?.querySelector('.btn-text');
  const btnLoading = submitBtn?.querySelector('.btn-loading');
  const inputs = document.querySelectorAll('#order-form input, #order-form select, #order-form button');

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
  orderDetails = [];
  currentEditingOrderId = null;
}

function toggleMobileSidebar() {
  document.getElementById('sidebar-container')?.classList.toggle('mobile-open');
  document.getElementById('sidebar-overlay')?.classList.toggle('active');
}

function setupEventListeners() {
  document.getElementById('add-order-btn')?.addEventListener('click', openAddOrderModal);
  document.getElementById('sidebar-overlay')?.addEventListener('click', toggleMobileSidebar);
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