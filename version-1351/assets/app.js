(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });
    showSlide(0);
    startTimer();
  }

  function applyFilter(value) {
    var list = document.querySelector('[data-filter-list]');
    if (!list) return false;
    var keyword = String(value || '').trim().toLowerCase();
    var items = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));
    items.forEach(function (item) {
      var text = String(item.getAttribute('data-search') || '').toLowerCase();
      item.classList.toggle('is-filtered-out', keyword && text.indexOf(keyword) === -1);
    });
    return true;
  }

  var params = new URLSearchParams(window.location.search);
  var queryValue = params.get('q') || '';
  if (queryValue) {
    var searchInput = document.querySelector('.local-filter-form input[name="q"]');
    if (searchInput) searchInput.value = queryValue;
    applyFilter(queryValue);
  }

  Array.prototype.slice.call(document.querySelectorAll('.site-search-form')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value : '';
      if (form.classList.contains('local-filter-form')) {
        event.preventDefault();
        applyFilter(value);
      }
    });
  });

  var video = document.querySelector('[data-m3u8]');
  var button = document.querySelector('[data-player-button]');
  var playerReady = false;

  function prepareVideo() {
    if (!video || playerReady) return;
    var src = video.getAttribute('data-m3u8');
    if (!src) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      playerReady = true;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      playerReady = true;
      return;
    }
    video.src = src;
    playerReady = true;
  }

  function playVideo() {
    prepareVideo();
    if (button) button.classList.add('is-hidden');
    if (video) {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (!playerReady) playVideo();
    });
  }
})();
