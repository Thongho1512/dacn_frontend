import { apiFetch } from "../api/baseApi.js";
import { saveAccessToken, removeAccessToken, getAccessToken } from "../utils/token.js";
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
  try {
    // Call logout API
    await apiFetch("v1/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clean up local storage
    removeAccessToken();
    
    // Clear all session storage
    sessionStorage.clear();
    
    // Clear browser cache for this origin (if supported)
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Force reload and redirect to login
    // Using replace to prevent back button issues
    window.location.replace("/src/pages/login.html");
  }
}

/**
 * Check if user is authenticated
 * Redirect to login if not authenticated
 */
export function requireAuth() {
  const token = getAccessToken();
  
  if (!token) {
    window.location.replace("/src/pages/login.html");
    return false;
  }
  
  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    
    if (Date.now() >= exp) {
      removeAccessToken();
      window.location.replace("/src/pages/login.html");
      return false;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    removeAccessToken();
    window.location.replace("/src/pages/login.html");
    return false;
  }
  
  return true;
}

/**
 * Check if user is authenticated (without redirect)
 */
export function isAuthenticated() {
  const token = getAccessToken();
  
  if (!token) {
    return false;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() < exp;
  } catch (error) {
    return false;
  }
}