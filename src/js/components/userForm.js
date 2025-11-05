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
            ${isEditMode ? 'readonly' : ''}
            required
          />
        </div>

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

        ${!isEditMode ? `
          <div class="form-group">
            <label class="form-label" for="${this.config.formId}-matKhau">
              Mật khẩu <span class="required">*</span>
            </label>
            <input 
              type="password" 
              class="form-input" 
              id="${this.config.formId}-matKhau" 
              name="matKhau"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              required
            />
          </div>
        ` : ''}

        <div class="form-group">
          <label class="form-label" for="${this.config.formId}-idvaiTro">
            Vai trò
          </label>
          <select 
            class="form-select" 
            id="${this.config.formId}-idvaiTro" 
            name="idvaiTro"
          >
            <option value="">Chọn vai trò (mặc định: USER)</option>
            <option value="1" ${userData.idvaiTro === 1 ? 'selected' : ''}>Admin</option>
            <option value="2" ${userData.idvaiTro === 2 ? 'selected' : ''}>User</option>
          </select>
          <small style="color: #64748b; font-size: 12px; margin-top: 4px; display: block;">
            Để trống sẽ tự động gán vai trò USER
          </small>
        </div>

        <div class="form-group">
          <label class="form-label" for="${this.config.formId}-idchiNhanh">
            Chi nhánh
          </label>
          <input 
            type="number" 
            class="form-input" 
            id="${this.config.formId}-idchiNhanh" 
            name="idchiNhanh"
            value="${userData.idchiNhanh || ''}"
            placeholder="ID chi nhánh (tùy chọn)"
          />
        </div>

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
    
    // Convert FormData to object and handle empty values
    for (const [key, value] of formData.entries()) {
      if (value === '') {
        data[key] = null;
      } else if (key === 'idvaiTro' || key === 'idchiNhanh') {
        // Convert to number if not empty
        data[key] = value ? parseInt(value) : null;
      } else {
        data[key] = value;
      }
    }

    console.log('Form data to submit:', data); // Debug log

    // Validate
    if (!this.validate(data)) {
      return;
    }

    // Show loading state
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
    // Username validation
    if (!data.tenDangNhap || data.tenDangNhap.trim().length < 3) {
      this.showError('Tên đăng nhập phải có ít nhất 3 ký tự');
      return false;
    }

    // Name validation
    if (!data.hoTen || data.hoTen.trim().length < 2) {
      this.showError('Họ tên phải có ít nhất 2 ký tự');
      return false;
    }

    // Password validation (only for create mode)
    if (this.config.mode === 'create' && (!data.matKhau || data.matKhau.length < 6)) {
      this.showError('Mật khẩu phải có ít nhất 6 ký tự');
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
        // Don't enable username input in edit mode
        if (!(this.config.mode === 'edit' && input.name === 'tenDangNhap')) {
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
    if (form) {
      form.reset();
    }
  }

  getFormData() {
    const form = document.getElementById(this.config.formId);
    if (!form) return null;

    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value || null;
    }
    
    return data;
  }

  destroy() {
    const form = document.getElementById(this.config.formId);
    if (form) {
      form.remove();
    }
  }
}