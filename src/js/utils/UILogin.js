export function showAlert(message, type) {
  const alertMessage = document.getElementById("alertMessage");
  alertMessage.textContent = message;
  alertMessage.className = `login__alert login__alert--show login__alert--${type}`;
  
  setTimeout(() => {
    alertMessage.className = "login__alert";
  }, 2000);
}

export function setLoadingState(isLoading) {
  const loginButton = document.getElementById("loginButton");
  const usernameInput = document.getElementById("tenDangNhap");
  const passwordInput = document.getElementById("matKhau");

  if (isLoading) {
    loginButton.classList.add("login__button--loading");
    loginButton.disabled = true;
    usernameInput.disabled = true;
    passwordInput.disabled = true;
  } else {
    loginButton.classList.remove("login__button--loading");
    loginButton.disabled = false;
    usernameInput.disabled = false;
    passwordInput.disabled = false;
  }
}
