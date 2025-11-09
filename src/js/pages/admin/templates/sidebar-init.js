export const initSidebar = (pageId) => {
  const sidebar = new Sidebar({
    activeItem: pageId
  });

  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = sidebar.render();
    sidebar.attachEventListeners();
  }
};