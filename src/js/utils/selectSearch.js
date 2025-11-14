// src/js/utils/selectSearch.js
// Inline searchable combobox enhancer
// Replaces a native <select> with a lightweight combobox UI that contains
// a search input inside the dropdown. The original <select> is kept (hidden)
// so form submission and existing code that reads select.value continue to work.

export function enhanceSelect(originalSelect) {
  if (!originalSelect || originalSelect.dataset.enhanced === 'true') return;
  originalSelect.dataset.enhanced = 'true';

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'combobox-wrapper';
  wrapper.style.position = 'relative';
  wrapper.style.display = getComputedStyle(originalSelect).display === 'block' ? 'block' : 'inline-block';
  wrapper.style.width = originalSelect.style.width || '';

  // Hide original select but keep it in DOM for form submission
  originalSelect.style.display = 'none';

  // Create control (visible element)
  const control = document.createElement('div');
  control.className = 'combobox-control';
  control.tabIndex = 0;
  control.setAttribute('role', 'combobox');
  control.setAttribute('aria-haspopup', 'listbox');
  control.setAttribute('aria-expanded', 'false');

  const controlText = document.createElement('span');
  controlText.className = 'combobox-text';
  control.appendChild(controlText);

  const caret = document.createElement('span');
  caret.className = 'combobox-caret';
  caret.innerHTML = '▾';
  control.appendChild(caret);

  // Create dropdown (append to document.body to avoid being clipped by overflow)
  const dropdown = document.createElement('div');
  dropdown.className = 'combobox-dropdown';
  dropdown.setAttribute('role', 'listbox');
  dropdown.style.position = 'fixed';
  dropdown.style.zIndex = '999999';
  dropdown.style.display = 'none';
  dropdown.style.minWidth = '200px';
  dropdown.style.maxHeight = '260px';
  dropdown.style.overflow = 'auto';
  dropdown.style.background = '#fff';
  dropdown.style.border = '1px solid #d1d5db';
  dropdown.style.borderRadius = '6px';
  dropdown.style.boxShadow = '0 6px 18px rgba(15,23,42,0.08)';
  dropdown.style.pointerEvents = 'auto';

  // Search input inside dropdown
  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'combobox-search';
  search.placeholder = 'Tìm kiếm...';
  search.style.width = '100%';
  search.style.boxSizing = 'border-box';
  search.style.padding = '8px 10px';
  search.style.border = 'none';
  search.style.borderBottom = '1px solid #e6e6e6';
  search.autocomplete = 'off';

  dropdown.appendChild(search);

  // Options list
  const list = document.createElement('div');
  list.className = 'combobox-list';
  list.style.maxHeight = '220px';
  list.style.overflow = 'auto';

  // Build items from original select options
  const buildItems = () => {
    list.innerHTML = '';
    Array.from(originalSelect.options).forEach((opt, idx) => {
      const item = document.createElement('div');
      item.className = 'combobox-item';
      item.dataset.value = opt.value;
      item.textContent = opt.textContent;
      item.tabIndex = 0;
      item.style.padding = '8px 10px';
      item.style.cursor = 'pointer';
      item.style.whiteSpace = 'nowrap';

      if (opt.disabled) {
        item.style.opacity = '0.5';
        item.style.pointerEvents = 'none';
      }

      if (opt.selected) {
        item.classList.add('selected');
        controlText.textContent = opt.textContent;
      }

      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // set original select
        originalSelect.value = opt.value;
        // update display
        controlText.textContent = opt.textContent;
        // mark as selected
        Array.from(list.children).forEach(li => li.classList.remove('selected'));
        item.classList.add('selected');
        // close dropdown immediately
        dropdown.style.display = 'none';
        control.setAttribute('aria-expanded', 'false');
        search.value = '';
        filter('');
        // trigger change
        originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          item.click();
        }
        if (e.key === 'ArrowDown') { 
          e.preventDefault(); 
          item.nextSibling?.focus(); 
        }
        if (e.key === 'ArrowUp') { 
          e.preventDefault(); 
          item.previousSibling?.focus(); 
        }
      });

      list.appendChild(item);
    });
  };

  dropdown.appendChild(list);

  // Insert elements
  originalSelect.parentNode.insertBefore(wrapper, originalSelect);
  wrapper.appendChild(originalSelect);
  wrapper.appendChild(control);
  document.body.appendChild(dropdown);

  // Open/close
  const openDropdown = () => {
    // Close any other open dropdowns first
    document.querySelectorAll('.combobox-dropdown[style*="display: block"]').forEach(dd => {
      if (dd !== dropdown) {
        dd.style.display = 'none';
        const ctrl = dd.previousElementSibling;
        if (ctrl) ctrl.setAttribute('aria-expanded', 'false');
      }
    });

    // Position dropdown below the control
    try {
      const rect = control.getBoundingClientRect();
      dropdown.style.minWidth = rect.width + 'px';
      dropdown.style.left = Math.max(8, rect.left) + 'px';
      dropdown.style.top = (rect.bottom + 4) + 'px';
    } catch (e) {
      // ignore
    }
    dropdown.style.display = 'block';
    control.setAttribute('aria-expanded', 'true');
    setTimeout(() => search.focus(), 0);
  };

  const closeDropdown = () => {
    dropdown.style.display = 'none';
    control.setAttribute('aria-expanded', 'false');
    search.value = '';
    filter('');
  };

  // Filter function
  const filter = (q) => {
    const term = (q || '').trim().toLowerCase();
    Array.from(list.children).forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = (term === '' || text.indexOf(term) !== -1) ? '' : 'none';
    });
  };

  // Event listeners
  control.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropdown.style.display === 'block') {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  control.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { 
      e.preventDefault(); 
      openDropdown(); 
      const first = list.querySelector('.combobox-item:not([style*="display: none"])'); 
      if (first) first.focus(); 
    }
    if (e.key === 'Enter' || e.key === ' ') { 
      e.preventDefault(); 
      if (dropdown.style.display === 'block') {
        closeDropdown();
      } else {
        openDropdown();
      }
    }
  });

  search.addEventListener('input', (e) => filter(e.target.value));

  // Close when clicking outside
  const outsideHandler = (e) => {
    if (!wrapper.contains(e.target) && !dropdown.contains(e.target)) {
      if (dropdown.style.display === 'block') {
        closeDropdown();
      }
    }
  };
  
  setTimeout(() => {
    document.addEventListener('pointerdown', outsideHandler);
    document.addEventListener('mousedown', outsideHandler);
  }, 100);

  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === 'Escape' && dropdown.style.display === 'block') {
      closeDropdown();
      control.focus();
    }
  };
  document.addEventListener('keydown', escapeHandler);

  // Reposition on scroll/resize
  const onScrollResize = () => {
    if (dropdown.style.display === 'block') {
      try {
        const rect = control.getBoundingClientRect();
        dropdown.style.left = Math.max(8, rect.left) + 'px';
        dropdown.style.top = (rect.bottom + 4) + 'px';
        
        // Close if control is no longer visible
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          closeDropdown();
        }
      } catch (e) { 
        /* ignore */ 
      }
    }
  };
  window.addEventListener('scroll', onScrollResize, true);
  window.addEventListener('resize', onScrollResize);

  // Build initial items
  buildItems();

  // Observe changes to the original select
  try {
    const mo = new MutationObserver((mutationsList) => {
      let shouldRebuild = false;
      for (const m of mutationsList) {
        if (m.type === 'childList') { 
          shouldRebuild = true; 
          break; 
        }
      }
      if (shouldRebuild) {
        const prevSelected = originalSelect.selectedOptions[0]?.value;
        buildItems();
        if (prevSelected) {
          const opt = Array.from(originalSelect.options).find(o => o.value === prevSelected);
          if (opt) {
            originalSelect.value = prevSelected;
            originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }
    });
    mo.observe(originalSelect, { childList: true });
  } catch (e) {
    // ignore
  }

  // Keep original select changes in sync
  originalSelect.addEventListener('change', () => {
    const selected = originalSelect.selectedOptions[0];
    controlText.textContent = selected ? selected.textContent : '';
    Array.from(list.children).forEach(li => {
      li.classList.toggle('selected', li.dataset.value === (selected && selected.value));
    });
  });

  // Add minimal styles once
  if (!document.getElementById('combobox-styles')) {
    const style = document.createElement('style');
    style.id = 'combobox-styles';
    style.textContent = `
      .combobox-control { 
        padding: 8px 10px; 
        border: 1px solid #d1d5db; 
        border-radius: 6px; 
        background: #fff; 
        display:flex; 
        align-items:center; 
        justify-content:space-between; 
        min-width:160px; 
        cursor:pointer;
        position: relative;
        z-index: 1;
      }
      .combobox-control:focus { outline: 2px solid #60a5fa; }
      .combobox-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .combobox-caret { margin-left: 8px; color: #6b7280; }
      .combobox-dropdown { pointer-events: auto !important; }
      .combobox-dropdown .combobox-item:hover { background: #f1f5f9; }
      .combobox-item.selected { background: #e6f4ff; font-weight:600; }
      .combobox-item:active { background: #dbeafe; }
    `;
    document.head.appendChild(style);
  }
}

export function enhanceAllSelects(root = document) {
  try {
    const container = root instanceof Element ? root : document;
    const selects = container.querySelectorAll('select');
    selects.forEach(s => enhanceSelect(s));
  } catch (e) {
    console.error('enhanceAllSelects error', e);
  }
}

// Auto-enhance on DOMContentLoaded
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    try { 
      enhanceAllSelects(document); 
    } catch (e) { 
      /* ignore */ 
    }
  });
}

// Global observer: automatically enhance newly added <select> elements
if (typeof window !== 'undefined') {
  try {
    const globalObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type !== 'childList') continue;
        for (const node of m.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.tagName === 'SELECT') {
            if (!node.dataset.enhanced) enhanceSelect(node);
          }
          const selects = node.querySelectorAll ? node.querySelectorAll('select:not([data-enhanced])') : [];
          selects.forEach(s => enhanceSelect(s));
        }
      }
    });

    globalObserver.observe(document.body, { childList: true, subtree: true });
  } catch (e) {
    // ignore
  }
}