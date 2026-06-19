(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(target) {
        if (!slides.length) {
          return;
        }
        index = (target + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      function start() {
        stop();
        timer = setInterval(function() {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
        }
      }

      dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          show(Number(dot.getAttribute('data-hero-dot') || 0));
          start();
        });
      });

      if (prev) {
        prev.addEventListener('click', function() {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function() {
          show(index + 1);
          start();
        });
      }

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    var input = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var selects = {
      category: document.querySelector('[data-filter-category]'),
      year: document.querySelector('[data-filter-year]'),
      region: document.querySelector('[data-filter-region]'),
      type: document.querySelector('[data-filter-type]')
    };

    if (input && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }

      function normalized(value) {
        return String(value || '').toLowerCase().trim();
      }

      function applyFilters() {
        var q = normalized(input.value);
        var category = selects.category ? normalized(selects.category.value) : '';
        var year = selects.year ? normalized(selects.year.value) : '';
        var region = selects.region ? normalized(selects.region.value) : '';
        var type = selects.type ? normalized(selects.type.value) : '';

        cards.forEach(function(card) {
          var haystack = normalized([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category'),
            card.textContent
          ].join(' '));
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (category && normalized(card.getAttribute('data-category')) !== category) {
            ok = false;
          }
          if (year && normalized(card.getAttribute('data-year')) !== year) {
            ok = false;
          }
          if (region && normalized(card.getAttribute('data-region')) !== region) {
            ok = false;
          }
          if (type && normalized(card.getAttribute('data-type')) !== type) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
        });
      }

      input.addEventListener('input', applyFilters);
      Object.keys(selects).forEach(function(key) {
        if (selects[key]) {
          selects[key].addEventListener('change', applyFilters);
        }
      });
      applyFilters();
    }
  });
})();
