function initMoviePlayer(src) {
  var box = document.querySelector('[data-player]');
  if (!box) {
    return;
  }
  var video = box.querySelector('video');
  var overlay = box.querySelector('[data-play-overlay]');
  var hls = null;

  function attach() {
    if (!video || video.getAttribute('data-loaded') === '1') {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function(event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else {
      video.src = src;
    }
    video.setAttribute('data-loaded', '1');
  }

  function play() {
    attach();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function() {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  function toggle() {
    if (!video) {
      return;
    }
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function(event) {
      if (event.target === video) {
        toggle();
      }
    });
    video.addEventListener('play', function() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function() {
      if (video.currentTime === 0 && overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
  }
}
