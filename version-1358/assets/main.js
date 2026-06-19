(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.mobile-panel');

  if (menuButton && panel) {
    menuButton.addEventListener('click', function () {
      const open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.style.opacity = '0';
    }, { once: true });
  });

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  const searchInput = document.querySelector('.filter-search');

  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  const filterCards = Array.from(document.querySelectorAll('.filter-card'));
  const selects = Array.from(document.querySelectorAll('.filter-select'));

  function uniqueValues(attr) {
    const values = new Set();
    filterCards.forEach(function (card) {
      const value = card.getAttribute('data-' + attr);
      if (value) {
        values.add(value);
      }
    });
    return Array.from(values).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-Hans-CN');
    });
  }

  selects.forEach(function (select) {
    const attr = select.getAttribute('data-filter');
    if (!attr || attr === 'category') {
      return;
    }
    uniqueValues(attr).forEach(function (value) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  });

  function applyFilters() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const active = {};

    selects.forEach(function (select) {
      const attr = select.getAttribute('data-filter');
      if (attr && select.value) {
        active[attr] = select.value;
      }
    });

    filterCards.forEach(function (card) {
      const text = (card.getAttribute('data-search-text') || '').toLowerCase();
      let visible = !query || text.indexOf(query) !== -1;

      Object.keys(active).forEach(function (attr) {
        if ((card.getAttribute('data-' + attr) || '') !== active[attr]) {
          visible = false;
        }
      });

      card.classList.toggle('is-hidden-by-filter', !visible);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  selects.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });

  if (filterCards.length) {
    applyFilters();
  }
})();
