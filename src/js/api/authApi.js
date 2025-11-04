import { CONFIG } from "../../config.js";

export async function login(tenDangNhap, matKhau){
    const response = await fetch(`${CONFIG.API_BASE_URL}/v1/auth/login`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({tenDangNhap, matKhau})
    });

    if(!response.ok){
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Đăng nhập thất bại.");
    } 
    
    return await response.json();
}