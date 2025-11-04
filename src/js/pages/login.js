import {login} from "../api/authApi.js";

// dom elements
const loginForm = document.getElementById('loginForm');
const loginButton = document.getElementById('loginButton');
const alertMessage = document.getElementById('alertMessagge');
const tenDangNhapInput = document.getElementById('tenDangNhap');
const matKhauInput = document.getElementById('matKhau');

// Hiển thị thông báo cho người dùng
function showAlert(message, type){
    alertMessage.textContent = message;
    alertMessage.className = `login__alert login__alert--show login__alert--${type}`;

    setTimeoout(() =>{
        alertMessage.className = 'login__alert';
    }), 2000;
}

// Hiển thị trạng thái loading khi đăng nhập
function setLoadingState(isLoading){
    if(isLoading){
        loginButton.classList.add('login_button--loading');
        loginButton.disabled = true;
        tenDangNhapInput.disabled = true;
        matKhauInput.disabled = true;
    } else{
        loginButton.classList.remove('login__button--loading');
        loginButton.disabled = false;
        tenDangNhapInput.disabled = false;
        matKhauInput.disabled = false;
    }
}

// xử lý sự kiện submit 
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const tenDangNhap = tenDangNhapInput.value.trim();
    const matKhau = matKhauInput.value.trim();

    if(!tenDangNhap || !matKhau){
        showAlert('Vui lòng nhập đầy đủ thông tin đăng nhập', 'error');
        return;
    }

    setLoadingState(true);

    try{
        const response = await login(tenDangNhap, matKhau);
        showAlert('Đăng nhập thành công! Đang chuyển hướng ...', 'success');
        
        if(response.accessToken){
            localStorage.setItem('accessToken', response.accessToken);  
        }

        if(response.refreshToken){
            localStorage.setItem('refreshToken', response.refreshToken);
        }

        if(response.nguoiDungDto){
            localStorage.setItem('nguoiDungDto', response.nguoiDungDto);
        }

        setTimeout(() => {
            window.location.href='/dashboard.html';
        }, 1500);
    } catch (error){
        console.error('Lỗi đăng nhập:', error);
        showAlert('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.', 'error');
    } finally{
        setLoadingState(false);
    }
});

// xóa thông báo khi người dùng nhập lại
[tenDangNhapInput, matKhauInput].forEach(input => {
    input.addEventListener('input', () => {
        if(alertMessage.classList.contains('login__alert--show')){
            alertMessage.className = 'login__alert';
        }
    });
})