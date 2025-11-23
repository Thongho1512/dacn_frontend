# Changelog - Các Tính Năng Frontend Mới

## Tóm tắt

Đã triển khai các tính năng cập nhật (Update) và xóa (Delete) cho các quản lý hàng hóa trong hệ thống quản lý bán thuốc.

---

## 1. **Đơn Nhập Hàng (DonNhapHang)**

### ✅ Tính năng mới:

- **Chỉnh sửa đơn nhập hàng (Update)**

  - Cấp nhật nhà cung cấp, số đơn nhập, ngày nhập
  - Thêm/sửa/xóa lô hàng trong đơn
  - Tự động cập nhật tồn kho tương ứng
  - Nút "✏️ Sửa" trên mỗi hàng trong bảng

- **Xóa đơn nhập hàng (Delete)**
  - Kiểm tra và hoàn trả tồn kho
  - Xác nhận trước khi xóa
  - Nút "🗑️ Xóa" trên mỗi hàng trong bảng

### 🔧 API Endpoints:

- `PUT /v1/donnhaphangs/{id}` - Cập nhật đơn nhập hàng
- `DELETE /v1/donnhaphangs/{id}` - Xóa đơn nhập hàng

### 📝 Các hàm JavaScript bổ sung:

```javascript
window.editImportOrder(orderId); // Mở form chỉnh sửa
window.deleteImportOrder(orderId); // Xóa đơn nhập hàng
fillEditForm(order); // Điền dữ liệu vào form
renderBatchDetailsForEdit(); // Render chi tiết lô hàng khi sửa
formatDateForInput(dateValue); // Chuyển định dạng ngày cho input
```

### 📋 File được sửa:

- `src/js/api/donNhapHangApi.js` - Thêm updateDonNhapHang(), deleteDonNhapHang()
- `src/js/pages/admin/DonNhapHang.js` - Thêm logic Edit & Delete

---

## 2. **Lô Hàng (LoHang)**

### ✅ Tính năng mới:

- **Tạo lô hàng thủ công (Create)**

  - Tạo lô hàng không qua đơn nhập
  - Validate thuốc, chi nhánh, ngày hết hạn
  - Tự động tạo/cập nhật kho hàng
  - Nút "✨ Tạo lô hàng" ở góc trên cùng

- **Xóa lô hàng (Delete)**
  - Kiểm tra không còn tồn kho
  - Chỉ xóa khi số lượng tồn = 0
  - Nút "🗑️ Xóa" trên mỗi hàng trong bảng

### 🔧 API Endpoints:

- `POST /v1/lohangs?idChiNhanh={id}` - Tạo lô hàng thủ công
- `DELETE /v1/lohangs/{id}` - Xóa lô hàng

### 📝 Các hàm JavaScript bổ sung:

```javascript
openAddBatchModal(); // Mở form tạo lô hàng
handleAddBatchSubmit(e); // Xử lý submit form tạo
window.deleteBatch(batchId); // Xóa lô hàng
```

### 📋 File được sửa:

- `src/js/api/loHangApi.js` - Thêm createLoHang(), deleteLoHang()
- `src/js/pages/admin/loHang.js` - Thêm logic Create & Delete

---

## 3. **Kho Hàng (KhoHang)**

### ✅ Tính năng mới:

- **Tạo kho hàng thủ công (Create)**

  - Validate chi nhánh và lô hàng
  - Kiểm tra không trùng lặp
  - Nút "✨ Tạo kho hàng" ở góc trên cùng

- **Xóa kho hàng (Delete)**
  - Chỉ xóa khi số lượng tồn = 0
  - Nút "🗑️ Xóa" trên mỗi hàng trong bảng

### 🔧 API Endpoints:

- `POST /v1/khohangs` - Tạo kho hàng thủ công
- `DELETE /v1/khohangs/{id}` - Xóa kho hàng

### 📝 Các hàm JavaScript bổ sung:

```javascript
openAddStockModal(); // Mở form tạo kho hàng
handleAddStockSubmit(e); // Xử lý submit form tạo
window.deleteStock(stockId); // Xóa kho hàng
```

### 📋 File được sửa:

- `src/js/api/khoHangApi.js` - Thêm createKhoHang(), deleteKhoHang()
- `src/js/pages/admin/khoHang.js` - Thêm logic Create & Delete

---

## 4. **Đơn Hàng (DonHang)**

### ✅ Tính năng mới:

- **Cập nhật đơn hàng (Update)** - Chỉ Admin/Manager
  - Hoàn trả tồn kho và điểm tích lũy của đơn cũ
  - Tính toán lại tổng tiền, giảm giá, điểm mới
  - Trừ tồn kho mới theo FEFO
  - Cập nhật lại điểm tích lũy
  - Nút "✏️ Sửa" trên mỗi hàng trong bảng

### 🔧 API Endpoints:

- `PUT /v1/donhangs/{id}` - Cập nhật đơn hàng

### 📝 Các hàm JavaScript bổ sung:

```javascript
window.editOrder(orderId); // Mở form chỉnh sửa
fillOrderEditForm(order); // Điền dữ liệu vào form
renderOrderDetailsForEdit(); // Render chi tiết sản phẩm khi sửa
```

