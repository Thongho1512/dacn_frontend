import { renderHeader } from "./components/header.js";
import { renderSidebar } from "./components/sidebar.js";
import { renderFooter } from "./components/footer.js";
import { renderModal } from "./components/modal.js";

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("header").innerHTML = renderHeader();
  document.getElementById("sidebar").innerHTML = renderSidebar();
  document.getElementById("footer").innerHTML = renderFooter();
  document.getElementById("modal-root").innerHTML = renderModal();

  // Sidebar toggle
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const menuBtn = document.getElementById("mobile-menu-btn");

  menuBtn?.addEventListener("click", () => {
    sidebar.classList.toggle("mobile-open");
    overlay.classList.toggle("active");
  });

  overlay?.addEventListener("click", () => {
    sidebar.classList.remove("mobile-open");
    overlay.classList.remove("active");
  });
});
