(function () {
  window.initMoviePlayer = function (videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    if (!video || !sourceUrl) {
      return;
    }

    var shell = video.closest('.player-shell');
    var overlay = shell ? shell.querySelector('.player-overlay') : null;
    var buttons = shell ? shell.querySelectorAll('[data-play-button]') : [];
    var loaded = false;
    var hlsInstance = null;

    function attachSource() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else {
        video.src = sourceUrl;
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function showOverlay() {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    }

    function startPlayback() {
      attachSource();
      hideOverlay();
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          showOverlay();
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
      });
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('ended', showOverlay);

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