### 📋 File được sửa:

- `src/js/api/donHangApi.js` - Thêm updateDonHang()
- `src/js/pages/admin/donHang.js` - Thêm logic Update

---

## 📊 Tóm tắt các phương thức API được thêm

| Module            | Method            | Endpoint                     | Mô tả             |
| ----------------- | ----------------- | ---------------------------- | ----------------- |
| donNhapHangApi.js | updateDonNhapHang | PUT /v1/donnhaphangs/{id}    | Cập nhật đơn nhập |
| donNhapHangApi.js | deleteDonNhapHang | DELETE /v1/donnhaphangs/{id} | Xóa đơn nhập      |
| loHangApi.js      | createLoHang      | POST /v1/lohangs             | Tạo lô hàng       |
| loHangApi.js      | deleteLoHang      | DELETE /v1/lohangs/{id}      | Xóa lô hàng       |
| khoHangApi.js     | createKhoHang     | POST /v1/khohangs            | Tạo kho hàng      |
| khoHangApi.js     | deleteKhoHang     | DELETE /v1/khohangs/{id}     | Xóa kho hàng      |
| donHangApi.js     | updateDonHang     | PUT /v1/donhangs/{id}        | Cập nhật đơn hàng |

---

## 🎨 Giao diện

### Các nút bổ sung:

- **"✏️ Sửa"** - Mở modal chỉnh sửa
- **"🗑️ Xóa"** - Xóa dữ liệu (có xác nhận)
- **"✨ Tạo"** - Tạo dữ liệu mới (cho LoHang & KhoHang)

### Modal/Form mới:

1. **Sửa Đơn Nhập Hàng** - Form với danh sách lô hàng có thể sửa/xóa
2. **Tạo Lô Hàng** - Form đơn giản với các trường cơ bản
3. **Tạo Kho Hàng** - Form chọn chi nhánh, lô hàng, nhập tồn kho

---

## ✅ Validation

Tất cả form đều có validation:

- Kiểm tra các trường bắt buộc
- Validate ngày tháng (ngày hết hạn > ngày sản xuất)
- Validate số lượng, giá (>= 0)
- Kiểm tra trùng lặp (số đơn nhập, lô hàng tại chi nhánh)

---

## 🔐 Quyền hạn

- **Update DonNhapHang**: WAREHOUSE_STAFF (Admin, Manager, Warehouse Staff)
- **Delete DonNhapHang**: AdminOrManager
- **Create/Delete LoHang**: WAREHOUSE_STAFF / AdminOrManager
- **Create/Delete KhoHang**: WAREHOUSE_STAFF / AdminOrManager
- **Update DonHang**: AdminOrManager

---

## 📝 Hướng dẫn sử dụng

### Chỉnh sửa Đơn Nhập Hàng:

1. Vào trang "Đơn Nhập Hàng"
2. Tìm đơn cần sửa
3. Nhấn "✏️ Sửa"
4. Thay đổi thông tin, thêm/xóa lô hàng
5. Nhấn "💾 Cập nhật"

### Xóa Đơn Nhập Hàng:

1. Vào trang "Đơn Nhập Hàng"
2. Tìm đơn cần xóa
3. Nhấn "🗑️ Xóa"
4. Xác nhận xóa

### Tạo Lô Hàng Thủ Công:

1. Vào trang "Lô Hàng"
2. Nhấn "✨ Tạo lô hàng"
3. Chọn chi nhánh, thuốc
4. Nhập thông tin lô (số lô, ngày, số lượng, giá)
5. Nhấn "✅ Tạo lô hàng"

### Tạo Kho Hàng:

1. Vào trang "Kho Hàng"
2. Nhấn "✨ Tạo kho hàng"
3. Chọn chi nhánh, lô hàng
4. Nhập tồn kho tối thiểu, số lượng tồn
5. Nhấn "✅ Tạo kho hàng"

### Cập nhật Đơn Hàng:

1. Vào trang "Đơn Hàng"
2. Tìm đơn cần sửa
3. Nhấn "✏️ Sửa"
4. Thay đổi khách hàng, phương thức thanh toán, sản phẩm
5. Nhấn "💾 Cập nhật"

---

## 🐛 Lưu ý

- Tất cả thao tác cập nhật/xóa đều có xác nhận trước thực hiện
- Khi xóa, hệ thống sẽ kiểm tra điều kiện (ví dụ: tồn kho không được > 0)
- Các thay đổi được cập nhật ngay lập tức trên giao diện
- Hiển thị thông báo kết quả (thành công/lỗi) cho người dùng

---

## 📚 Tệp tin được sửa đổi

```
frontend/
├── src/js/api/
│   ├── donNhapHangApi.js (✏️ Sửa)
│   ├── loHangApi.js (✏️ Sửa)
│   ├── khoHangApi.js (✏️ Sửa)
│   └── donHangApi.js (✏️ Sửa)
└── src/js/pages/admin/
    ├── DonNhapHang.js (✏️ Sửa)
    ├── loHang.js (✏️ Sửa)
    ├── khoHang.js (✏️ Sửa)
    └── donHang.js (✏️ Sửa)
```

---

**Cập nhật lần cuối:** 23/11/2025
**Phiên bản:** 1.0.0
