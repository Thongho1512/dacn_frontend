/**
 * UserForm Component
 * Form for creating/editing users
 * Matches backend CreateNguoiDungDto and UpdateNguoiDungDto
 */

export class UserForm {
  constructor(config = {}) {
    this.config = {
      formId: config.formId || 'user-form',
      mode: config.mode || 'create', // create or edit
      userData: config.userData || null,
      onSubmit: config.onSubmit || null,
      onCancel: config.onCancel || null,
      ...config
    };
  }

  render() {
    const isEditMode = this.config.mode === 'edit';
    const userData = this.config.userData || {};

    return `
      <form id="${this.config.formId}" class="user-form">
        <!-- Tên đăng nhập -->
        <div class="form-group">
          <label class="form-label" for="${this.config.formId}-tenDangNhap">
            Tên đăng nhập <span class="required">*</span>
          </label>
          <input 
            type="text" 
            class="form-input" 
            id="${this.config.formId}-tenDangNhap" 
            name="tenDangNhap"
            value="${userData.tenDangNhap || ''}"
            placeholder="Nhập tên đăng nhập"
            required
          />
        </div>

        <!-- Họ tên -->
        <div class="form-group">
          <label class="form-label" for="${this.config.formId}-hoTen">
            Họ và tên <span class="required">*</span>
          </label>
          <input 
            type="text" 
            class="form-input" 
            id="${this.config.formId}-hoTen" 
            name="hoTen"
            value="${userData.hoTen || ''}"
            placeholder="Nhập họ và tên"
            required
          />
        </div>

        <!-- Mật khẩu -->
        <div class="form-group">
          <label class="form-label" for="${this.config.formId}-matKhau">
            Mật khẩu <span class="required">*</span>
          </label>
          <input 
            type="password" 
            class="form-input" 
            id="${this.config.formId}-matKhau" 
            name="matKhau"
            value="${userData.matKhau || ''}"
            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
          />
        </div>

        <!-- Vai trò -->
        <div class="form-group">
          <label class="form-label" for="${this.config.formId}-idvaiTro">
            Vai trò <span class="required">*</span>
          </label>
          <select 
            class="form-select" 
            id="${this.config.formId}-idvaiTro" 
            name="idvaiTro"
            required
          >
            <option value="">Chọn vai trò</option>
            <option value="1" ${userData.idvaiTro === 1 ? 'selected' : ''}>Admin</option>
            <option value="2" ${userData.idvaiTro === 2 ? 'selected' : ''}>User</option>
          </select>
        </div>

        <!-- Chi nhánh -->
        <div class="form-group">
          <label class="form-label" for="${this.config.formId}-idchiNhanh">
            Chi nhánh <span class="required">*</span>
          </label>
          <input 
            type="number" 
            class="form-input" 
            id="${this.config.formId}-idchiNhanh" 
            name="idchiNhanh"
            value="${userData.idchiNhanh || ''}"
            placeholder="Nhập ID chi nhánh"
          />
        </div>

        <!-- Trạng thái -->
        <div class="form-group">
          <label class="form-label" for="${this.config.formId}-trangThai">
            Trạng thái <span class="required">*</span>
          </label>
          <select 
            class="form-select"
            id="${this.config.formId}-trangThai"
            name="trangThai"
            required
          >
            <option value="true" ${userData.trangThai === true ? 'selected' : ''}>Hoạt động</option>
            <option value="false" ${userData.trangThai === false ? 'selected' : ''}>Ngừng hoạt động</option>
          </select>
        </div>

        <!-- Ngày tạo -->
        <div class="form-group">
          <label class="form-label" for="${this.config.formId}-ngayTao">
            Ngày tạo
          </label>
          <input 
            type="text"
            class="form-input"
            id="${this.config.formId}-ngayTao"
            name="ngayTao"
            value="${userData.ngayTao || new Date().toISOString().split('T')[0]}"
            readonly
          />
        </div>

        <!-- Buttons -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="${this.config.formId}-cancel">
            Hủy
          </button>
          <button type="submit" class="btn btn-primary" id="${this.config.formId}-submit">
            <span class="btn-text">${isEditMode ? 'Cập nhật' : 'Tạo mới'}</span>
            <span class="btn-loading" style="display: none;">
              <span class="loading-spinner"></span> Đang xử lý...
            </span>
          </button>
        </div>
      </form>
    `;
  }

  attachEventListeners() {
    const form = document.getElementById(this.config.formId);
    const cancelBtn = document.getElementById(`${this.config.formId}-cancel`);

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (this.config.onCancel) {
          this.config.onCancel();
        }
      });
    }
  }

  async handleSubmit() {
    const form = document.getElementById(this.config.formId);
    if (!form) return;

    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      if (['idvaiTro', 'idchiNhanh'].includes(key)) {
        data[key] = parseInt(value);
      } else if (key === 'trangThai') {
        data[key] = value === 'true';
      } else if (key === 'ngayTao') {
        data[key] = value;
      } else {
        data[key] = value.trim();
      }
    }

    console.log('Form data to submit:', data);

    if (!this.validate(data)) {
      return;
    }

    this.setLoadingState(true);
    try {
      if (this.config.onSubmit) {
        await this.config.onSubmit(data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showError(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      this.setLoadingState(false);
    }
  }

  validate(data) {
    if (!data.tenDangNhap || data.tenDangNhap.length < 3) {
      this.showError('Tên đăng nhập phải có ít nhất 3 ký tự');
      return false;
    }

    if (!data.hoTen || data.hoTen.length < 2) {
      this.showError('Họ tên phải có ít nhất 2 ký tự');
      return false;
    }

    if (!data.matKhau || data.matKhau.length < 6) {
      this.showError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (!data.idvaiTro || isNaN(data.idvaiTro)) {
      this.showError('Vui lòng chọn vai trò');
      return false;
    }

    if (!data.idchiNhanh || isNaN(data.idchiNhanh)) {
      this.showError('Vui lòng nhập ID chi nhánh hợp lệ');
      return false;
    }

    if (data.trangThai === null || data.trangThai === undefined) {
      this.showError('Vui lòng chọn trạng thái');
      return false;
    }

    return true;
  }

  setLoadingState(isLoading) {
    const submitBtn = document.getElementById(`${this.config.formId}-submit`);
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoading = submitBtn?.querySelector('.btn-loading');
    const inputs = document.querySelectorAll(`#${this.config.formId} input, #${this.config.formId} select`);

    if (isLoading) {
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.style.display = 'none';
      if (btnLoading) btnLoading.style.display = 'inline-flex';
      inputs.forEach(input => input.disabled = true);
    } else {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoading) btnLoading.style.display = 'none';
      inputs.forEach(input => {
        if (input.name !== 'ngayTao') {
          input.disabled = false;
        }
      });
    }
  }

  showError(message) {
    alert(message);
  }

  reset() {
    const form = document.getElementById(this.config.formId);
    if (form) form.reset();
  }

  destroy() {
    const form = document.getElementById(this.config.formId);
    if (form) form.remove();
  }
}
