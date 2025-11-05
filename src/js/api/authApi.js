import { apiFetch } from "../api/baseApi.js";
import { saveAccessToken, removeAccessToken } from "../utils/token.js";
import { API_BASE_URL } from "../config.js";

export async function login(username, password) {
  const res = await fetch(`${API_BASE_URL}v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // send refreshToken cookie
    body: JSON.stringify({ tenDangNhap: username, matKhau: password }),
  });

  if (!res.ok) throw new Error("Đăng nhập thất bại");

  const data = await res.json();
  saveAccessToken(data.accessToken);
  return data;
}

export async function logout() {
  await apiFetch("v1/auth/logout", { method: "POST" });
  removeAccessToken();
}
