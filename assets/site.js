(function () {
  function matchCard(card, query, filters) {
    var text = (card.getAttribute('data-text') || '').toLowerCase();
    var title = (card.getAttribute('data-title') || '').toLowerCase();
    var ok = true;
    if (query) {
      ok = text.indexOf(query) !== -1 || title.indexOf(query) !== -1;
    }
    Object.keys(filters).forEach(function (key) {
      if (!filters[key]) {
        return;
      }
      if ((card.getAttribute('data-' + key) || '') !== filters[key]) {
        ok = false;
      }
    });
    return ok;
  }

  function applyFilters(scope) {
    var search = scope.querySelector('.site-search');
    var filters = {};
    scope.querySelectorAll('.site-filter').forEach(function (select) {
      var key = select.getAttribute('data-filter');
      filters[key] = select.value;
    });
    var query = search ? search.value.trim().toLowerCase() : '';
    scope.querySelectorAll('.movie-card').forEach(function (card) {
      card.classList.toggle('is-hidden', !matchCard(card, query, filters));
    });
  }

  document.addEventListener('click', function (event) {
    var toggle = event.target.closest('.js-menu-toggle');
    if (toggle) {
      var menu = document.querySelector('.js-mobile-menu');
      if (menu) {
        menu.classList.toggle('hidden');
      }
    }
  });

  document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
    scope.addEventListener('input', function (event) {
      if (event.target.matches('.site-search')) {
        applyFilters(scope);
      }
    });
    scope.addEventListener('change', function (event) {
      if (event.target.matches('.site-filter')) {
        applyFilters(scope);
      }
    });
  });
})();

function initMoviePlayer(src) {
  var video = document.getElementById('movie-player');
  var cover = document.getElementById('player-cover');
  var loading = document.getElementById('player-loading');
  var toggle = document.getElementById('player-toggle');
  var mute = document.getElementById('player-mute');
  var full = document.getElementById('player-fullscreen');
  var ready = false;
  var started = false;

  if (!video) {
    return;
  }

  function hideLoading() {
    if (loading) {
      loading.classList.add('hidden');
    }
  }

  function markReady() {
    ready = true;
    hideLoading();
  }

  function setup() {
    if (ready) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', markReady, { once: true });
      setTimeout(markReady, 1200);
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, markReady);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          hideLoading();
        }
      });
      return;
    }
    video.src = src;
    setTimeout(markReady, 800);
  }

  function play() {
    setup();
    if (cover) {
      cover.classList.add('hidden');
    }
    started = true;
    var action = video.play();
    if (action && action.catch) {
      action.catch(function () {});
    }
  }

  function togglePlay() {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  }

  video.addEventListener('click', togglePlay);
  video.addEventListener('play', function () {
    if (toggle) {
      toggle.textContent = 'Ⅱ';
    }
    if (cover && started) {
      cover.classList.add('hidden');
    }
  });
  video.addEventListener('pause', function () {
    if (toggle) {
      toggle.textContent = '▶';
    }
  });
  video.addEventListener('canplay', markReady);

  if (cover) {
    cover.addEventListener('click', play);
  }
  if (toggle) {
    toggle.addEventListener('click', togglePlay);
  }
  if (mute) {
    mute.addEventListener('click', function () {
      video.muted = !video.muted;
      mute.textContent = video.muted ? '🔇' : '🔊';
    });
  }
  if (full) {
    full.addEventListener('click', function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    });
  }

  setup();
}
