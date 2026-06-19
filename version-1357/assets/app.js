(function () {
  var body = document.body;
  var toggle = document.querySelector(".menu-toggle");

  if (toggle) {
    toggle.addEventListener("click", function () {
      var opened = body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  document.querySelectorAll(".mobile-link").forEach(function (link) {
    link.addEventListener("click", function () {
      body.classList.remove("menu-open");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        startTimer();
      });
    });

    show(0);
    startTimer();
  });

  document.querySelectorAll(".filter-panel").forEach(function (panel) {
    var scope = panel.parentElement;
    var input = panel.querySelector(".filter-input");
    var selects = Array.prototype.slice.call(panel.querySelectorAll(".filter-select"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".filter-list .movie-card"));

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : "");
      var category = "";
      var year = "";

      selects.forEach(function (select) {
        if (select.getAttribute("data-filter") === "category") {
          category = normalize(select.value);
        }
        if (select.getAttribute("data-filter") === "year") {
          year = normalize(select.value);
        }
      });

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-category"),
          card.getAttribute("data-year")
        ].join(" "));
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okCategory = !category || normalize(card.getAttribute("data-category")) === category;
        var okYear = !year || normalize(card.getAttribute("data-year")) === year;
        card.classList.toggle("filter-hidden", !(okKeyword && okCategory && okYear));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", applyFilter);
    });
  });

  document.querySelectorAll(".js-player").forEach(function (shell) {
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var started = false;
    var hlsInstance = null;

    if (!video) {
      return;
    }

    function beginPlay() {
      var stream = video.getAttribute("data-stream");

      if (!stream) {
        return;
      }

      if (cover) {
        cover.classList.add("is-hidden");
      }

      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = stream;
      video.play().catch(function () {});
    }

    if (cover) {
      cover.addEventListener("click", beginPlay);
    }

    video.addEventListener("click", function () {
      if (!started) {
        beginPlay();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
