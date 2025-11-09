import { Header } from '../../components/admin/header.js';
import { Sidebar } from '../../components/admin/sidebar.js';
import { Footer } from '../../components/admin/footer.js';
import { Modal } from '../../components/admin/modal.js';
import { Table } from '../../components/admin/table.js';
import { SearchBox } from '../../components/admin/searchBox.js';
import { requireAuth } from '../../api/authApi.js';
import { getAllDanhMucs, createDanhMuc, updateDanhMuc, deleteDanhMuc } from '../../api/danhMucApi.js';

// Xác thực đăng nhập
requireAuth();

// State
let categories = [];
let filteredCategories = [];
let currentModal = null;
let searchBox = null;
let currentEditingCategoryId = null;

window.addEventListener('DOMContentLoaded', async () => {
  initializeLayout();
  await loadCategories();
  setupEventListeners();
});

// ---------------- Layout ----------------
function initializeLayout() {
  const header = new Header({ appTitle: 'Quản lý bán thuốc', logoText: 'QT', onMenuToggle: toggleMobileSidebar });
  document.getElementById('header').innerHTML = header.render();
  header.attachEventListeners();

  const sidebar = new Sidebar({
    activeItem: 'danhMuc'
  });
  document.getElementById('sidebar-container').innerHTML = sidebar.render();
  sidebar.attachEventListeners();

  const footer = new Footer({ copyrightText: '© 2024 Quản lý bán thuốc.', });
  document.getElementById('footer').innerHTML = footer.render();

  searchBox = new SearchBox({
    containerId: 'search-container',
    placeholder: 'Tìm kiếm theo tên danh mục...',
    onSearch: handleSearch
  });
  document.getElementById('search-container').innerHTML = searchBox.render();
  searchBox.attachEventListeners();
}

// ---------------- Load data ----------------
async function loadCategories() {
  try {
    showLoading(true);
    const response = await getAllDanhMucs();
    categories = response.data || [];
    filteredCategories = [...categories];
    renderCategoriesTable();
  } catch (err) {
    showNotification(err.message || 'Không thể tải danh sách danh mục', 'error');
  } finally {
    showLoading(false);
  }
}

// ---------------- Render table ----------------
function renderCategoriesTable() {
  const table = new Table({
    containerId: 'table-container',
    columns: [
      { field: 'id', label: 'ID' },
      { field: 'tenDanhMuc', label: 'Tên danh mục' },
      { field: 'moTa', label: 'Mô tả' },
      { field: 'trangThai', label: 'Trạng thái', render: v => v ? '🟢 Hoạt động' : '🔴 Ngừng' },
      { field: 'actions', label: 'Hành động', render: (_, r) => `
          <button class="btn btn-secondary btn-sm" onclick="window.editCategory(${r.id})">Sửa</button>
          <button class="btn btn-danger btn-sm" onclick="window.deleteCategory(${r.id})">Xóa</button>` }
    ],
    data: filteredCategories,
    itemsPerPage: 10,
    showPagination: true
  });
  table.render();
}

// ---------------- Search ----------------
function handleSearch(query) {
  const q = query.toLowerCase().trim();
  filteredCategories = q
    ? categories.filter(c => c.tenDanhMuc?.toLowerCase().includes(q) || c.moTa?.toLowerCase().includes(q))
    : [...categories];
  renderCategoriesTable();
}

// ---------------- Add/Edit ----------------
window.editCategory = function (id) {
  const cat = categories.find(c => c.id === id);
  openCategoryModal(cat);
};

document.getElementById('add-category-btn')?.addEventListener('click', () => openCategoryModal(null));

function openCategoryModal(category = null) {
  currentEditingCategoryId = category ? category.id : null;
  const template = document.getElementById('category-form-template');
  const modal = new Modal({
    id: 'category-modal',
    title: category ? '✏️ Cập nhật danh mục' : '➕ Thêm danh mục mới',
    content: template.innerHTML,
    size: 'medium'
  });
  document.getElementById('modal-root').innerHTML = modal.render();
  modal.attachEventListeners();
  modal.open();
  setupForm(category);
}

function setupForm(category) {
  const form = document.getElementById('category-form');
  if (!form) return;

  if (category) {
    form.tenDanhMuc.value = category.tenDanhMuc;
    form.moTa.value = category.moTa || '';
    form.trangThai.value = category.trangThai ? 'true' : 'false';
  }

  form.addEventListener('submit', handleFormSubmit);
  document.getElementById('cancel-btn').addEventListener('click', closeModal);
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  data.trangThai = data.trangThai === 'true';

  try {
    if (currentEditingCategoryId) await updateDanhMuc(currentEditingCategoryId, data);
    else await createDanhMuc(data);
    closeModal();
    await loadCategories();
    showNotification('✅ Lưu danh mục thành công', 'success');
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

// ---------------- Delete ----------------
window.deleteCategory = async function (id) {
  const cat = categories.find(c => c.id === id);
  if (!confirm(`🗑️ Bạn có chắc muốn xóa "${cat?.tenDanhMuc}"?`)) return;
  try {
    await deleteDanhMuc(id);
    await loadCategories();
    showNotification('✅ Xóa thành công', 'success');
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

// ---------------- Helpers ----------------
function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
}
function showNotification(msg) { alert(msg); }
function showLoading(show) {
  const el = document.getElementById('table-container');
  el.style.opacity = show ? '0.5' : '1';
}
function toggleMobileSidebar() {
  document.getElementById('sidebar-container').classList.toggle('mobile-open');
  document.getElementById('sidebar-overlay').classList.toggle('active');
}
function setupEventListeners() {
  document.getElementById('sidebar-overlay')?.addEventListener('click', toggleMobileSidebar);
}
