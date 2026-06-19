(function () {
  const configEl = document.getElementById('player-config');
  const video = document.getElementById('movie-player');
  const layer = document.querySelector('[data-play-button]');

  if (!configEl || !video || !layer) {
    return;
  }

  let cfg;
  try {
    cfg = JSON.parse(configEl.textContent || '{}');
  } catch (err) {
    cfg = {};
  }

  let ready = false;
  let hls = null;

  function attach() {
    if (ready || !cfg.src) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = cfg.src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(cfg.src);
      hls.attachMedia(video);
    } else {
      video.src = cfg.src;
    }

    ready = true;
  }

  function start() {
    attach();
    layer.classList.add('is-hidden');
    const playing = video.play();
    if (playing && typeof playing.catch === 'function') {
      playing.catch(function () {
        layer.classList.remove('is-hidden');
      });
    }
  }

  layer.addEventListener('click', start);

  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    layer.classList.add('is-hidden');
  });

  video.addEventListener('ended', function () {
    layer.classList.remove('is-hidden');
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
