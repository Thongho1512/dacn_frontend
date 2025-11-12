import { login } from "../api/authApi.js";
import { showAlert, setLoadingState } from "../utils/UILogin.js";

const form = document.getElementById("loginForm");
const usernameInput = document.getElementById("tenDangNhap");
const passwordInput = document.getElementById("matKhau");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setLoadingState(true);

  try {
    const result = await login(usernameInput.value, passwordInput.value);
    showAlert("Đăng nhập thành công!", "success");

    // Chuyển hướng sang dashboard
    setTimeout(() => (window.location.href = "/index.html"), 1000);
  } catch (err) {
    showAlert("Sai tài khoản hoặc mật khẩu", "error");
  } finally {
    setLoadingState(false);
  }
});
